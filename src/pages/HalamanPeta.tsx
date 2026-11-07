import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  Map as MapIcon,
  MapPin,
  PlusCircle,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LencanaStatusVerifikasi,
  LencanaTingkatSerangan,
} from '../components/LencanaStatus';
import { KerangkaMuat, KotakGalatData } from '../components/StatusMuatData';
import {
  PanelFilterSpasial,
  type DrafFilterSpasial,
} from '../components/peta/PanelFilterSpasial';
import { PetaOPT } from '../components/peta/PetaOPT';
import { TabelKerentananWilayah } from '../components/peta/TabelKerentananWilayah';
import {
  formatKoordinat,
  formatLuas,
  formatPersen,
  formatTanggalWaktu,
} from '../lib/format';
import { periodeBawaanSistem } from '../lib/klasifikasi';
import { KONFIGURASI_KLASIFIKASI_BAWAAN } from '../lib/konfigurasi';
import { useAppStore } from '../lib/storeAplikasi';
import {
  eksporService,
  komoditasOptRepository,
  konfigurasiRepository,
  laporanRepository,
  rekapRepository,
  wilayahRepository,
} from '../services';
import type {
  BarisKerentananWilayah,
  FilterLaporan,
  Komoditas,
  KonfigurasiKlasifikasi,
  Laporan,
  RingkasanRekap,
  Uptd,
  Wilayah,
} from '../types/domain';

function susunFilterDariDraf(draf: DrafFilterSpasial): FilterLaporan {
  return {
    modePeriode: draf.modePeriode,
    tahun: draf.tahun,
    triwulan: draf.modePeriode === 'triwulan' ? draf.triwulan : undefined,
    semester: draf.modePeriode === 'semester' ? draf.semester : undefined,
    kabupatenId: draf.kabupatenId || undefined,
    kecamatanId: draf.kecamatanId || undefined,
    desaId: draf.desaId || undefined,
    komoditasIds: draf.komoditasIds.length > 0 ? draf.komoditasIds : undefined,
    tingkatList: draf.tingkatList.length > 0 ? draf.tingkatList : undefined,
  };
}

