import {
  Compass,
  ExternalLink,
  FileText,
  Layers,
  Locate,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  formatKoordinat,
  formatLuas,
  formatPersen,
  formatTanggalWaktu,
} from '../../lib/format';
import {
  ambilWarnaTokenCss,
  apakahKunciGoogleMapsTersedia,
  muatGoogleMapsLazy,
  petakanTipePetaGoogle,
  type GoogleMapInstanceMinimal,
  type GoogleMarkerInstanceMinimal,
} from '../../lib/pemuatGoogleMaps';
import {
  buatTautanNavigasiKoordinat,
  kelompokkanPenandaLaporan,
  labelZonaTematik,
  proyeksikanKeKanvasGis,
  simbolTingkatSerangan,
  type KlasterPenandaPeta,
  type LapisanDasarPeta,
} from '../../lib/petaGis';
import type {
  KonfigurasiKlasifikasi,
  Laporan,
  Wilayah,
} from '../../types/domain';
import {
  LencanaStatusVerifikasi,
  LencanaTingkatSerangan,
} from '../LencanaStatus';

interface PropsPetaOPT {
  daftarLaporan: Laporan[];
  daftarKabupaten: Wilayah[];
  konfigurasiKlasifikasi: KonfigurasiKlasifikasi;
  fokusKoordinat: { lat: number; lng: number; zoom?: number } | null;
  onBukaBeritaAcara: (laporan: Laporan) => void;
}

const PUSAT_AWAL_KALTIM = { lat: -0.05, lng: 116.45 };
const ZOOM_AWAL_KALTIM = 6;

const OPSI_LAPISAN: readonly { id: LapisanDasarPeta; label: string }[] = [
  { id: 'satelit', label: 'Citra Satelit' },
  { id: 'tematik', label: 'Peta Tematik' },
  { id: 'topografi', label: 'Kontur Topografi' },
];

/**
 * Komponen pembungkus tunggal <PetaOPT> (DESIGN.md §5 & AGENTS.md §11 no. 5).
 * Mengelola pemilih lapisan dasar, pengelompokan penanda (clustering), popup geotagging,
 * legenda tematik, serta pemuatan lazy Google Maps JS API dengan fallback kanvas GIS simulasi.
 */
