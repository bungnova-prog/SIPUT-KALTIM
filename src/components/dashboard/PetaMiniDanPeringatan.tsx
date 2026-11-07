import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  Compass,
  FileCheck2,
  Leaf,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import {
  proyeksiKoordinatPetaMini,
  susunSorotanPeringatan,
} from '../../lib/analitikDashboard';
import {
  formatKoordinat,
  formatLuas,
  formatPersen,
} from '../../lib/format';
import { LencanaTingkatSerangan } from '../LencanaStatus';
import type { BarisKerentananWilayah, Laporan } from '../../types/domain';

export default function PetaMiniDanPeringatan({
  daftarLaporan,
  kerentananWilayah,
  onDisposisi,
}: {
  daftarLaporan: Laporan[];
  kerentananWilayah: BarisKerentananWilayah[];
  onDisposisi: (wilayahPrioritas: string, rekomendasi: string) => void;
}) {
  const [titikTerpilihId, setTitikTerpilihId] = useState<string | null>(null);
  const sorotan = susunSorotanPeringatan(daftarLaporan);

  const laporanTerpilih =
    daftarLaporan.find((l) => l.id === titikTerpilihId) ??
    sorotan.kritis ??
    daftarLaporan[0] ??
    null;

  return (
    <section
      className="grid gap-4 xl:grid-cols-12"
      aria-label="Pratinjau sebaran spasial dan peringatan dini OPT"
    >
      {/* Kiri: Peta Mini + Legenda + Indeks Kerentanan Wilayah */}
      <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5 xl:col-span-7">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-lg">
                  <Compass className="h-5 w-5 text-brand-700" aria-hidden />
                  <span>Peta Mini Sebaran OPT Kalimantan Timur</span>
                </h2>
                <span className="rounded bg-info-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-900">
                  WGS84 · Simulasi
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-600">
                Klik titik pengamatan untuk meninjau ringkasan koordinat laporan
              </p>
            </div>

            <Link
              to="/peta"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-900 px-4 py-2 text-xs font-semibold text-surface hover:bg-brand-700"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              <span>Buka Peta Penuh</span>
            </Link>
          </div>

          {/* Kanvas Peta Mini SVG Berproyeksi WGS84 */}
          <div className="relative mt-4 overflow-hidden rounded-xl border border-line bg-brand-100/50 p-3">
            <div className="relative h-56 w-full rounded-lg border border-line bg-canvas">
              <svg
                viewBox="0 0 400 220"
                className="h-full w-full"
                aria-hidden="true"
              >
                {/* Garis kisi koordinat pratinjau */}
                <line x1="0" y1="55" x2="400" y2="55" stroke="var(--token-line)" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="400" y2="110" stroke="var(--token-brand-700)" strokeOpacity="0.25" strokeDasharray="6 4" />
                <line x1="0" y1="165" x2="400" y2="165" stroke="var(--token-line)" strokeDasharray="4 4" />
                <line x1="100" y1="0" x2="100" y2="220" stroke="var(--token-line)" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="200" y2="220" stroke="var(--token-line)" strokeDasharray="4 4" />
                <line x1="300" y1="0" x2="300" y2="220" stroke="var(--token-line)" strokeDasharray="4 4" />

                {/* Siluet skematik daratan Kaltim (simulasi orientasi) */}
                <path
                  d="M95,95 L145,48 L245,24 L310,44 L295,88 L338,108 L282,148 L255,192 L185,202 L148,162 L110,136 Z"
                  fill="var(--token-brand-100)"
                  stroke="var(--token-brand-700)"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
                <text
                  x="12"
                  y="106"
                  fill="var(--token-ink-600)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  0° Khatulistiwa
                </text>
              </svg>

              {/* Titik penanda interaktif dengan bentuk simbol + warna berbeda */}
              {daftarLaporan.map((item) => {
                const pos = proyeksiKoordinatPetaMini(item.lat, item.lng);
                const terpilih = laporanTerpilih?.id === item.id;
                const kelasWarna =
                  item.tingkat === 'berat'
                    ? 'bg-danger-600 text-surface border-surface'
                    : item.tingkat === 'sedang'
                      ? 'bg-gold-500 text-ink-900 border-ink-900'
                      : 'bg-ok-500 text-surface border-surface';
                const simbol =
                  item.tingkat === 'berat'
                    ? '!'
                    : item.tingkat === 'sedang'
                      ? '▲'
                      : '●';

                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{ left: `${pos.xPersen}%`, top: `${pos.yPersen}%` }}
                    onClick={() => setTitikTerpilihId(item.id)}
                    aria-label={`Titik laporan ${item.kode} di ${item.namaKabupaten}, tingkat ${item.tingkat}`}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full"
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold shadow-sm transition-transform ${kelasWarna} ${
                        terpilih
                          ? 'scale-125 ring-2 ring-brand-900'
                          : 'group-hover:scale-110'
                      }`}
                    >
                      {simbol}
                    </span>
                  </button>
                );
              })}

              {daftarLaporan.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-ink-600">
                  Tidak ada titik pengamatan pada filter periode/wilayah ini.
                </div>
              )}
            </div>

            {/* Legenda Merah / Kuning / Hijau dengan Ikon + Teks (DESIGN.md §1 & §4.1) */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-900">
                  <AlertOctagon className="h-3.5 w-3.5 text-danger-600" aria-hidden />
                  <span>Merah: Berat (&gt; 50%)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-900">
                  <AlertTriangle className="h-3.5 w-3.5 text-ink-900" aria-hidden />
                  <span>Kuning: Sedang (25–50%)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-900">
                  <Leaf className="h-3.5 w-3.5 text-ok-500" aria-hidden />
                  <span>Hijau: Ringan (&lt; 25%)</span>
                </span>
              </div>
              {laporanTerpilih && (
                <span className="font-mono text-[11px] text-ink-600">
                  {laporanTerpilih.kode} · {formatKoordinat(laporanTerpilih.lat, laporanTerpilih.lng)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Panel Indeks Kerentanan Wilayah */}
        <div className="mt-4 rounded-xl border border-line bg-canvas p-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Indeks Kerentanan Wilayah Teratas
            </h3>
            <span className="text-[11px] text-ink-600">
              {kerentananWilayah.length} Kab/Kota Terdampak
            </span>
          </div>

          {kerentananWilayah.length === 0 ? (
            <p className="mt-2 text-xs text-ink-600">
              Belum ada wilayah terdampak pada filter aktif.
            </p>
          ) : (
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              {kerentananWilayah.slice(0, 3).map((wil) => (
                <div
                  key={wil.kabupatenId}
                  className="rounded-lg border border-line bg-surface p-2.5 text-xs"
                >
                  <p className="truncate font-semibold text-ink-900">
                    {wil.namaKabupaten}
                  </p>
                  <p className="truncate text-[11px] text-ink-600">
                    Kec. {wil.kecamatanTerparah} · {wil.komoditasUtama}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="font-bold tabular-nums text-ink-900">
                      {formatLuas(wil.luasSerangan)}
                    </span>
                    <LencanaTingkatSerangan tingkat={wil.tingkatAncaman} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kanan: Tumpukan 3 Kartu Peringatan & Rekomendasi Kebijakan */}
      <div className="flex flex-col justify-between gap-4 xl:col-span-5">
        {/* Kartu 1: Peringatan Eksplosif OPT */}
        <article className="rounded-xl border border-danger-600/30 bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <AlertOctagon className="h-4 w-4 text-danger-600" aria-hidden />
              <span>Peringatan Eksplosif OPT</span>
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-0.5 text-xs font-semibold text-danger-600">
              <AlertOctagon className="h-3 w-3" aria-hidden />
              <span>Kritis ({sorotan.jumlahKritis})</span>
            </span>
          </div>
          {sorotan.kritis ? (
            <div className="mt-2.5 space-y-1 text-xs">
              <p className="font-semibold text-ink-900">
                {sorotan.kritis.namaOptLokal}{' '}
                <em className="font-normal text-ink-600">
                  ({sorotan.kritis.namaOptIlmiah})
                </em>{' '}
                pada {sorotan.kritis.namaKomoditas}
              </p>
              <p className="text-ink-600">
                Desa {sorotan.kritis.namaDesa}, Kec. {sorotan.kritis.namaKecamatan} ({sorotan.kritis.namaKabupaten}) — Intensitas{' '}
                <strong className="tabular-nums text-danger-600">
                  {formatPersen(sorotan.kritis.intensitasPersen)}
                </strong>{' '}
                (Berat: <span className="tabular-nums font-semibold">{formatLuas(sorotan.kritis.luasBerat)}</span>).
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink-600">
              Tidak ada titik serangan di atas ambang darurat berat (&gt; 50%) pada filter ini.
            </p>
          )}
        </article>

        {/* Kartu 2: Waspada Penyakit / Hama */}
        <article className="rounded-xl border border-gold-500/50 bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <ShieldAlert className="h-4 w-4 text-ink-900" aria-hidden />
              <span>Waspada Penyakit &amp; Gejala Dini</span>
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-ink-900">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              <span>Waspada ({sorotan.jumlahWaspada})</span>
            </span>
          </div>
          {sorotan.waspada ? (
            <div className="mt-2.5 space-y-1 text-xs">
              <p className="font-semibold text-ink-900">
                {sorotan.waspada.namaOptLokal}{' '}
                <em className="font-normal text-ink-600">
                  ({sorotan.waspada.namaOptIlmiah})
                </em>
              </p>
              <p className="text-ink-600">
                Terpantau di {sorotan.waspada.namaKabupaten} ({sorotan.waspada.namaKomoditas}) dengan intensitas{' '}
                <strong className="tabular-nums text-ink-900">
                  {formatPersen(sorotan.waspada.intensitasPersen)}
                </strong>
                . Pengendalian hayati:{' '}
                {sorotan.waspada.rekomendasiHayati || 'Pengamatan berkala terpadu.'}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink-600">
              Seluruh titik pengamatan berada di bawah ambang waspada penyakit.
            </p>
          )}
        </article>

        {/* Kartu 3: Rekomendasi Kebijakan (Hijau Tua + Tombol Disposisi) */}
        <article className="rounded-xl bg-brand-900 p-4 text-surface">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-100">
              Rekomendasi Kebijakan (Simulasi)
            </span>
            <span className="text-[11px] text-brand-100">Fase 1</span>
          </div>
          <p className="mt-2.5 text-sm font-bold">
            Prioritas Tindak Lanjut: {sorotan.wilayahPrioritas}
          </p>
          <p className="mt-1 text-xs text-brand-100">
            {sorotan.rekomendasiUtama}
          </p>
          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-brand-700 pt-3">
            <span className="text-[11px] text-brand-100">
              Koordinasi UPTD Proteksi &amp; Brigdal OPT
            </span>
            <button
              type="button"
              onClick={() =>
                onDisposisi(sorotan.wilayahPrioritas, sorotan.rekomendasiUtama)
              }
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-xs font-bold text-ink-900 hover:opacity-95"
            >
              <FileCheck2 className="h-4 w-4" aria-hidden />
              <span>Disposisi</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