export default function HalamanPeta() {
  const profilAktif = useAppStore((s) => s.profilAktif);
  const tambahToast = useAppStore((s) => s.tambahToast);

  const periodeSistem = useMemo(() => periodeBawaanSistem(), []);

  const drafAwal = useMemo<DrafFilterSpasial>(
    () => ({
      kabupatenId: '',
      kecamatanId: '',
      desaId: '',
      komoditasIds: [],
      tingkatList: [],
      modePeriode: 'realtime',
      tahun: periodeSistem.tahun,
      triwulan: periodeSistem.triwulan,
      semester: periodeSistem.semester,
    }),
    [periodeSistem]
  );

  const [drafFilter, setDrafFilter] = useState<DrafFilterSpasial>(drafAwal);
  const [filterAktif, setFilterAktif] = useState<FilterLaporan>(() =>
    susunFilterDariDraf(drafAwal)
  );

  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  const [semuaWilayah, setSemuaWilayah] = useState<Wilayah[]>([]);
  const [daftarKomoditas, setDaftarKomoditas] = useState<Komoditas[]>([]);
  const [daftarUptd, setDaftarUptd] = useState<Uptd[]>([]);
  const [konfigurasiKlasifikasi, setKonfigurasiKlasifikasi] =
    useState<KonfigurasiKlasifikasi>(KONFIGURASI_KLASIFIKASI_BAWAAN);

  const [daftarLaporan, setDaftarLaporan] = useState<Laporan[]>([]);
  const [ringkasan, setRingkasan] = useState<RingkasanRekap | null>(null);
  const [kerentananWilayah, setKerentananWilayah] = useState<BarisKerentananWilayah[]>([]);

  const [fokusKoordinat, setFokusKoordinat] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);

  const [sedangEksporExcel, setSedangEksporExcel] = useState(false);
  const [sedangEksporPdf, setSedangEksporPdf] = useState(false);

  // Modal Detail Berita Acara Simulasi
  const [beritaAcaraLaporan, setBeritaAcaraLaporan] = useState<Laporan | null>(null);
  const [catatanVerifikasiModal, setCatatanVerifikasiModal] = useState('');
  const [sedangMemverifikasi, setSedangMemverifikasi] = useState(false);

  // Muat katalog referensi sekali di awal
  useEffect(() => {
    const muatReferensi = async () => {
      const [resWilayah, resKomoditas, resUptd, resKonfig] = await Promise.all([
        wilayahRepository.semuaWilayah(),
        komoditasOptRepository.daftarKomoditas(),
        wilayahRepository.daftarUptd(),
        konfigurasiRepository.ambil(),
      ]);

      if (resWilayah.ok) setSemuaWilayah(resWilayah.data);
      if (resKomoditas.ok) {
        setDaftarKomoditas(resKomoditas.data.filter((k) => k.aktif));
      }
      if (resUptd.ok) setDaftarUptd(resUptd.data);
      if (resKonfig.ok) setKonfigurasiKlasifikasi(resKonfig.data.klasifikasi);
    };

    void muatReferensi();
    const berhentiKatalog = komoditasOptRepository.langganan(() => {
      komoditasOptRepository.daftarKomoditas().then((res) => {
        if (res.ok) setDaftarKomoditas(res.data.filter((k) => k.aktif));
      });
    });
    return berhentiKatalog;
  }, []);

  // Muat data spasial & rekap dari satu sumber data terpusat
  const muatDataSpasial = useCallback(async () => {
    setMemuat(true);
    setGalat(null);

    const [resLaporan, resRingkasan, resKerentanan] = await Promise.all([
      laporanRepository.daftar(filterAktif, undefined, profilAktif),
      rekapRepository.ringkasan(filterAktif),
      rekapRepository.kerentananWilayah(filterAktif),
    ]);

    if (!resLaporan.ok) {
      setGalat(resLaporan.pesan);
      setMemuat(false);
      return;
    }
    if (!resRingkasan.ok) {
      setGalat(resRingkasan.pesan);
      setMemuat(false);
      return;
    }
    if (!resKerentanan.ok) {
      setGalat(resKerentanan.pesan);
      setMemuat(false);
      return;
    }

    setDaftarLaporan(resLaporan.data);
    setRingkasan(resRingkasan.data);
    setKerentananWilayah(resKerentanan.data);
    setMemuat(false);
  }, [filterAktif, profilAktif]);

  useEffect(() => {
    void muatDataSpasial();
    const berhenti = laporanRepository.langganan(filterAktif, () => {
      void muatDataSpasial();
    });
    return berhenti;
  }, [filterAktif, muatDataSpasial]);

  const daftarKabupaten = useMemo(
    () => semuaWilayah.filter((w) => w.tipe === 'kabupaten'),
    [semuaWilayah]
  );

  const deskripsiFilterRingkas = useMemo(() => {
    const namaKab = filterAktif.kabupatenId
      ? daftarKabupaten.find((k) => k.id === filterAktif.kabupatenId)?.nama ??
        filterAktif.kabupatenId
      : 'Seluruh Kaltim';
    const labelPeriode =
      filterAktif.modePeriode === 'triwulan'
        ? `TW ${filterAktif.triwulan ?? ''} ${filterAktif.tahun ?? ''}`
        : filterAktif.modePeriode === 'semester'
          ? `Semester ${filterAktif.semester ?? ''} ${filterAktif.tahun ?? ''}`
          : `Real-Time TA ${filterAktif.tahun ?? periodeSistem.tahun}`;
    return `GIS Spasial · ${namaKab} · ${labelPeriode}`;
  }, [daftarKabupaten, filterAktif, periodeSistem.tahun]);

  const tanganiTerapkanFilter = () => {
    const baru = susunFilterDariDraf(drafFilter);
    setFilterAktif(baru);

    if (drafFilter.desaId) {
      const desa = semuaWilayah.find((w) => w.id === drafFilter.desaId);
      if (desa?.latPusat !== undefined && desa.lngPusat !== undefined) {
        setFokusKoordinat({ lat: desa.latPusat, lng: desa.lngPusat, zoom: 11 });
        return;
      }
    }
    if (drafFilter.kabupatenId) {
      const kab = daftarKabupaten.find((k) => k.id === drafFilter.kabupatenId);
      if (kab?.latPusat !== undefined && kab.lngPusat !== undefined) {
        setFokusKoordinat({ lat: kab.latPusat, lng: kab.lngPusat, zoom: 8 });
        return;
      }
    }
    setFokusKoordinat({ lat: -0.05, lng: 116.45, zoom: 6 });
  };

  const tanganiResetFilter = () => {
    setDrafFilter(drafAwal);
    setFilterAktif(susunFilterDariDraf(drafAwal));
    setFokusKoordinat({ lat: -0.05, lng: 116.45, zoom: 6 });
  };

  const tanganiFokusKabupaten = (kabupatenId: string) => {
    const kab = daftarKabupaten.find((k) => k.id === kabupatenId);
    if (kab?.latPusat !== undefined && kab.lngPusat !== undefined) {
      setFokusKoordinat({ lat: kab.latPusat, lng: kab.lngPusat, zoom: 9 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tanganiUnduhGeodataExcel = async () => {
    setSedangEksporExcel(true);
    const hasil = await eksporService.eksporObservasiExcel(
      filterAktif,
      profilAktif,
      deskripsiFilterRingkas,
      'geodata'
    );
    setSedangEksporExcel(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mengunduh Geodata Excel',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void tanganiUnduhGeodataExcel();
        },
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Geodata Excel Berhasil Diunduh',
      pesan: `Berkas ${hasil.data.namaBerkas} telah diunduh dan dicatat ke log ekspor.`,
    });
  };

  const tanganiCetakPetaPdf = async () => {
    setSedangEksporPdf(true);
    const hasil = await eksporService.eksporPetaSpasialPdf(
      filterAktif,
      profilAktif,
      deskripsiFilterRingkas
    );
    setSedangEksporPdf(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mencetak PDF Spasial',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void tanganiCetakPetaPdf();
        },
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'PDF Rekap Spasial Siap',
      pesan: `Berkas ${hasil.data.namaBerkas} (Simulasi) telah diunduh dan tercatat di log ekspor.`,
    });
  };

  const tanganiVerifikasiDariBeritaAcara = async (
    keputusan: 'terverifikasi' | 'ditolak'
  ) => {
    if (!beritaAcaraLaporan) return;
    setSedangMemverifikasi(true);
    const hasil = await laporanRepository.verifikasi(
      beritaAcaraLaporan.id,
      keputusan,
      profilAktif,
      catatanVerifikasiModal
    );
    setSedangMemverifikasi(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Verifikasi Laporan Gagal',
        pesan: hasil.pesan,
      });
      return;
    }

    setBeritaAcaraLaporan(hasil.data);
    setCatatanVerifikasiModal('');
    tambahToast({
      jenis: 'sukses',
      judul:
        keputusan === 'terverifikasi'
          ? 'Laporan Terverifikasi'
          : 'Laporan Ditolak',
      pesan: `Status ${hasil.data.kode} diperbarui pada peta GIS dan dashboard.`,
    });
  };

  return (
    <div className="space-y-5">
      {/* KEPALA HALAMAN GIS (DESIGN.md §4.2) */}
      <header className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-surface">
              <MapIcon className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-brand-100 px-2.5 py-0.5 font-mono text-xs font-bold text-brand-900">
                  WGS84 EPSG:4326
                </span>
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-900">
                  Data Simulasi
                </span>
              </div>
              <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-brand-900 sm:text-2xl">
                GIS & Peta Sebaran Spasial OPT
              </h1>
              <p className="mt-0.5 text-xs text-ink-600 sm:text-sm">
                Pemantauan klaster titik serangan, analisis zona bahaya tematik, dan rekapitulasi
                kerentanan wilayah se-Kalimantan Timur secara real-time.
              </p>
            </div>
          </div>

          {/* Tiga Lencana Ringkas + Pintasan Input (DESIGN.md §4.2) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-xl border border-danger-600/20 bg-danger-100 px-3.5 py-2 text-xs font-bold text-danger-600">
              <AlertOctagon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="tabular-nums">
                {ringkasan?.jumlahTitikKritis ?? 0} Titik Bahaya Kritis
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-gold-500/40 bg-gold-100 px-3.5 py-2 text-xs font-bold text-ink-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-ink-900" aria-hidden />
              <span className="tabular-nums">
                {ringkasan?.jumlahTitikWaspada ?? 0} Titik Waspada
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-info-100 px-3.5 py-2 text-xs font-bold text-ink-900">
              <Layers className="h-4 w-4 shrink-0 text-brand-900" aria-hidden />
              <span className="tabular-nums">
                {formatLuas(ringkasan?.totalLuasTerdampak ?? 0)} Terdampak
              </span>
            </div>

            <Link
              to="/input-laporan"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand-900 px-3.5 py-2 text-xs font-bold text-surface hover:bg-brand-700"
            >
              <PlusCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>Input Laporan</span>
            </Link>
          </div>
        </div>
      </header>

      {galat && (
        <KotakGalatData
          pesan={galat}
          onCobaLagi={() => {
            void muatDataSpasial();
          }}
        />
      )}

      {memuat && !ringkasan ? (
        <KerangkaMuat
          pesan="Memuat geodata titik serangan OPT dan rekap kerentanan wilayah..."
          jumlahBaris={5}
        />
      ) : (
        <>
          {/* DUA KOLOM: PANEL FILTER SPASIAL (Kiri) & <PetaOPT> (Kanan) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <PanelFilterSpasial
                draf={drafFilter}
                semuaWilayah={semuaWilayah}
                daftarKomoditas={daftarKomoditas}
                daftarUptd={daftarUptd}
                filterAktif={filterAktif}
                onUbahDraf={setDrafFilter}
                onTerapkan={tanganiTerapkanFilter}
                onReset={tanganiResetFilter}
              />
            </div>

            <div className="lg:col-span-8">
              <PetaOPT
                daftarLaporan={daftarLaporan}
                daftarKabupaten={daftarKabupaten}
                konfigurasiKlasifikasi={konfigurasiKlasifikasi}
                fokusKoordinat={fokusKoordinat}
                onBukaBeritaAcara={(lap) => {
                  setBeritaAcaraLaporan(lap);
                  setCatatanVerifikasiModal(lap.catatanVerifikasi ?? '');
                }}
              />
            </div>
          </div>

          {/* BAWAH: TABEL REKAPITULASI WILAYAH PALING RENTAN OPT */}
          <TabelKerentananWilayah
            baris={kerentananWilayah}
            sedangEksporExcel={sedangEksporExcel}
            sedangEksporPdf={sedangEksporPdf}
            onUnduhGeodataExcel={() => {
              void tanganiUnduhGeodataExcel();
            }}
            onCetakPetaPdf={() => {
              void tanganiCetakPetaPdf();
            }}
            onFokusKabupaten={tanganiFokusKabupaten}
          />
        </>
      )}

      {/* MODAL DETAIL BERITA ACARA LAPANGAN (SIMULASI — SECURITY.md §11) */}
      {beritaAcaraLaporan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-modal-berita-acara-gis"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-3 sm:p-4"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-surface shadow-xl">
            <div className="flex items-start justify-between gap-3 bg-brand-900 p-4 text-surface sm:p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gold-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-900">
                    Dokumen Simulasi — Bukan Naskah Resmi
                  </span>
                  <span className="font-mono text-xs text-brand-100">
                    {beritaAcaraLaporan.kode}
                  </span>
                </div>
                <h2
                  id="judul-modal-berita-acara-gis"
                  className="mt-1.5 text-base font-extrabold sm:text-lg"
                >
                  Ringkasan Berita Acara Pengamatan Spasial OPT
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBeritaAcaraLaporan(null)}
                aria-label="Tutup modal berita acara"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-surface hover:bg-brand-700/80"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-4 p-4 text-xs sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-canvas p-3">
                <div className="flex items-center gap-2">
                  <LencanaTingkatSerangan tingkat={beritaAcaraLaporan.tingkat} />
                  <LencanaStatusVerifikasi status={beritaAcaraLaporan.status} />
                </div>
                <span className="text-ink-600">
                  {formatTanggalWaktu(beritaAcaraLaporan.dibuatPada)}
                </span>
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    Lokasi & Blok Kebun
                  </dt>
                  <dd className="mt-1 font-bold text-ink-900">
                    Desa {beritaAcaraLaporan.namaDesa}, Kec. {beritaAcaraLaporan.namaKecamatan}
                  </dd>
                  <dd className="text-ink-600">
                    {beritaAcaraLaporan.namaKabupaten} · {beritaAcaraLaporan.namaBlok}
                  </dd>
                  <dd className="mt-1 flex items-center gap-1 font-mono text-[11px] text-brand-900">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                    <span>
                      {formatKoordinat(beritaAcaraLaporan.lat, beritaAcaraLaporan.lng)}
                    </span>
                  </dd>
                </div>

                <div className="rounded-xl border border-line p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    Komoditas & Organisme Pengganggu
                  </dt>
                  <dd className="mt-1 font-bold text-ink-900">
                    {beritaAcaraLaporan.namaKomoditas} (Fase{' '}
                    {beritaAcaraLaporan.faseTanaman.toUpperCase()})
                  </dd>
                  <dd className="text-ink-900">
                    {beritaAcaraLaporan.namaOptLokal}{' '}
                    <span className="italic text-ink-600">
                      ({beritaAcaraLaporan.namaOptIlmiah})
                    </span>
                  </dd>
                  <dd className="mt-1 text-ink-600">
                    Pelapor: {beritaAcaraLaporan.namaPetugas} (
                    {beritaAcaraLaporan.nipPetugas ?? 'NIP Simulasi'})
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-canvas p-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink-600">Amatan</p>
                  <p className="mt-0.5 font-extrabold tabular-nums text-ink-900">
                    {formatLuas(beritaAcaraLaporan.luasAmatan)}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink-600">Ringan</p>
                  <p className="mt-0.5 font-extrabold tabular-nums text-ink-900">
                    {formatLuas(beritaAcaraLaporan.luasRingan)}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink-600">Berat</p>
                  <p className="mt-0.5 font-extrabold tabular-nums text-danger-600">
                    {formatLuas(beritaAcaraLaporan.luasBerat)}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink-600">Intensitas</p>
                  <p className="mt-0.5 font-extrabold tabular-nums text-brand-900">
                    {formatPersen(beritaAcaraLaporan.intensitasPersen)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-line bg-canvas/60 p-3">
                <p className="font-bold text-ink-900">Rekomendasi Pengendalian Terpadu:</p>
                <p className="text-ink-600">
                  <strong className="text-ink-900">Kultur Teknis:</strong>{' '}
                  {beritaAcaraLaporan.rekomendasiKultur || '-'}
                </p>
                <p className="text-ink-600">
                  <strong className="text-ink-900">Hayati:</strong>{' '}
                  {beritaAcaraLaporan.rekomendasiHayati || '-'}
                </p>
                <p className="text-ink-600">
                  <strong className="text-ink-900">Kimiawi/Eradikasi:</strong>{' '}
                  {beritaAcaraLaporan.rekomendasiKimiawi || '-'}
                </p>
              </div>

              {/* Aksi Verifikasi Cepat bagi Admin / Operator UPTD */}
              {profilAktif.peran !== 'petugas' &&
                beritaAcaraLaporan.status === 'menunggu' && (
                  <div className="space-y-2.5 rounded-xl border border-brand-700/20 bg-brand-100/40 p-3.5">
                    <label
                      htmlFor="catatan-verifikasi-gis"
                      className="block font-bold text-brand-900"
                    >
                      Tindak Lanjut Verifikasi UPTD / Provinsi (Wajib isi alasan bila menolak)
                    </label>
                    <input
                      id="catatan-verifikasi-gis"
                      type="text"
                      value={catatanVerifikasiModal}
                      onChange={(e) => setCatatanVerifikasiModal(e.target.value)}
                      placeholder="Catatan validasi koordinat & gejala lapangan..."
                      className="min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={sedangMemverifikasi}
                        onClick={() => {
                          void tanganiVerifikasiDariBeritaAcara('terverifikasi');
                        }}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        <span>Setujui & Verifikasi</span>
                      </button>
                      <button
                        type="button"
                        disabled={sedangMemverifikasi}
                        onClick={() => {
                          void tanganiVerifikasiDariBeritaAcara('ditolak');
                        }}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-danger-600 px-4 py-2 font-bold text-surface hover:opacity-95 disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" aria-hidden />
                        <span>Tolak Laporan</span>
                      </button>
                    </div>
                  </div>
                )}

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  disabled={sedangEksporPdf}
                  onClick={() => {
                    void tanganiCetakPetaPdf();
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand-100 px-4 py-2 font-bold text-brand-900 hover:bg-brand-100/80 disabled:opacity-60"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  <span>Cetak Rekap Spasial PDF (Simulasi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBeritaAcaraLaporan(null)}
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-line bg-surface px-4 py-2 font-bold text-ink-900 hover:bg-canvas"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
