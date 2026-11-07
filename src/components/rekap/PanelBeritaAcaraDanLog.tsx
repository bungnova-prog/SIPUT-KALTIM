import {
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  History,
  ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  formatLuas,
  formatTanggalPendek,
  formatTanggalWaktu,
} from '../../lib/format';
import type { LogEkspor, RingkasanRekap } from '../../types/domain';
import { KotakDataKosong } from '../StatusMuatData';

interface PropsPanelBeritaAcaraDanLog {
  ringkasan: RingkasanRekap | null;
  filterRingkas: string;
  namaPenandatanganSimulasi: string;
  daftarLog: LogEkspor[];
  sedangCetakBeritaAcara: boolean;
  idLogSedangDiunduhUlang: string | null;
  onCetakBeritaAcaraPdf: () => void;
  onUnduhUlangLog: (entri: LogEkspor) => void;
}

const LABEL_TIPE_LOG: Record<LogEkspor['tipeDokumen'], string> = {
  rekap: 'Matriks Rekapitulasi',
  berita_acara: 'Berita Acara Simulasi',
  geodata: 'Geodata Spasial GIS',
  observasi: 'Observasi Lapangan',
};

export function PanelBeritaAcaraDanLog({
  ringkasan,
  filterRingkas,
  namaPenandatanganSimulasi,
  daftarLog,
  sedangCetakBeritaAcara,
  idLogSedangDiunduhUlang,
  onCetakBeritaAcaraPdf,
  onUnduhUlangLog,
}: PropsPanelBeritaAcaraDanLog) {
  const [filterFormat, setFilterFormat] = useState<'semua' | 'xlsx' | 'pdf'>('semua');

  const logTersaring = useMemo(() => {
    if (filterFormat === 'semua') return daftarLog;
    return daftarLog.filter((l) => l.format === filterFormat);
  }, [daftarLog, filterFormat]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* KARTU KIRI: STANDAR BERITA ACARA — WAJIB BERLABEL SIMULASI (DESIGN.md §4.4 & §7, SECURITY.md §11) */}
      <section
        aria-labelledby="judul-standar-berita-acara"
        className="rounded-2xl border border-line bg-surface p-4 sm:p-6 xl:col-span-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
            <h2
              id="judul-standar-berita-acara"
              className="text-base font-bold text-ink-900"
            >
              Standar Berita Acara (Pratinjau)
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-danger-600">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Simulasi</span>
          </span>
        </div>

        {/* Lembar Pratinjau Naskah Simulasi */}
        <div className="mt-4 rounded-xl border-2 border-dashed border-line bg-canvas/60 p-4 text-xs">
          <div className="rounded-lg bg-danger-100 px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wide text-danger-600">
            DOKUMEN SIMULASI FASE 1 — BUKAN NASKAH RESMI PEMERINTAH
          </div>

          <div className="mt-3 border-b border-line pb-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-600">
              Pemerintah Provinsi Kalimantan Timur (Contoh Tata Naskah)
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-brand-900">
              DINAS PERKEBUNAN — UPTD PROTEKSI TANAMAN PERKEBUNAN
            </p>
            <p className="mt-1 font-mono text-[11px] text-ink-600">
              Nomor Surat: [SIMULASI / BELUM DITERBITKAN]
            </p>
          </div>

          <div className="mt-3 space-y-2 leading-relaxed text-ink-900">
            <p>
              Pada tanggal <strong>{formatTanggalPendek(new Date())}</strong> (zona WITA),
              berdasarkan konsolidasi data simulasi parameter{' '}
              <strong className="text-brand-900">{filterRingkas}</strong>, tercatat ringkasan
              keadaan serangan OPT perkebunan sebagai berikut:
            </p>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-surface p-2.5">
              <div>
                <span className="block text-[10px] uppercase text-ink-600">
                  Total Luas Amatan
                </span>
                <strong className="tabular-nums text-ink-900">
                  {formatLuas(ringkasan?.totalLuasAmatan ?? 0)}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-ink-600">
                  Total Luas Serangan
                </span>
                <strong className="tabular-nums text-danger-600">
                  {formatLuas(ringkasan?.totalLuasTerdampak ?? 0)}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-ink-600">
                  Pengendalian & Eradikasi
                </span>
                <strong className="tabular-nums text-brand-900">
                  {formatLuas(ringkasan?.totalLuasTerkendali ?? 0)}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-ink-600">
                  Komoditas / OPT Utama
                </span>
                <strong className="text-ink-900">
                  {ringkasan?.komoditasUtama ?? '-'}
                </strong>
              </div>
            </div>

            <div className="mt-3 flex flex-col justify-between gap-2 rounded-lg border border-line bg-surface/80 p-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-ink-600">
                  Status Pengesahan Elektronik
                </p>
                <p className="font-semibold text-ink-900">
                  Tanpa Barcode / Tanpa Sertifikat BSrE (Mode Simulasi)
                </p>
                <p className="text-[11px] text-ink-600">
                  Disiapkan oleh: {namaPenandatanganSimulasi}
                </p>
              </div>
              <span className="self-start rounded-md border border-danger-600/30 bg-danger-100/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-danger-600 sm:self-center">
                CAP SIMULASI
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={sedangCetakBeritaAcara}
          onClick={onCetakBeritaAcaraPdf}
          className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
        >
          <FileText className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            {sedangCetakBeritaAcara
              ? 'Membuat PDF Berita Acara...'
              : 'Cetak Berita Acara PDF (Simulasi)'}
          </span>
        </button>
      </section>

      {/* KARTU KANAN: LOG EKSPOR & RIWAYAT UNDUHAN (DESIGN.md §4.4) */}
      <section
        aria-labelledby="judul-log-ekspor"
        className="rounded-2xl border border-line bg-surface p-4 sm:p-6 xl:col-span-7"
      >
        <div className="flex flex-col gap-3 border-b border-line pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
              <h2 id="judul-log-ekspor" className="text-base font-bold text-ink-900">
                Log Ekspor & Riwayat Unduhan
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-ink-600">
              Setiap unduhan Excel dan PDF otomatis tercatat beserta parameter filter aktifnya.
            </p>
          </div>

          <div
            role="group"
            aria-label="Saring riwayat format berkas"
            className="inline-flex rounded-xl bg-canvas p-1"
          >
            {(
              [
                { id: 'semua', label: 'Semua' },
                { id: 'xlsx', label: 'Excel' },
                { id: 'pdf', label: 'PDF' },
              ] as const
            ).map((opsi) => {
              const aktif = filterFormat === opsi.id;
              return (
                <button
                  key={opsi.id}
                  type="button"
                  onClick={() => setFilterFormat(opsi.id)}
                  aria-pressed={aktif}
                  className={`min-h-[44px] rounded-lg px-3 py-1.5 text-xs font-bold sm:min-h-[38px] ${
                    aktif
                      ? 'bg-brand-900 text-surface'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {opsi.label}
                </button>
              );
            })}
          </div>
        </div>

        {logTersaring.length === 0 ? (
          <div className="mt-4">
            <KotakDataKosong
              judul="Belum Ada Riwayat Unduhan"
              pesan="Gunakan tombol Unduh Microsoft Excel atau Cetak Berita Acara PDF untuk membuat berkas simulasi."
            />
          </div>
        ) : (
          <>
            {/* Tabel Desktop */}
            <div className="mt-4 hidden max-h-[400px] overflow-y-auto md:block">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-canvas text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  <tr className="border-b border-line">
                    <th className="px-3 py-2.5">Berkas & Filter</th>
                    <th className="px-3 py-2.5">Format / Tipe</th>
                    <th className="px-3 py-2.5">Petugas / Operator</th>
                    <th className="px-3 py-2.5">Waktu Unduh</th>
                    <th className="px-3 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {logTersaring.map((entri) => {
                    const sedangProses = idLogSedangDiunduhUlang === entri.id;
                    return (
                      <tr key={entri.id} className="hover:bg-canvas/50">
                        <td className="max-w-[210px] px-3 py-3">
                          <p
                            className="truncate font-mono text-[11px] font-bold text-ink-900"
                            title={entri.namaBerkas}
                          >
                            {entri.namaBerkas}
                          </p>
                          <p
                            className="mt-0.5 truncate text-[11px] text-ink-600"
                            title={entri.filterRingkas}
                          >
                            {entri.filterRingkas}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              entri.format === 'xlsx'
                                ? 'bg-ok-100 text-ink-900'
                                : 'bg-danger-100 text-danger-600'
                            }`}
                          >
                            {entri.format === 'xlsx' ? (
                              <FileSpreadsheet className="h-3 w-3 text-ok-500" aria-hidden />
                            ) : (
                              <FileText className="h-3 w-3" aria-hidden />
                            )}
                            <span>{entri.format.toUpperCase()}</span>
                          </span>
                          <p className="mt-0.5 text-[11px] text-ink-600">
                            {LABEL_TIPE_LOG[entri.tipeDokumen]}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-ink-900">{entri.namaPengguna}</p>
                          <p className="text-[11px] uppercase text-ink-600">
                            {entri.peranPengguna}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[11px] text-ink-600">
                          {formatTanggalWaktu(entri.dibuatPada)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            disabled={sedangProses}
                            onClick={() => onUnduhUlangLog(entri)}
                            className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-brand-900 hover:bg-brand-100/60 disabled:opacity-60"
                          >
                            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span>{sedangProses ? 'Mengunduh...' : 'Unduh Ulang'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Daftar Kartu Ponsel (< 768px — Lebar 360px) */}
            <div className="mt-4 space-y-2.5 md:hidden">
              {logTersaring.slice(0, 10).map((entri) => {
                const sedangProses = idLogSedangDiunduhUlang === entri.id;
                return (
                  <article
                    key={entri.id}
                    className="space-y-2 rounded-xl border border-line bg-canvas/50 p-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="break-all font-mono text-[11px] font-bold text-ink-900">
                        {entri.namaBerkas}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          entri.format === 'xlsx'
                            ? 'bg-ok-100 text-ink-900'
                            : 'bg-danger-100 text-danger-600'
                        }`}
                      >
                        {entri.format}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-600">
                      {LABEL_TIPE_LOG[entri.tipeDokumen]} · {entri.filterRingkas}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-ink-600">
                      <span className="font-semibold text-ink-900">{entri.namaPengguna}</span>
                      <span>{formatTanggalWaktu(entri.dibuatPada)}</span>
                    </div>
                    <button
                      type="button"
                      disabled={sedangProses}
                      onClick={() => onUnduhUlangLog(entri)}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 font-bold text-brand-900 hover:bg-brand-100/60 disabled:opacity-60"
                    >
                      <Download className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{sedangProses ? 'Mengunduh Ulang...' : 'Unduh Ulang Berkas'}</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
