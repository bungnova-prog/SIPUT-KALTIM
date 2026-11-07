import {
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  ShieldAlert,
  Table2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KerangkaMuat, KotakGalatData } from '../components/StatusMuatData';
import { PanelBeritaAcaraDanLog } from '../components/rekap/PanelBeritaAcaraDanLog';
import { jalankanUnduhUlangLog } from '../lib/analitikRekap';
import { formatAngka, formatLuas } from '../lib/format';
import { periodeBawaanSistem } from '../lib/klasifikasi';
import { useAppStore } from '../lib/storeAplikasi';
import {
  eksporService,
  komoditasOptRepository,
  laporanRepository,
  logEksporRepository,
  rekapRepository,
  wilayahRepository,
} from '../services';
import type {
  FilterLaporan,
  Komoditas,
  LogEkspor,
  RingkasanRekap,
  Wilayah,
} from '../types/domain';

export default function HalamanEkspor() {
  const profilAktif = useAppStore((s) => s.profilAktif);
  const tambahToast = useAppStore((s) => s.tambahToast);

  const periodeSistem = useMemo(() => periodeBawaanSistem(), []);

  const [modePeriode, setModePeriode] =
    useState<'realtime' | 'triwulan' | 'semester' | 'tahunan'>('triwulan');
  const [tahun, setTahun] = useState<number>(periodeSistem.tahun);
  const [triwulan, setTriwulan] = useState<1 | 2 | 3 | 4>(periodeSistem.triwulan);
  const [semester, setSemester] = useState<1 | 2>(periodeSistem.semester);
  const [kabupatenId, setKabupatenId] = useState<string>('');
  const [komoditasId, setKomoditasId] = useState<string>('');

  const [daftarKabupaten, setDaftarKabupaten] = useState<Wilayah[]>([]);
  const [daftarKomoditas, setDaftarKomoditas] = useState<Komoditas[]>([]);
  const [ringkasan, setRingkasan] = useState<RingkasanRekap | null>(null);
  const [daftarLog, setDaftarLog] = useState<LogEkspor[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  const [paketAktif, setPaketAktif] = useState<string | null>(null);
  const [idLogUnduhUlang, setIdLogUnduhUlang] = useState<string | null>(null);

  const filterAktif = useMemo<FilterLaporan>(
    () => ({
      modePeriode,
      tahun,
      triwulan: modePeriode === 'triwulan' ? triwulan : undefined,
      semester: modePeriode === 'semester' ? semester : undefined,
      kabupatenId: kabupatenId || undefined,
      komoditasIds: komoditasId ? [komoditasId] : undefined,
    }),
    [kabupatenId, komoditasId, modePeriode, semester, tahun, triwulan]
  );

  const filterRingkas = useMemo(() => {
    const labelPeriode =
      modePeriode === 'triwulan'
        ? `TW ${triwulan} ${tahun}`
        : modePeriode === 'semester'
          ? `Semester ${semester} ${tahun}`
          : modePeriode === 'tahunan'
            ? `Tahunan ${tahun}`
            : `Real-Time ${tahun}`;
    const namaKab = kabupatenId
      ? daftarKabupaten.find((k) => k.id === kabupatenId)?.nama ?? kabupatenId
      : 'Seluruh Kaltim';
    const namaKom = komoditasId
      ? daftarKomoditas.find((k) => k.id === komoditasId)?.nama ?? komoditasId
      : 'Semua Komoditas';
    return `${labelPeriode} · ${namaKab} · ${namaKom}`;
  }, [
    daftarKabupaten,
    daftarKomoditas,
    kabupatenId,
    komoditasId,
    modePeriode,
    semester,
    tahun,
    triwulan,
  ]);

  const muatLog = useCallback(() => {
    logEksporRepository.daftar().then((res) => {
      if (res.ok) setDaftarLog(res.data);
    });
  }, []);

  useEffect(() => {
    Promise.all([
      wilayahRepository.daftarKabupaten(),
      komoditasOptRepository.daftarKomoditas(),
    ]).then(([resKab, resKom]) => {
      if (resKab.ok) setDaftarKabupaten(resKab.data);
      if (resKom.ok) setDaftarKomoditas(resKom.data.filter((k) => k.aktif));
    });

    muatLog();
    const berhentiLog = logEksporRepository.langganan(muatLog);
    return berhentiLog;
  }, [muatLog]);

  const muatRingkasan = useCallback(async () => {
    setMemuat(true);
    setGalat(null);
    const res = await rekapRepository.ringkasan(filterAktif);
    if (!res.ok) {
      setGalat(res.pesan);
    } else {
      setRingkasan(res.data);
    }
    setMemuat(false);
  }, [filterAktif]);

  useEffect(() => {
    void muatRingkasan();
    const berhentiLaporan = laporanRepository.langganan(filterAktif, () => {
      void muatRingkasan();
    });
    return berhentiLaporan;
  }, [filterAktif, muatRingkasan]);

  const jalankanEkspor = async (
    kodePaket: 'rekap_xlsx' | 'berita_acara_pdf' | 'observasi_xlsx' | 'geodata_pdf'
  ) => {
    setPaketAktif(kodePaket);
    const hasil =
      kodePaket === 'rekap_xlsx'
        ? await eksporService.eksporRekapExcel(filterAktif, profilAktif, filterRingkas)
        : kodePaket === 'berita_acara_pdf'
          ? await eksporService.eksporBeritaAcaraPdf(
              filterAktif,
              profilAktif,
              filterRingkas
            )
          : kodePaket === 'observasi_xlsx'
            ? await eksporService.eksporObservasiExcel(
                filterAktif,
                profilAktif,
                filterRingkas,
                'observasi'
              )
            : await eksporService.eksporPetaSpasialPdf(
                filterAktif,
                profilAktif,
                filterRingkas
              );
    setPaketAktif(null);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Ekspor Berkas Gagal',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void jalankanEkspor(kodePaket);
        },
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Berkas Ekspor Siap',
      pesan: `${hasil.data.namaBerkas} berhasil diunduh dan tercatat di Log Ekspor.`,
    });
  };

  const tanganiUnduhUlang = async (entri: LogEkspor) => {
    setIdLogUnduhUlang(entri.id);
    const hasil = await jalankanUnduhUlangLog(entri, eksporService, profilAktif);
    setIdLogUnduhUlang(null);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Unduh Ulang Gagal',
        pesan: hasil.pesan,
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Berkas Diunduh Ulang',
      pesan: `${hasil.data.namaBerkas} dibuat ulang sesuai filter log.`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Kepala Halaman Pusat Ekspor */}
      <header className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-900">
                Data Simulasi
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-0.5 text-[11px] font-bold text-danger-600">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                <span>Tanpa Pengesahan Elektronik Resmi</span>
              </span>
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold text-brand-900 sm:text-2xl">
              Pusat Ekspor Laporan (Excel & PDF)
            </h1>
            <p className="mt-0.5 text-xs text-ink-600 sm:text-sm">
              Unduh matriks rekapitulasi, tabel observasi lapangan (dilengkapi netralisasi rumus
              Excel & penyamaran NIP sesuai peran), dan Berita Acara Simulasi.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs">
            <span className="block text-[10px] font-bold uppercase text-ink-600">
              Cakupan Filter Saat Ini
            </span>
            <strong className="text-sm font-extrabold tabular-nums text-brand-900">
              {formatAngka(ringkasan?.totalLaporan ?? 0)} Laporan ·{' '}
              {formatLuas(ringkasan?.totalLuasTerdampak ?? 0)} Serangan
            </strong>
          </div>
        </div>

        {/* Filter Parameter Ekspor */}
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="ekspor-mode-periode"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Skala Periode
            </label>
            <select
              id="ekspor-mode-periode"
              value={modePeriode}
              onChange={(e) =>
                setModePeriode(
                  e.target.value as 'realtime' | 'triwulan' | 'semester' | 'tahunan'
                )
              }
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900"
            >
              <option value="triwulan">Per Triwulan</option>
              <option value="semester">Per Semester</option>
              <option value="tahunan">Tahunan Penuh</option>
              <option value="realtime">Real-Time Semua Periode</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ekspor-detail-periode"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Tahun & Rincian Periode
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <select
                id="ekspor-detail-periode"
                value={tahun}
                onChange={(e) => setTahun(Number.parseInt(e.target.value, 10))}
                className="min-h-[44px] rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-semibold tabular-nums text-ink-900"
              >
                <option value={periodeSistem.tahun}>{periodeSistem.tahun}</option>
                <option value={periodeSistem.tahun - 1}>{periodeSistem.tahun - 1}</option>
              </select>

              {modePeriode === 'triwulan' && (
                <select
                  aria-label="Pilih Triwulan Ekspor"
                  value={triwulan}
                  onChange={(e) =>
                    setTriwulan(Number.parseInt(e.target.value, 10) as 1 | 2 | 3 | 4)
                  }
                  className="min-h-[44px] rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-semibold text-ink-900"
                >
                  <option value={1}>TW I</option>
                  <option value={2}>TW II</option>
                  <option value={3}>TW III</option>
                  <option value={4}>TW IV</option>
                </select>
              )}

              {modePeriode === 'semester' && (
                <select
                  aria-label="Pilih Semester Ekspor"
                  value={semester}
                  onChange={(e) =>
                    setSemester(Number.parseInt(e.target.value, 10) as 1 | 2)
                  }
                  className="min-h-[44px] rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-semibold text-ink-900"
                >
                  <option value={1}>Sem I</option>
                  <option value={2}>Sem II</option>
                </select>
              )}

              {(modePeriode === 'tahunan' || modePeriode === 'realtime') && (
                <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-canvas px-2 text-[11px] font-semibold text-ink-600">
                  Penuh
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="ekspor-kabupaten"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Kabupaten / Kota
            </label>
            <select
              id="ekspor-kabupaten"
              value={kabupatenId}
              onChange={(e) => setKabupatenId(e.target.value)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900"
            >
              <option value="">Seluruh Kalimantan Timur</option>
              {daftarKabupaten.map((kab) => (
                <option key={kab.id} value={kab.id}>
                  {kab.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ekspor-komoditas"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Komoditas Baku
            </label>
            <select
              id="ekspor-komoditas"
              value={komoditasId}
              onChange={(e) => setKomoditasId(e.target.value)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900"
            >
              <option value="">Semua 7 Komoditas Baku</option>
              {daftarKomoditas.map((kom) => (
                <option key={kom.id} value={kom.id}>
                  {kom.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {galat && (
        <KotakGalatData
          pesan={galat}
          onCobaLagi={() => {
            void muatRingkasan();
          }}
        />
      )}

      {memuat && !ringkasan ? (
        <KerangkaMuat pesan="Menyiapkan paket ekspor laporan..." jumlahBaris={4} />
      ) : (
        <>
          {/* Empat Kartu Paket Dokumen Ekspor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ok-100 text-ok-500">
                  <Table2 className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-3 text-sm font-bold text-ink-900">
                  Matriks Kabupaten/Kota (.xlsx)
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Tabel konsolidasi 10 kabupaten/kota lengkap dengan kolom ringan, berat, dan baris
                  total provinsi.
                </p>
              </div>
              <button
                type="button"
                disabled={paketAktif !== null}
                onClick={() => {
                  void jalankanEkspor('rekap_xlsx');
                }}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand-100 px-3 py-2.5 text-xs font-bold text-brand-900 hover:bg-brand-100/80 disabled:opacity-60"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {paketAktif === 'rekap_xlsx' ? 'Mengunduh...' : 'Unduh Matriks Excel'}
                </span>
              </button>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-900">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-3 text-sm font-bold text-ink-900">
                  Berita Acara Rekapitulasi (.pdf)
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Dokumen cetak A4 lanskap berlabel Simulasi berisi ringkasan eksekutif dan matriks
                  provinsi.
                </p>
              </div>
              <button
                type="button"
                disabled={paketAktif !== null}
                onClick={() => {
                  void jalankanEkspor('berita_acara_pdf');
                }}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand-900 px-3 py-2.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {paketAktif === 'berita_acara_pdf' ? 'Mencetak...' : 'Cetak Berita Acara PDF'}
                </span>
              </button>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-ink-900">
                  <FileSpreadsheet className="h-5 w-5 text-brand-900" aria-hidden />
                </span>
                <h2 className="mt-3 text-sm font-bold text-ink-900">
                  Rincian Observasi Lapangan (.xlsx)
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Daftar laporan pengamatan POPT per petak contoh dengan penyamaran NIP sesuai hak
                  peran aktif.
                </p>
              </div>
              <button
                type="button"
                disabled={paketAktif !== null}
                onClick={() => {
                  void jalankanEkspor('observasi_xlsx');
                }}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-bold text-brand-900 hover:bg-canvas disabled:opacity-60"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {paketAktif === 'observasi_xlsx' ? 'Mengunduh...' : 'Unduh Observasi Excel'}
                </span>
              </button>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-3 text-sm font-bold text-ink-900">
                  Rekap Kerentanan Spasial (.pdf)
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Ringkasan peringkat wilayah paling rentan beserta rekomendasi pengendalian
                  spasial WGS84.
                </p>
              </div>
              <button
                type="button"
                disabled={paketAktif !== null}
                onClick={() => {
                  void jalankanEkspor('geodata_pdf');
                }}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-danger-600 px-3 py-2.5 text-xs font-bold text-surface hover:opacity-95 disabled:opacity-60"
              >
                <FileText className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {paketAktif === 'geodata_pdf' ? 'Mencetak...' : 'Cetak Spasial PDF'}
                </span>
              </button>
            </article>
          </div>

          {/* Pratinjau Berita Acara Simulasi & Tabel Log Ekspor */}
          <PanelBeritaAcaraDanLog
            ringkasan={ringkasan}
            filterRingkas={filterRingkas}
            namaPenandatanganSimulasi={`${profilAktif.nama} (${profilAktif.jabatan})`}
            daftarLog={daftarLog}
            sedangCetakBeritaAcara={paketAktif === 'berita_acara_pdf'}
            idLogSedangDiunduhUlang={idLogUnduhUlang}
            onCetakBeritaAcaraPdf={() => {
              void jalankanEkspor('berita_acara_pdf');
            }}
            onUnduhUlangLog={(entri) => {
              void tanganiUnduhUlang(entri);
            }}
          />
        </>
      )}
    </div>
  );
}
