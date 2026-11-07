import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePlus2,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { susunNomorHalaman } from '../../lib/analitikDashboard';
import {
  formatAngka,
  formatKoordinat,
  formatLuas,
  formatPersen,
  formatTanggalWaktu,
  tampilkanNipSesuaiPeran,
} from '../../lib/format';
import {
  LencanaStatusVerifikasi,
  LencanaTingkatSerangan,
} from '../LencanaStatus';
import { KerangkaMuat, KotakDataKosong } from '../StatusMuatData';
import type {
  Laporan,
  ProfilPengguna,
  StatusLaporan,
} from '../../types/domain';

export type PilihanStatusTabel =
  | 'terpublikasi'
  | 'menunggu'
  | 'terverifikasi'
  | 'ditolak';

function dapatVerifikasiLaporan(
  item: Laporan,
  peminta: ProfilPengguna
): boolean {
  if (item.status !== 'menunggu') return false;
  if (peminta.peran === 'admin') return true;
  if (peminta.peran === 'operator' && peminta.wilayahId === item.kabupatenId) {
    return true;
  }
  return false;
}

export default function TabelObservasiRealtime({
  daftarHalaman,
  totalBaris,
  halamanAktif,
  ukuranHalaman,
  kataKunci,
  pilihanStatus,
  memuat,
  profilAktif,
  sedangMemprosesId,
  onUbahKataKunci,
  onUbahPilihanStatus,
  onPilihHalaman,
  onVerifikasi,
}: {
  daftarHalaman: Laporan[];
  totalBaris: number;
  halamanAktif: number;
  ukuranHalaman: number;
  kataKunci: string;
  pilihanStatus: PilihanStatusTabel;
  memuat: boolean;
  profilAktif: ProfilPengguna;
  sedangMemprosesId: string | null;
  onUbahKataKunci: (nilai: string) => void;
  onUbahPilihanStatus: (status: PilihanStatusTabel) => void;
  onPilihHalaman: (halaman: number) => void;
  onVerifikasi: (
    id: string,
    keputusan: 'terverifikasi' | 'ditolak',
    catatan?: string
  ) => Promise<void>;
}) {
  const [detailLaporan, setDetailLaporan] = useState<Laporan | null>(null);
  const [tolakTarget, setTolakTarget] = useState<Laporan | null>(null);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [galatTolak, setGalatTolak] = useState<string | null>(null);

  useEffect(() => {
    if (!detailLaporan && !tolakTarget) return;
    const tanganiKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDetailLaporan(null);
        setTolakTarget(null);
      }
    };
    window.addEventListener('keydown', tanganiKeyboard);
    return () => window.removeEventListener('keydown', tanganiKeyboard);
  }, [detailLaporan, tolakTarget]);

  const totalHalaman = Math.max(1, Math.ceil(totalBaris / ukuranHalaman));
  const indeksAwal = totalBaris === 0 ? 0 : (halamanAktif - 1) * ukuranHalaman + 1;
  const indeksAkhir = Math.min(totalBaris, halamanAktif * ukuranHalaman);
  const deretHalaman = susunNomorHalaman(halamanAktif, totalHalaman);

  const kirimPenolakan = async () => {
    if (!tolakTarget) return;
    if (alasanTolak.trim().length < 5) {
      setGalatTolak('Alasan penolakan wajib diisi minimal 5 karakter.');
      return;
    }
    setGalatTolak(null);
    const idTarget = tolakTarget.id;
    const catatan = alasanTolak.trim();
    setTolakTarget(null);
    setAlasanTolak('');
    await onVerifikasi(idTarget, 'ditolak', catatan);
  };

  return (
    <section
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
      aria-label="Tabel laporan observasi lapangan real-time"
    >
      {/* Kepala Tabel: Judul, Pencarian, Filter Status, & Tombol Input Laporan */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink-900 sm:text-lg">
            Laporan Observasi Lapangan Real-Time
          </h2>
          <p className="text-xs text-ink-600">
            Data pengamatan terbaru dari seluruh WKPP (terhubung ke repository terpusat)
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <label htmlFor="cari-observasi-dashboard" className="sr-only">
              Cari kode laporan, wilayah, komoditas, OPT, atau petugas
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
              aria-hidden
            />
            <input
              id="cari-observasi-dashboard"
              type="search"
              value={kataKunci}
              onChange={(e) => onUbahKataKunci(e.target.value)}
              placeholder="Cari desa, komoditas, OPT..."
              className="min-h-[44px] w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs text-ink-900 placeholder:text-ink-600"
            />
          </div>

          <div>
            <label htmlFor="filter-status-dashboard" className="sr-only">
              Filter status verifikasi laporan
            </label>
            <select
              id="filter-status-dashboard"
              value={pilihanStatus}
              onChange={(e) =>
                onUbahPilihanStatus(e.target.value as PilihanStatusTabel)
              }
              className="min-h-[44px] w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-900 sm:w-auto"
            >
              <option value="terpublikasi">Semua Terpublikasi</option>
              <option value="menunggu">Menunggu Validasi</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          <Link
            to="/input-laporan"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 py-2 text-xs font-semibold text-surface hover:bg-brand-700"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden />
            <span>Input Laporan</span>
          </Link>
        </div>
      </div>

      {/* Isi Tabel / Kartu Ponsel */}
      <div className="mt-4">
        {memuat && daftarHalaman.length === 0 ? (
          <KerangkaMuat pesan="Memuat daftar observasi lapangan..." jumlahBaris={5} />
        ) : daftarHalaman.length === 0 ? (
          <KotakDataKosong
            judul="Tidak Ada Laporan Observasi"
            pesan="Tidak ditemukan laporan yang cocok dengan filter periode, wilayah, status, atau kata kunci pencarian saat ini."
          />
        ) : (
          <>
            {/* Tampilan Kartu Responsif untuk Ponsel (< 768px / 360px) */}
            <div className="space-y-3 md:hidden">
              {daftarHalaman.map((item) => {
                const luasSerang = item.luasRingan + item.luasBerat;
                const bolehVerifikasi = dapatVerifikasiLaporan(item, profilAktif);
                const memproses = sedangMemprosesId === item.id;
                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-line bg-canvas p-3.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-brand-900">
                        {item.kode}
                      </span>
                      <span className="tabular-nums text-ink-600">
                        {formatTanggalWaktu(item.dibuatPada)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <LencanaTingkatSerangan tingkat={item.tingkat} />
                      <LencanaStatusVerifikasi status={item.status} />
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <p className="font-semibold text-ink-900">
                        {item.namaKomoditas} — {item.namaOptLokal}{' '}
                        <em className="font-normal text-ink-600">
                          ({item.namaOptIlmiah})
                        </em>
                      </p>
                      <p className="text-ink-600">
                        Desa {item.namaDesa}, Kec. {item.namaKecamatan}, {item.namaKabupaten}
                      </p>
                      <p className="text-ink-600">
                        Petugas: <strong className="text-ink-900">{item.namaPetugas}</strong>{' '}
                        <span className="font-mono text-[11px]">
                          ({tampilkanNipSesuaiPeran(item.nipPetugas, item.petugasId, item.kabupatenId, profilAktif)})
                        </span>
                      </p>
                      <p className="tabular-nums font-semibold text-ink-900">
                        Luas Serangan: {formatLuas(luasSerang)} ({formatPersen(item.intensitasPersen)}) dari {formatLuas(item.luasAmatan)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-2.5">
                      <button
                        type="button"
                        onClick={() => setDetailLaporan(item)}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 font-semibold text-ink-900 hover:bg-brand-100"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                        <span>Detail</span>
                      </button>

                      {bolehVerifikasi && (
                        <>
                          <button
                            type="button"
                            disabled={memproses}
                            onClick={() => onVerifikasi(item.id, 'terverifikasi')}
                            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-900 px-3 py-2 font-semibold text-surface disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                            <span>Verifikasi</span>
                          </button>
                          <button
                            type="button"
                            disabled={memproses}
                            onClick={() => {
                              setTolakTarget(item);
                              setAlasanTolak('');
                              setGalatTolak(null);
                            }}
                            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-danger-600 px-3 py-2 font-semibold text-surface disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" aria-hidden />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Tampilan Tabel Penuh untuk Tablet & Desktop (>= 768px) */}
            <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-canvas text-left text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                  <tr>
                    <th className="px-3.5 py-3">Waktu &amp; Tanggal</th>
                    <th className="px-3.5 py-3">Petugas POPT</th>
                    <th className="px-3.5 py-3">Lokasi &amp; Wilayah</th>
                    <th className="px-3.5 py-3">Komoditas</th>
                    <th className="px-3.5 py-3">Jenis OPT</th>
                    <th className="px-3.5 py-3 text-right">Luas (Ha)</th>
                    <th className="px-3.5 py-3">Tingkat Serangan</th>
                    <th className="px-3.5 py-3">Status Verifikasi</th>
                    <th className="px-3.5 py-3">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface text-xs">
                  {daftarHalaman.map((item) => {
                    const luasSerang = item.luasRingan + item.luasBerat;
                    const bolehVerifikasi = dapatVerifikasiLaporan(item, profilAktif);
                    const memproses = sedangMemprosesId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-canvas/60">
                        <td className="px-3.5 py-3 align-top">
                          <p className="font-semibold tabular-nums text-ink-900">
                            {formatTanggalWaktu(item.dibuatPada)}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-ink-600">
                            {item.kode}
                          </p>
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <p className="font-semibold text-ink-900">
                            {item.namaPetugas}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-ink-600">
                            {tampilkanNipSesuaiPeran(
                              item.nipPetugas,
                              item.petugasId,
                              item.kabupatenId,
                              profilAktif
                            )}
                          </p>
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <p className="font-semibold text-ink-900">
                            Desa {item.namaDesa}, Kec. {item.namaKecamatan}
                          </p>
                          <p className="mt-0.5 text-ink-600">
                            {item.namaKabupaten} · {item.namaBlok}
                          </p>
                        </td>
                        <td className="px-3.5 py-3 align-top font-semibold text-ink-900">
                          {item.namaKomoditas}
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <p className="font-semibold text-ink-900">
                            {item.namaOptLokal}
                          </p>
                          <p className="mt-0.5 italic text-ink-600">
                            {item.namaOptIlmiah}
                          </p>
                        </td>
                        <td className="px-3.5 py-3 text-right align-top tabular-nums">
                          <p className="font-bold text-ink-900">
                            {formatLuas(luasSerang)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-ink-600">
                            {formatPersen(item.intensitasPersen)} dari{' '}
                            {formatAngka(item.luasAmatan, 0, 2)} Ha
                          </p>
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <LencanaTingkatSerangan tingkat={item.tingkat} />
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <LencanaStatusVerifikasi status={item.status} />
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailLaporan(item)}
                              className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-line bg-canvas px-3 py-1.5 font-semibold text-ink-900 hover:bg-brand-100"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden />
                              <span>Detail</span>
                            </button>

                            {bolehVerifikasi && (
                              <>
                                <button
                                  type="button"
                                  disabled={memproses}
                                  onClick={() => onVerifikasi(item.id, 'terverifikasi')}
                                  className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-brand-900 px-3 py-1.5 font-semibold text-surface hover:bg-brand-700 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={memproses}
                                  onClick={() => {
                                    setTolakTarget(item);
                                    setAlasanTolak('');
                                    setGalatTolak(null);
                                  }}
                                  className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-danger-100 px-3 py-1.5 font-semibold text-danger-600 hover:bg-danger-600 hover:text-surface disabled:opacity-50"
                                >
                                  <XCircle className="h-3.5 w-3.5" aria-hidden />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginasi sesuai DESIGN.md §4.1 & §5 */}
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
              <p className="text-ink-600 tabular-nums">
                Menampilkan <strong className="text-ink-900">{formatAngka(indeksAwal)}–{formatAngka(indeksAkhir)}</strong> dari{' '}
                <strong className="text-ink-900">{formatAngka(totalBaris)}</strong> laporan
              </p>

              <nav
                aria-label="Navigasi halaman tabel observasi"
                className="flex flex-wrap items-center gap-1"
              >
                <button
                  type="button"
                  disabled={halamanAktif <= 1}
                  onClick={() => onPilihHalaman(halamanAktif - 1)}
                  aria-label="Halaman sebelumnya"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-line bg-surface text-ink-900 hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>

                {deretHalaman.map((item, idx) =>
                  item === 'elipsis' ? (
                    <span
                      key={`elipsis-${idx}`}
                      className="px-2 text-ink-600"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      aria-current={item === halamanAktif ? 'page' : undefined}
                      onClick={() => onPilihHalaman(item)}
                      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-xs font-semibold tabular-nums ${
                        item === halamanAktif
                          ? 'border-brand-900 bg-brand-900 text-surface'
                          : 'border-line bg-surface text-ink-900 hover:bg-canvas'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={halamanAktif >= totalHalaman}
                  onClick={() => onPilihHalaman(halamanAktif + 1)}
                  aria-label="Halaman berikutnya"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-line bg-surface text-ink-900 hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail Laporan Ringkas */}
      {detailLaporan && (
        <ModalDetailObservasi
          laporan={detailLaporan}
          profilAktif={profilAktif}
          onTutup={() => setDetailLaporan(null)}
        />
      )}

      {/* Modal Konfirmasi Penolakan Laporan */}
      {tolakTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Tolak laporan ${tolakTarget.kode}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Tutup dialog"
            onClick={() => setTolakTarget(null)}
            className="absolute inset-0 bg-ink-900/40"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold text-danger-600">
                  {tolakTarget.kode}
                </p>
                <h3 className="text-base font-bold text-ink-900">
                  Tolak Laporan Observasi (Simulasi)
                </h3>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setTolakTarget(null)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-canvas"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="mt-3">
              <label
                htmlFor="alasan-tolak-laporan"
                className="block text-xs font-semibold text-ink-900"
              >
                Alasan Penolakan / Catatan Koreksi <span className="text-danger-600">*</span>
              </label>
              <textarea
                id="alasan-tolak-laporan"
                rows={3}
                value={alasanTolak}
                onChange={(e) => setAlasanTolak(e.target.value)}
                placeholder="Contoh: Koordinat blok perlu dikonfirmasi ulang dengan batas kebun..."
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas p-2.5 text-xs text-ink-900"
              />
              {galatTolak && (
                <p role="alert" className="mt-1.5 text-xs font-semibold text-danger-600">
                  {galatTolak}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTolakTarget(null)}
                className="min-h-[44px] rounded-lg border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={kirimPenolakan}
                className="min-h-[44px] rounded-lg bg-danger-600 px-4 py-2 text-xs font-semibold text-surface hover:opacity-95"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ModalDetailObservasi({
  laporan,
  profilAktif,
  onTutup,
}: {
  laporan: Laporan;
  profilAktif: ProfilPengguna;
  onTutup: () => void;
}) {
  const statusTeks: Record<StatusLaporan, string> = {
    draf: 'Draf',
    menunggu: 'Menunggu Validasi',
    terverifikasi: 'Terverifikasi',
    ditolak: 'Ditolak',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail laporan ${laporan.kode}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <button
        type="button"
        aria-label="Tutup detail laporan"
        onClick={onTutup}
        className="absolute inset-0 bg-ink-900/40"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
          <div>
            <p className="font-mono text-xs font-semibold text-brand-700">
              {laporan.kode} · DATA SIMULASI FASE 1
            </p>
            <h3 className="mt-0.5 text-lg font-bold text-ink-900">
              {laporan.namaKomoditas} — {laporan.namaOptLokal}{' '}
              <em className="font-normal text-ink-600">({laporan.namaOptIlmiah})</em>
            </h3>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onTutup}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-line hover:bg-canvas"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <LencanaTingkatSerangan tingkat={laporan.tingkat} />
          <LencanaStatusVerifikasi status={laporan.status} />
          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-ink-600">
            TW {laporan.triwulan} · Semester {laporan.semester} · {laporan.tahun}
          </span>
        </div>

        {laporan.fotos[0] && (
          <img
            src={laporan.fotos[0].pratinjauUrl}
            alt={`Foto simulasi geotagging ${laporan.namaOptLokal}`}
            className="mt-3 h-44 w-full rounded-xl border border-line object-cover"
          />
        )}

        <dl className="mt-4 grid gap-3 rounded-xl border border-line bg-canvas p-3.5 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink-600">Lokasi Pengamatan</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">
              Desa {laporan.namaDesa}, Kec. {laporan.namaKecamatan}, {laporan.namaKabupaten}
            </dd>
            <dd className="text-ink-600">{laporan.namaBlok}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-600">Koordinat WGS84</dt>
            <dd className="mt-0.5 font-mono font-semibold text-ink-900">
              {formatKoordinat(laporan.lat, laporan.lng)}
            </dd>
            <dd className="text-ink-600">{formatTanggalWaktu(laporan.dibuatPada)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-600">Rincian Luas &amp; Intensitas</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink-900">
              Amatan: {formatLuas(laporan.luasAmatan)} · Intensitas: {formatPersen(laporan.intensitasPersen)}
            </dd>
            <dd className="tabular-nums text-ink-600">
              Ringan: {formatLuas(laporan.luasRingan)} · Berat: {formatLuas(laporan.luasBerat)} · Terkendali: {formatLuas(laporan.luasTerkendali)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-600">Petugas POPT (Simulasi)</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">{laporan.namaPetugas}</dd>
            <dd className="font-mono text-ink-600">
              {tampilkanNipSesuaiPeran(
                laporan.nipPetugas,
                laporan.petugasId,
                laporan.kabupatenId,
                profilAktif
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-3 space-y-2 rounded-xl border border-line p-3.5 text-xs">
          <p className="font-bold uppercase tracking-wide text-ink-600">
            Rekomendasi Pengendalian Lapangan
          </p>
          <p className="text-ink-900">
            <strong>Kultur Teknis:</strong> {laporan.rekomendasiKultur || '-'}
          </p>
          <p className="text-ink-900">
            <strong>Hayati:</strong> {laporan.rekomendasiHayati || '-'}
          </p>
          <p className="text-ink-900">
            <strong>Kimiawi / Eradikasi:</strong> {laporan.rekomendasiKimiawi || '-'}
          </p>
          {laporan.catatanVerifikasi && (
            <p className="mt-2 rounded-lg bg-info-100 p-2 text-ink-900">
              <strong>Catatan {statusTeks[laporan.status]}:</strong> {laporan.catatanVerifikasi}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