export function PetaOPT({
  daftarLaporan,
  daftarKabupaten,
  konfigurasiKlasifikasi,
  fokusKoordinat,
  onBukaBeritaAcara,
}: PropsPetaOPT) {
  const [lapisan, setLapisan] = useState<LapisanDasarPeta>('tematik');
  const [pusat, setPusat] = useState<{ lat: number; lng: number }>(PUSAT_AWAL_KALTIM);
  const [zoom, setZoom] = useState<number>(ZOOM_AWAL_KALTIM);
  const [laporanTerpilihId, setLaporanTerpilihId] = useState<string | null>(null);

  // Mode Google Maps nyata (hanya dimuat lazy bila kunci terbatas tersedia & diaktifkan)
  const kunciTersedia = apakahKunciGoogleMapsTersedia();
  const [modeGoogleAktif, setModeGoogleAktif] = useState(false);
  const [sedangMemuatGoogle, setSedangMemuatGoogle] = useState(false);
  const [galatGoogleMaps, setGalatGoogleMaps] = useState<string | null>(null);

  const wadahGoogleRef = useRef<HTMLDivElement | null>(null);
  const petaGoogleRef = useRef<GoogleMapInstanceMinimal | null>(null);
  const daftarMarkerGoogleRef = useRef<GoogleMarkerInstanceMinimal[]>([]);

  // Sinkronisasi fokus saat pengguna memilih wilayah dari tabel kerentanan atau filter kabupaten
  useEffect(() => {
    if (!fokusKoordinat) return;
    const zoomBaru = fokusKoordinat.zoom ?? 9;
    setPusat({ lat: fokusKoordinat.lat, lng: fokusKoordinat.lng });
    setZoom(zoomBaru);
    if (petaGoogleRef.current) {
      petaGoogleRef.current.setCenter({
        lat: fokusKoordinat.lat,
        lng: fokusKoordinat.lng,
      });
      petaGoogleRef.current.setZoom(zoomBaru);
    }
  }, [fokusKoordinat]);

  // Pastikan laporan terpilih tetap sinkron terhadap daftar laporan terbaru (reaktif tanpa reload)
  const laporanPopup = useMemo(() => {
    if (!laporanTerpilihId) return null;
    return daftarLaporan.find((l) => l.id === laporanTerpilihId) ?? null;
  }, [daftarLaporan, laporanTerpilihId]);

  const daftarKlaster = useMemo(
    () => kelompokkanPenandaLaporan(daftarLaporan, zoom),
    [daftarLaporan, zoom]
  );

  // Inisialisasi lazy Google Maps saat diaktifkan pengguna
  const aktifkanGoogleMapsLazy = async () => {
    setGalatGoogleMaps(null);
    setSedangMemuatGoogle(true);
    try {
      const gmaps = await muatGoogleMapsLazy();
      setModeGoogleAktif(true);
      window.requestAnimationFrame(() => {
        if (!wadahGoogleRef.current) return;
        const mapInstance = new gmaps.Map(wadahGoogleRef.current, {
          center: pusat,
          zoom,
          mapTypeId: petakanTipePetaGoogle(lapisan),
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
        });
        mapInstance.addListener('zoom_changed', () => {
          const z = mapInstance.getZoom();
          if (typeof z === 'number') setZoom(z);
        });
        petaGoogleRef.current = mapInstance;
      });
    } catch (err) {
      setModeGoogleAktif(false);
      setGalatGoogleMaps(
        err instanceof Error
          ? err.message
          : 'Gagal mengaktifkan Google Maps. Menampilkan Kanvas GIS Simulasi.'
      );
    } finally {
      setSedangMemuatGoogle(false);
    }
  };

  // Sinkronisasi tipe lapisan dasar ke Google Maps bila aktif
  useEffect(() => {
    if (modeGoogleAktif && petaGoogleRef.current) {
      petaGoogleRef.current.setMapTypeId(petakanTipePetaGoogle(lapisan));
    }
  }, [lapisan, modeGoogleAktif]);

  // Sinkronisasi marker/klaster ke Google Maps bila aktif
  useEffect(() => {
    if (!modeGoogleAktif || !petaGoogleRef.current || !window.google?.maps) return;

    const gmaps = window.google.maps;
    const mapInstance = petaGoogleRef.current;

    for (const m of daftarMarkerGoogleRef.current) {
      m.setMap(null);
    }
    daftarMarkerGoogleRef.current = [];

    const warnaMerah = ambilWarnaTokenCss('--token-danger-600', 'rgb(200, 22, 29)');
    const warnaKuning = ambilWarnaTokenCss('--token-gold-500', 'rgb(245, 184, 0)');
    const warnaHijau = ambilWarnaTokenCss('--token-ok-500', 'rgb(46, 158, 87)');
    const warnaPutih = ambilWarnaTokenCss('--token-surface', 'rgb(255, 255, 255)');
    const warnaTeksGelap = ambilWarnaTokenCss('--token-ink-900', 'rgb(17, 24, 39)');

    for (const klaster of daftarKlaster) {
      const warnaIsi =
        klaster.tingkatDominan === 'berat'
          ? warnaMerah
          : klaster.tingkatDominan === 'sedang'
            ? warnaKuning
            : warnaHijau;

      const teksLabel =
        klaster.jumlah > 1
          ? String(klaster.jumlah)
          : simbolTingkatSerangan(klaster.tingkatDominan);

      const marker = new gmaps.Marker({
        position: { lat: klaster.lat, lng: klaster.lng },
        map: mapInstance,
        title:
          klaster.jumlah > 1
            ? `Klaster ${klaster.jumlah} titik laporan (${formatLuas(klaster.totalLuasSerangan)})`
            : `${klaster.laporanUtama.kode} — ${klaster.laporanUtama.namaDesa}`,
        label: {
          text: teksLabel,
          color: klaster.tingkatDominan === 'sedang' ? warnaTeksGelap : warnaPutih,
          fontWeight: '700',
          fontSize: '12px',
        },
        icon: {
          path: gmaps.SymbolPath.CIRCLE,
          fillColor: warnaIsi,
          fillOpacity: 0.95,
          strokeColor: warnaPutih,
          strokeWeight: 2.5,
          scale: klaster.jumlah > 1 ? 18 : 14,
        },
        zIndex: klaster.tingkatDominan === 'berat' ? 30 : klaster.tingkatDominan === 'sedang' ? 20 : 10,
      });

      marker.addListener('click', () => {
        tanganiKlikKlaster(klaster);
      });
      daftarMarkerGoogleRef.current.push(marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daftarKlaster, modeGoogleAktif]);

  const ubahZoom = (delta: number) => {
    const baru = Math.min(13, Math.max(6, zoom + delta));
    setZoom(baru);
    if (petaGoogleRef.current) {
      petaGoogleRef.current.setZoom(baru);
    }
  };

  const resetPandanganKaltim = () => {
    setPusat(PUSAT_AWAL_KALTIM);
    setZoom(ZOOM_AWAL_KALTIM);
    if (petaGoogleRef.current) {
      petaGoogleRef.current.setCenter(PUSAT_AWAL_KALTIM);
      petaGoogleRef.current.setZoom(ZOOM_AWAL_KALTIM);
    }
  };

  const tanganiKlikKlaster = (klaster: KlasterPenandaPeta) => {
    if (klaster.jumlah > 1 && zoom < 11) {
      const zoomDekat = Math.min(11, zoom + 2);
      setPusat({ lat: klaster.lat, lng: klaster.lng });
      setZoom(zoomDekat);
      if (petaGoogleRef.current) {
        petaGoogleRef.current.setCenter({ lat: klaster.lat, lng: klaster.lng });
        petaGoogleRef.current.setZoom(zoomDekat);
      }
      return;
    }
    setLaporanTerpilihId(klaster.laporanUtama.id);
    setPusat({ lat: klaster.laporanUtama.lat, lng: klaster.laporanUtama.lng });
    if (petaGoogleRef.current) {
      petaGoogleRef.current.setCenter({
        lat: klaster.laporanUtama.lat,
        lng: klaster.laporanUtama.lng,
      });
    }
  };

  const fotoPopup = useMemo(() => {
    if (!laporanPopup) return null;
    return laporanPopup.fotos[0]?.pratinjauUrl || null;
  }, [laporanPopup]);

  const rekomendasiRingkasPopup = useMemo(() => {
    if (!laporanPopup) return '';
    return (
      laporanPopup.rekomendasiHayati ||
      laporanPopup.rekomendasiKultur ||
      laporanPopup.rekomendasiKimiawi ||
      'Lakukan pengamatan intensif mingguan dan koordinasi pengendalian terpadu bersama UPTD.'
    );
  }, [laporanPopup]);

  return (
    <section
      aria-label="Peta sebaran spasial serangan OPT Kalimantan Timur"
      className="overflow-hidden rounded-2xl border border-line bg-surface"
    >
      {/* Baris Status Mode Peta & Aktivasi Lazy Google Maps (SECURITY.md §4) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas/70 px-3.5 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand-900">
            <Compass className="h-4 w-4 text-brand-700" aria-hidden />
            <span>
              {modeGoogleAktif
                ? 'Google Maps JavaScript API Aktif'
                : 'Kanvas Spasial Tematik WGS84 Kaltim (Simulasi)'}
            </span>
          </span>
          <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-ink-600">
            Zoom {zoom}x · {daftarKlaster.length} klaster/penanda ({daftarLaporan.length} laporan)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!kunciTersedia && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-600">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-700" aria-hidden />
              <span>VITE_GOOGLE_MAPS_KEY kosong — menggunakan peta simulasi aman</span>
            </span>
          )}
          {kunciTersedia && !modeGoogleAktif && (
            <button
              type="button"
              disabled={sedangMemuatGoogle}
              onClick={() => {
                void aktifkanGoogleMapsLazy();
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60 sm:min-h-[38px]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-gold-500" aria-hidden />
              <span>
                {sedangMemuatGoogle
                  ? 'Memuat Google Maps...'
                  : 'Aktifkan Google Maps (Kunci Terbatas)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {galatGoogleMaps && (
        <div
          role="alert"
          className="border-b border-line bg-gold-100 px-3.5 py-2 text-xs font-medium text-ink-900"
        >
          {galatGoogleMaps}
        </div>
      )}

      {/* BIDANG UTAMA PETA */}
      <div className="relative h-[520px] w-full overflow-hidden sm:h-[600px]">
        {/* Wadah Google Maps Nyata (saat modeGoogleAktif = true) */}
        <div
          ref={wadahGoogleRef}
          className={`h-full w-full ${modeGoogleAktif ? 'block' : 'hidden'}`}
        />

        {/* Kanvas Tematik Interaktif Simulasi WGS84 (saat modeGoogleAktif = false) */}
        {!modeGoogleAktif && (
          <div
            className={`relative h-full w-full select-none overflow-hidden transition-colors ${
              lapisan === 'satelit'
                ? 'bg-brand-900'
                : lapisan === 'topografi'
                  ? 'bg-gold-100/40'
                  : 'bg-info-100/55'
            }`}
          >
            {/* Vektor Latar Daratan, Kontur, Sungai Mahakam, & Grid Koordinat */}
            <svg
              viewBox="0 0 800 600"
              preserveAspectRatio="none"
              className="h-full w-full"
              aria-hidden
            >
              {/* Grid Lintang & Bujur */}
              <g
                stroke={
                  lapisan === 'satelit'
                    ? 'var(--token-brand-700)'
                    : 'var(--token-line)'
                }
                strokeWidth="1"
                strokeDasharray="5 5"
              >
                <line x1="160" y1="0" x2="160" y2="600" />
                <line x1="320" y1="0" x2="320" y2="600" />
                <line x1="480" y1="0" x2="480" y2="600" />
                <line x1="640" y1="0" x2="640" y2="600" />
                <line x1="0" y1="150" x2="800" y2="150" />
                <line x1="0" y1="300" x2="800" y2="300" />
                <line x1="0" y1="450" x2="800" y2="450" />
              </g>

              {/* Poligon Indikatif Provinsi Kalimantan Timur */}
              <path
                d="M 130 96 L 385 42 L 592 78 L 690 190 L 635 318 L 574 426 L 442 534 L 270 518 L 178 408 L 106 250 Z"
                fill={
                  lapisan === 'satelit'
                    ? 'var(--token-brand-700)'
                    : lapisan === 'topografi'
                      ? 'var(--token-ok-100)'
                      : 'var(--token-surface)'
                }
                stroke="var(--token-brand-700)"
                strokeWidth="2.5"
                opacity={lapisan === 'satelit' ? '0.9' : '0.95'}
              />

              {/* Garis Kontur Topografi Tambahan */}
              {lapisan === 'topografi' && (
                <g
                  fill="none"
                  stroke="var(--token-brand-700)"
                  strokeWidth="1"
                  strokeDasharray="8 4"
                  opacity="0.45"
                >
                  <ellipse cx="290" cy="240" rx="120" ry="78" />
                  <ellipse cx="290" cy="240" rx="75" ry="46" />
                  <ellipse cx="470" cy="160" rx="95" ry="54" />
                  <ellipse cx="380" cy="410" rx="110" ry="62" />
                </g>
              )}

              {/* Alur Sungai Mahakam Indikatif */}
              <path
                d="M 190 210 Q 310 260 410 315 T 598 338"
                fill="none"
                stroke="var(--token-info-100)"
                strokeWidth={lapisan === 'satelit' ? '4' : '5'}
                strokeLinecap="round"
              />

              {/* Garis Khatulistiwa (0° Lintang) */}
              <line
                x1="0"
                y1="294"
                x2="800"
                y2="294"
                stroke="var(--token-gold-500)"
                strokeWidth="1.5"
                strokeDasharray="10 5"
              />
            </svg>

            {/* Label Referensi Kabupaten/Kota pada Kanvas */}
            {daftarKabupaten.map((kab) => {
              if (kab.latPusat === undefined || kab.lngPusat === undefined) return null;
              const posKab = proyeksikanKeKanvasGis(
                kab.latPusat,
                kab.lngPusat,
                pusat.lat,
                pusat.lng,
                zoom
              );
              if (!posKab.terlihat) return null;
              return (
                <div
                  key={kab.id}
                  style={{
                    left: `${posKab.xPersen}%`,
                    top: `${posKab.yPersen}%`,
                  }}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-tight ${
                      lapisan === 'satelit'
                        ? 'bg-brand-900/80 text-brand-100'
                        : 'bg-surface/85 text-ink-600'
                    }`}
                  >
                    {kab.nama.replace(/^(Kab\.|Kota)\s+/i, '')}
                  </span>
                </div>
              );
            })}

            {/* Penanda & Klaster Interaktif (Simbol Berbeda per Tingkat — DESIGN.md §5) */}
            {daftarKlaster.map((klaster) => {
              const pos = proyeksikanKeKanvasGis(
                klaster.lat,
                klaster.lng,
                pusat.lat,
                pusat.lng,
                zoom
              );
              if (!pos.terlihat) return null;

              const sedangDipilih =
                laporanPopup !== null &&
                klaster.daftarLaporan.some((item) => item.id === laporanPopup.id);

              const kelasWarna =
                klaster.tingkatDominan === 'berat'
                  ? 'bg-danger-600 text-surface ring-danger-100'
                  : klaster.tingkatDominan === 'sedang'
                    ? 'bg-gold-500 text-ink-900 ring-gold-100'
                    : 'bg-ok-500 text-surface ring-ok-100';

              const teksSimbol =
                klaster.jumlah > 1
                  ? `${klaster.jumlah}`
                  : simbolTingkatSerangan(klaster.tingkatDominan);

              return (
                <button
                  key={klaster.id}
                  type="button"
                  onClick={() => tanganiKlikKlaster(klaster)}
                  style={{
                    left: `${pos.xPersen}%`,
                    top: `${pos.yPersen}%`,
                  }}
                  aria-label={
                    klaster.jumlah > 1
                      ? `Klaster ${klaster.jumlah} laporan serangan ${klaster.tingkatDominan}, total luas ${formatLuas(klaster.totalLuasSerangan)}`
                      : `Penanda laporan ${klaster.laporanUtama.kode} di ${klaster.laporanUtama.namaDesa}, tingkat ${klaster.tingkatDominan}`
                  }
                  className="group absolute -translate-x-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center focus:z-30"
                >
                  <span
                    className={`flex items-center justify-center rounded-full border-2 border-surface font-extrabold shadow-md ring-4 transition-transform group-hover:scale-110 ${kelasWarna} ${
                      klaster.jumlah > 1 ? 'h-10 w-10 text-xs' : 'h-8 w-8 text-xs'
                    } ${sedangDipilih ? 'scale-125 ring-brand-900' : ''}`}
                  >
                    {teksSimbol}
                  </span>
                </button>
              );
            })}

            {daftarLaporan.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                <div className="rounded-2xl border border-line bg-surface/95 px-5 py-4 text-center shadow-sm">
                  <p className="text-sm font-bold text-ink-900">
                    Tidak Ada Titik Serangan pada Filter Ini
                  </p>
                  <p className="mt-1 text-xs text-ink-600">
                    Ubah filter wilayah, komoditas, atau tingkat keparahan di panel kiri.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PEMILIH LAPISAN DI KIRI ATAS PETA (DESIGN.md §4.2) */}
        <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface/95 p-1 shadow-sm backdrop-blur">
          <span className="hidden items-center gap-1 pl-2 pr-1 text-[11px] font-bold text-brand-900 sm:inline-flex">
            <Layers className="h-3.5 w-3.5" aria-hidden />
          </span>
          {OPSI_LAPISAN.map((opsi) => {
            const aktif = lapisan === opsi.id;
            return (
              <button
                key={opsi.id}
                type="button"
                onClick={() => setLapisan(opsi.id)}
                aria-pressed={aktif}
                className={`min-h-[44px] rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors sm:min-h-[38px] ${
                  aktif
                    ? 'bg-brand-900 text-surface'
                    : 'text-ink-900 hover:bg-canvas'
                }`}
              >
                {opsi.label}
              </button>
            );
          })}
        </div>

        {/* KONTROL ZOOM & RESET PANDANGAN (Kanan Atas) */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => ubahZoom(1)}
            aria-label="Perbesar peta"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink-900 shadow-sm hover:bg-canvas"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => ubahZoom(-1)}
            aria-label="Perkecil peta"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink-900 shadow-sm hover:bg-canvas"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={resetPandanganKaltim}
            aria-label="Kembalikan fokus ke seluruh Kalimantan Timur"
            title="Reset Pandangan Kaltim"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-brand-900 shadow-sm hover:bg-canvas"
          >
            <Locate className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* POPUP PENANDA GEOTAGGING (DESIGN.md §4.2) */}
        {laporanPopup && (
          <div
            role="dialog"
            aria-label={`Detail penanda laporan ${laporanPopup.kode}`}
            className="absolute inset-x-2 bottom-2 z-30 max-h-[88%] overflow-y-auto rounded-2xl border border-line bg-surface shadow-lg sm:inset-x-auto sm:bottom-auto sm:left-3 sm:top-16 sm:w-[370px]"
          >
            {/* Header Hijau Tua dengan Lencana Zona */}
            <div className="bg-brand-900 p-3.5 text-surface">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    laporanPopup.tingkat === 'berat'
                      ? 'bg-danger-600 text-surface'
                      : laporanPopup.tingkat === 'sedang'
                        ? 'bg-gold-500 text-ink-900'
                        : 'bg-ok-500 text-surface'
                  }`}
                >
                  <span>{simbolTingkatSerangan(laporanPopup.tingkat)}</span>
                  <span>{labelZonaTematik(laporanPopup.tingkat)}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setLaporanTerpilihId(null)}
                  aria-label="Tutup popup penanda"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-surface hover:bg-brand-700/80 sm:h-9 sm:w-9"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <p className="mt-2 font-mono text-xs font-semibold text-gold-500">
                ID: {laporanPopup.kode}
              </p>
              <h3 className="mt-0.5 text-sm font-extrabold leading-snug">
                Desa {laporanPopup.namaDesa}, Kec. {laporanPopup.namaKecamatan}
              </h3>
              <p className="text-xs text-brand-100">{laporanPopup.namaKabupaten}</p>
              <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-brand-100">
                <MapPin className="h-3 w-3 shrink-0 text-gold-500" aria-hidden />
                <span>{formatKoordinat(laporanPopup.lat, laporanPopup.lng)}</span>
              </p>
            </div>

            <div className="space-y-3 p-3.5 text-xs">
              {/* Foto Bertanda "Foto Geotagging" */}
              {fotoPopup && (
                <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
                  <img
                    src={fotoPopup}
                    alt={`Foto geotagging ${laporanPopup.kode}`}
                    className="h-32 w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-brand-900/90 px-2 py-0.5 text-[10px] font-bold text-surface">
                    Foto Geotagging (Simulasi)
                  </span>
                </div>
              )}

              {/* Kisi 2×2: Komoditas, Hama/OPT, Luas Serangan, Intensitas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-line bg-canvas/60 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    Komoditas
                  </p>
                  <p className="mt-0.5 font-bold text-ink-900">
                    {laporanPopup.namaKomoditas}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-canvas/60 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    Hama / OPT
                  </p>
                  <p className="mt-0.5 truncate font-bold text-ink-900" title={laporanPopup.namaOptLokal}>
                    {laporanPopup.namaOptLokal}
                  </p>
                  <p className="truncate text-[10px] italic text-ink-600">
                    {laporanPopup.namaOptIlmiah}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-canvas/60 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    Luas Serangan
                  </p>
                  <p className="mt-0.5 font-extrabold tabular-nums text-danger-600">
                    {formatLuas(laporanPopup.luasRingan + laporanPopup.luasBerat)}
                  </p>
                  <p className="text-[10px] text-ink-600">
                    dari {formatLuas(laporanPopup.luasAmatan)} amatan
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-canvas/60 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    Intensitas
                  </p>
                  <p className="mt-0.5 font-extrabold tabular-nums text-ink-900">
                    {formatPersen(laporanPopup.intensitasPersen)}
                  </p>
                  <div className="mt-1">
                    <LencanaTingkatSerangan tingkat={laporanPopup.tingkat} />
                  </div>
                </div>
              </div>

              {/* Baris Petugas + Waktu + Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1 font-bold text-ink-900">
                    <UserCheck className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
                    <span className="truncate">{laporanPopup.namaPetugas}</span>
                  </p>
                  <p className="text-[11px] text-ink-600">
                    {formatTanggalWaktu(laporanPopup.dibuatPada)}
                  </p>
                </div>
                <LencanaStatusVerifikasi status={laporanPopup.status} />
              </div>

              {/* Kotak Rekomendasi Tindakan */}
              <div className="rounded-xl border border-brand-700/20 bg-brand-100/50 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-900">
                  Rekomendasi Tindakan Lapangan
                </p>
                <p className="mt-1 leading-relaxed text-ink-900">
                  {rekomendasiRingkasPopup}
                </p>
              </div>

              {/* Tombol Detail Berita Acara & Navigasi Arah */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onBukaBeritaAcara(laporanPopup)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-brand-900 px-3 py-2 text-xs font-bold text-surface hover:bg-brand-700"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>Detail Berita Acara</span>
                </button>

                <a
                  href={buatTautanNavigasiKoordinat(laporanPopup.lat, laporanPopup.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-brand-900 hover:bg-canvas"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>Navigasi Arah</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* LEGENDA TEMATIK POJOK BAWAH KANAN (Ruang aman atribusi Google — DESIGN.md §4.2) */}
        <div
          className={`absolute right-3 z-20 rounded-xl border border-line bg-surface/95 p-3 text-[11px] shadow-sm backdrop-blur ${
            modeGoogleAktif ? 'bottom-8' : 'bottom-3'
          }`}
        >
          <p className="font-bold uppercase tracking-wider text-ink-900">
            Legenda Zona Tematik
          </p>
          <ul className="mt-1.5 space-y-1">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger-600 text-[9px] font-extrabold text-surface">
                !
              </span>
              <span className="text-ink-900">
                Eksplosif (&gt; {konfigurasiKlasifikasi.ambangBeratMin}%)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[9px] font-extrabold text-ink-900">
                ▲
              </span>
              <span className="text-ink-900">
                Waspada ({konfigurasiKlasifikasi.ambangSedangMin}–
                {konfigurasiKlasifikasi.ambangBeratMin}%)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ok-500 text-[9px] font-extrabold text-surface">
                ✓
              </span>
              <span className="text-ink-900">
                Ringan (&lt; {konfigurasiKlasifikasi.ambangSedangMin}%)
              </span>
            </li>
            <li className="flex items-center gap-2 pt-0.5 text-ink-600">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-ink-600 bg-canvas text-[9px] font-extrabold text-ink-900">
                n
              </span>
              <span>Klaster Multi-Titik</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
