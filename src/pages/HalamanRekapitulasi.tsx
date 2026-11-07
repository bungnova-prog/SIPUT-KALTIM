import {
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Minus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KerangkaMuat,
  KotakGalatData,
} from '../components/StatusMuatData';
import { GrafikRekapitulasi } from '../components/rekap/GrafikRekapitulasi';
import { PanelBeritaAcaraDanLog } from '../components/rekap/PanelBeritaAcaraDanLog';
import { TabelMatriksKabupaten } from '../components/rekap/TabelMatriksKabupaten';
import {
  buatFilterPembanding,
  hitungPersenPerubahan,
  jalankanUnduhUlangLog,
} from '../lib/analitikRekap';
import {
  formatAngka,
  formatLuas,
  formatPersen,
  formatWaktuWita,
} from '../lib/format';
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
  BarisIntensitasKomoditas,
  BarisMatriksKabupaten,
  BarisTrenTriwulanKomoditas,
  FilterLaporan,
  Komoditas,
  LogEkspor,
  RingkasanRekap,
  Uptd,
} from '../types/domain';

type ModePeriodeRekap = 'triwulan' | 'semester' | 'tahunan';

interface DrafParameterRekap {
  modePeriode: ModePeriodeRekap;
  tahun: number;
  triwulan: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  komoditasId: string;
  uptdId: string;
}

function susunFilterRekap(draf: DrafParameterRekap): FilterLaporan {
  return {
    modePeriode: draf.modePeriode,
    tahun: draf.tahun,
    triwulan: draf.modePeriode === 'triwulan' ? draf.triwulan : undefined,
    semester: draf.modePeriode === 'semester' ? draf.semester : undefined,
    komoditasIds: draf.komoditasId ? [draf.komoditasId] : undefined,
    uptdId: draf.uptdId || undefined,
  };
}

function LencanaPerubahan({
  persen,
  arah,
  naikBerartiPositif,
}: {
  persen: number;
  arah: 'naik' | 'turun' | 'stabil';
  naikBerartiPositif: boolean;
}) {
  if (arah === 'stabil') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-600">
        <Minus className="h-3 w-3" aria-hidden />
        <span>Stabil (0%)</span>
      </span>
    );
  }

  const baik =
    (arah === 'naik' && naikBerartiPositif) ||
    (arah === 'turun' && !naikBerartiPositif);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
        baik ? 'bg-ok-100 text-ink-900' : 'bg-danger-100 text-danger-600'
      }`}
    >
      {arah === 'naik' ? (
        <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
      ) : (
        <ArrowDownRight className="h-3 w-3 shrink-0" aria-hidden />
      )}
      <span>
        {arah === 'naik' ? '+' : '-'}
        {formatPersen(persen)} vs periode lalu
      </span>
    </span>
  );
}

export default function HalamanRekapitulasi() {
  const profilAktif = useAppStore((s) => s.profilAktif);
  const tambahToast = useAppStore((s) => s.tambahToast);

  const periodeSistem = useMemo(() => periodeBawaanSistem(), []);

  const drafAwal = useMemo<DrafParameterRekap>(
    () => ({
      modePeriode: 'triwulan',
      tahun: periodeSistem.tahun,
      triwulan: periodeSistem.triwulan,
      semester: periodeSistem.semester,
      komoditasId: '',
      uptdId: '',
    }),
    [periodeSistem]
  );

  const [draf, setDraf] = useState<DrafParameterRekap>(drafAwal);
  const [filterAktif, setFilterAktif] = useState<FilterLaporan>(() =>
    susunFilterRekap(drafAwal)
  );

  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [waktuSinkronTerakhir, setWaktuSinkronTerakhir] = useState<Date>(() => new Date());

  const [daftarKomoditas, setDaftarKomoditas] = useState<Komoditas[]>([]);
  const [daftarUptd, setDaftarUptd] = useState<Uptd[]>([]);

  const [ringkasan, setRingkasan] = useState<RingkasanRekap | null>(null);
  const [ringkasanPembanding, setRingkasanPembanding] =
    useState<RingkasanRekap | null>(null);
  const [matriks, setMatriks] = useState<BarisMatriksKabupaten[]>([]);
  const [trenTriwulan, setTrenTriwulan] = useState<BarisTrenTriwulanKomoditas[]>([]);
  const [intensitasKomoditas, setIntensitasKomoditas] = useState<
    BarisIntensitasKomoditas[]
  >([]);
  const [daftarLog, setDaftarLog] = useState<LogEkspor[]>([]);

  const [sedangUnduhExcel, setSedangUnduhExcel] = useState(false);
  const [sedangCetakPdf, setSedangCetakPdf] = useState(false);
  const [idLogUnduhUlang, setIdLogUnduhUlang] = useState<string | null>(null);

  // Muat referensi komoditas, UPTD, dan log ekspor
  const muatLogEkspor = useCallback(() => {
    logEksporRepository.daftar().then((res) => {
      if (res.ok) setDaftarLog(res.data);
    });
  }, []);

  useEffect(() => {
    Promise.all([
      komoditasOptRepository.daftarKomoditas(),
      wilayahRepository.daftarUptd(),
    ]).then(([resKom, resUptd]) => {
      if (resKom.ok) setDaftarKomoditas(resKom.data.filter((k) => k.aktif));
      if (resUptd.ok) setDaftarUptd(resUptd.data);
    });

    muatLogEkspor();
    const berhentiLog = logEksporRepository.langganan(muatLogEkspor);
    const berhentiKom = komoditasOptRepository.langganan(() => {
      komoditasOptRepository.daftarKomoditas().then((res) => {
        if (res.ok) setDaftarKomoditas(res.data.filter((k) => k.aktif));
      });
    });

    return () => {
      berhentiLog();
      berhentiKom();
    };
  }, [muatLogEkspor]);

  // Muat seluruh data rekapitulasi dari repository tunggal
  const muatDataRekap = useCallback(async () => {
    setMemuat(true);
    setGalat(null);

    const filterSebanding = buatFilterPembanding(filterAktif);
    const tahunGrafik = filterAktif.tahun ?? periodeSistem.tahun;

    const [
      resRingkasan,
      resPembanding,
      resMatriks,
      resTrenTw,
      resIntensitasKom,
    ] = await Promise.all([
      rekapRepository.ringkasan(filterAktif),
      rekapRepository.ringkasan(filterSebanding),
      rekapRepository.matriksKabupaten(filterAktif),
      rekapRepository.trenTriwulanKomoditas(tahunGrafik, {
        uptdId: filterAktif.uptdId,
        komoditasIds: filterAktif.komoditasIds,
      }),
      rekapRepository.intensitasPerKomoditas(filterAktif),
    ]);

    if (!resRingkasan.ok) {
      setGalat(resRingkasan.pesan);
      setMemuat(false);
      return;
    }
    if (!resMatriks.ok) {
      setGalat(resMatriks.pesan);
      setMemuat(false);
      return;
    }

    setRingkasan(resRingkasan.data);
    if (resPembanding.ok) setRingkasanPembanding(resPembanding.data);
    setMatriks(resMatriks.data);
    if (resTrenTw.ok) setTrenTriwulan(resTrenTw.data);
    if (resIntensitasKom.ok) setIntensitasKomoditas(resIntensitasKom.data);
    setWaktuSinkronTerakhir(new Date());
    setMemuat(false);
  }, [filterAktif, periodeSistem.tahun]);

  useEffect(() => {
    void muatDataRekap();
    const berhentiLaporan = laporanRepository.langganan(filterAktif, () => {
      void muatDataRekap();
    });
    return berhentiLaporan;
  }, [filterAktif, muatDataRekap]);

  // Keterangan filter aktif
  const keteranganFilterAktif = useMemo(() => {
    const labelPeriode =
      filterAktif.modePeriode === 'triwulan'
        ? `Triwulan ${filterAktif.triwulan ?? 1} TA ${filterAktif.tahun ?? periodeSistem.tahun}`
        : filterAktif.modePeriode === 'semester'
          ? `Semester ${filterAktif.semester ?? 1} TA ${filterAktif.tahun ?? periodeSistem.tahun}`
          : `Tahunan Penuh TA ${filterAktif.tahun ?? periodeSistem.tahun}`;

    const namaKom = filterAktif.komoditasIds?.[0]
      ? daftarKomoditas.find((k) => k.id === filterAktif.komoditasIds?.[0])?.nama ??
        'Komoditas Terpilih'
      : 'Semua 7 Komoditas Baku';

    const namaUptd = filterAktif.uptdId
      ? daftarUptd.find((u) => u.id === filterAktif.uptdId)?.nama ?? 'UPTD Terpilih'
      : 'Seluruh Wilayah / 10 UPTD Kaltim';

    return `${labelPeriode} · ${namaKom} · ${namaUptd}`;
  }, [daftarKomoditas, daftarUptd, filterAktif, periodeSistem.tahun]);

  const totalPengamatUptd = useMemo(
    () => daftarUptd.reduce((acc, u) => acc + u.jumlahPengamatAktif, 0),
    [daftarUptd]
  );

  // Delta persentase pada 4 kartu ringkasan
  const deltaAmatan = hitungPersenPerubahan(
    ringkasan?.totalLuasAmatan ?? 0,
    ringkasanPembanding?.totalLuasAmatan ?? 0
  );
  const deltaSerangan = hitungPersenPerubahan(
    ringkasan?.totalLuasTerdampak ?? 0,
    ringkasanPembanding?.totalLuasTerdampak ?? 0
  );
  const deltaBerat = hitungPersenPerubahan(
    ringkasan?.totalLuasBerat ?? 0,
    ringkasanPembanding?.totalLuasBerat ?? 0
  );
  const deltaPengendalian = hitungPersenPerubahan(
    ringkasan?.totalLuasTerkendali ?? 0,
    ringkasanPembanding?.totalLuasTerkendali ?? 0
  );

  // Penangan Aksi Ekspor & Filter
  const tanganiTerapkanFilter = () => {
    setFilterAktif(susunFilterRekap(draf));
  };

  const tanganiResetFilter = () => {
    setDraf(drafAwal);
    setFilterAktif(susunFilterRekap(drafAwal));
  };

  const tanganiUnduhExcel = async () => {
    setSedangUnduhExcel(true);
    const hasil = await eksporService.eksporRekapExcel(
      filterAktif,
      profilAktif,
      keteranganFilterAktif
    );
    setSedangUnduhExcel(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mengunduh Excel Rekapitulasi',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void tanganiUnduhExcel();
        },
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Matriks Excel Berhasil Diunduh',
      pesan: `${hasil.data.namaBerkas} siap digunakan dan telah tercatat di Log Ekspor.`,
    });
  };

  const tanganiCetakBeritaAcaraPdf = async () => {
    setSedangCetakPdf(true);
    const hasil = await eksporService.eksporBeritaAcaraPdf(
      filterAktif,
      profilAktif,
      keteranganFilterAktif
    );
    setSedangCetakPdf(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mencetak Berita Acara PDF',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void tanganiCetakBeritaAcaraPdf();
        },
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Berita Acara PDF (Simulasi) Diunduh',
      pesan: `${hasil.data.namaBerkas} telah diunduh dan tercatat di Log Ekspor.`,
    });
  };

  const tanganiUnduhUlangDariLog = async (entri: LogEkspor) => {
    setIdLogUnduhUlang(entri.id);
    const hasil = await jalankanUnduhUlangLog(entri, eksporService, profilAktif);
    setIdLogUnduhUlang(null);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mengunduh Ulang Berkas',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void tanganiUnduhUlangDariLog(entri);
        },
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Unduh Ulang Berhasil',
      pesan: `Berkas ${hasil.data.namaBerkas} dibuat ulang sesuai filter tersimpan.`,
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. BANNER HERO HIJAU TUA + KARTU SINKRONISASI DATA UPTD (DESIGN.md §4.4) */}
      <header className="rounded-2xl bg-brand-900 p-5 text-surface sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-900">
                Data Simulasi Fase 1
              </span>
              <span className="text-xs font-semibold text-brand-100">
                Dinas Perkebunan Provinsi Kalimantan Timur
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
              Rekapitulasi Triwulan, Semester & Pusat Ekspor Laporan
            </h1>
            <p className="text-xs leading-relaxed text-brand-100 sm:text-sm">
              Konsolidasi terpadu matriks serangan OPT pada 7 kabupaten dan 3 kota se-Kalimantan
              Timur, lengkap dengan pencetakan Berita Acara Simulasi dan jejak audit unduhan.
            </p>
          </div>

          {/* Kartu Sinkronisasi Data UPTD */}
          <div className="shrink-0 rounded-2xl border border-brand-700 bg-brand-700/75 p-4 xl:w-80">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gold-500">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                <span>Sinkronisasi Data UPTD</span>
              </span>
              <span className="rounded-full bg-ok-500 px-2 py-0.5 text-[10px] font-bold text-surface">
                10/10 Wilayah
              </span>
            </div>
            <p className="mt-2 text-sm font-extrabold">
              {formatAngka(ringkasan?.laporanTerverifikasi ?? 0)} Terverifikasi ·{' '}
              {formatAngka(ringkasan?.laporanMenunggu ?? 0)} Menunggu
            </p>
            <p className="mt-1 text-[11px] text-brand-100">
              {totalPengamatUptd} Pengamat Aktif · Diperbarui {formatWaktuWita(waktuSinkronTerakhir)}
            </p>
          </div>
        </div>
      </header>

      {/* 2. KARTU PARAMETER FILTER + PUSAT EKSPOR (DESIGN.md §4.4) */}
      <section
        aria-label="Parameter rekapitulasi dan pusat ekspor cepat"
        className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tab Triwulan / Semester / Tahunan Penuh */}
          <div
            role="tablist"
            aria-label="Skala periode rekapitulasi"
            className="grid grid-cols-3 gap-1 rounded-xl bg-canvas p-1 sm:inline-flex"
          >
            {(
              [
                { id: 'triwulan', label: 'Triwulan' },
                { id: 'semester', label: 'Semester' },
                { id: 'tahunan', label: 'Tahunan Penuh' },
              ] as const
            ).map((tab) => {
              const aktif = draf.modePeriode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={aktif}
                  onClick={() => setDraf((s) => ({ ...s, modePeriode: tab.id }))}
                  className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
                    aktif
                      ? 'bg-brand-900 text-surface shadow-sm'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Pusat Ekspor: Unduh Microsoft Excel (Hijau Muda) & Cetak Berita Acara PDF (Hijau Tua) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={sedangUnduhExcel}
              onClick={() => {
                void tanganiUnduhExcel();
              }}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-100 px-4 py-2.5 text-xs font-bold text-brand-900 hover:bg-brand-100/80 disabled:opacity-60 sm:flex-none"
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                {sedangUnduhExcel ? 'Menyiapkan Excel...' : 'Unduh Microsoft Excel'}
              </span>
            </button>

            <button
              type="button"
              disabled={sedangCetakPdf}
              onClick={() => {
                void tanganiCetakBeritaAcaraPdf();
              }}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60 sm:flex-none"
            >
              <FileText className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
              <span>
                {sedangCetakPdf ? 'Menyiapkan PDF...' : 'Cetak Berita Acara PDF'}
              </span>
            </button>
          </div>
        </div>

        {/* Empat Pilihan Parameter */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="rekap-pilih-tahun"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Tahun Anggaran
            </label>
            <select
              id="rekap-pilih-tahun"
              value={draf.tahun}
              onChange={(e) =>
                setDraf((s) => ({ ...s, tahun: Number.parseInt(e.target.value, 10) }))
              }
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold tabular-nums text-ink-900 focus:border-brand-700"
            >
              <option value={periodeSistem.tahun}>
                {periodeSistem.tahun} (Tahun Sistem WITA)
              </option>
              <option value={periodeSistem.tahun - 1}>{periodeSistem.tahun - 1}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rekap-pilih-subperiode"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              {draf.modePeriode === 'semester'
                ? 'Pilihan Semester'
                : draf.modePeriode === 'tahunan'
                  ? 'Cakupan Periode'
                  : 'Pilihan Triwulan'}
            </label>
            {draf.modePeriode === 'triwulan' && (
              <select
                id="rekap-pilih-subperiode"
                value={draf.triwulan}
                onChange={(e) =>
                  setDraf((s) => ({
                    ...s,
                    triwulan: Number.parseInt(e.target.value, 10) as 1 | 2 | 3 | 4,
                  }))
                }
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900 focus:border-brand-700"
              >
                <option value={1}>Triwulan I (Jan–Mar)</option>
                <option value={2}>Triwulan II (Apr–Jun)</option>
                <option value={3}>Triwulan III (Jul–Sep)</option>
                <option value={4}>Triwulan IV (Okt–Des)</option>
              </select>
            )}

            {draf.modePeriode === 'semester' && (
              <select
                id="rekap-pilih-subperiode"
                value={draf.semester}
                onChange={(e) =>
                  setDraf((s) => ({
                    ...s,
                    semester: Number.parseInt(e.target.value, 10) as 1 | 2,
                  }))
                }
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900 focus:border-brand-700"
              >
                <option value={1}>Semester I (TW I – TW II)</option>
                <option value={2}>Semester II (TW III – TW IV)</option>
              </select>
            )}

            {draf.modePeriode === 'tahunan' && (
              <input
                id="rekap-pilih-subperiode"
                type="text"
                readOnly
                value="Konsolidasi Penuh Januari – Desember"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-600"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="rekap-pilih-komoditas"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Komoditas Perkebunan
            </label>
            <select
              id="rekap-pilih-komoditas"
              value={draf.komoditasId}
              onChange={(e) => setDraf((s) => ({ ...s, komoditasId: e.target.value }))}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900 focus:border-brand-700"
            >
              <option value="">Semua 7 Komoditas Baku</option>
              {daftarKomoditas.map((kom) => (
                <option key={kom.id} value={kom.id}>
                  {kom.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rekap-pilih-uptd"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              Wilayah Kerja / UPTD
            </label>
            <select
              id="rekap-pilih-uptd"
              value={draf.uptdId}
              onChange={(e) => setDraf((s) => ({ ...s, uptdId: e.target.value }))}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900 focus:border-brand-700"
            >
              <option value="">Seluruh Wilayah / UPTD Kaltim</option>
              {daftarUptd.map((uptd) => (
                <option key={uptd.id} value={uptd.id}>
                  {uptd.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris Keterangan Filter Aktif + Tombol Reset & Terapkan */}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-canvas/70 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-600">
            Filter Aktif:{' '}
            <strong className="font-bold text-brand-900">{keteranganFilterAktif}</strong>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={tanganiResetFilter}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-bold text-ink-900 hover:bg-canvas"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Reset Filter</span>
            </button>
            <button
              type="button"
              onClick={tanganiTerapkanFilter}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-surface hover:bg-brand-700"
            >
              <Filter className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Terapkan Filter</span>
            </button>
          </div>
        </div>
      </section>

      {galat && (
        <KotakGalatData
          pesan={galat}
          onCobaLagi={() => {
            void muatDataRekap();
          }}
        />
      )}

      {memuat && !ringkasan ? (
        <KerangkaMuat
          pesan="Menyusun matriks rekapitulasi kabupaten/kota dan grafik fluktuasi..."
          jumlahBaris={5}
        />
      ) : (
        <>
          {/* 3. EMPAT KARTU RINGKASAN KPI DENGAN PERSEN PERUBAHAN (DESIGN.md §4.4) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Kartu 1: Total Luas Amatan */}
            <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  Total Luas Amatan
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-900">
                  <Layers className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink-900">
                {formatLuas(ringkasan?.totalLuasAmatan ?? 0)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                <LencanaPerubahan
                  persen={deltaAmatan.persen}
                  arah={deltaAmatan.arah}
                  naikBerartiPositif
                />
                <span className="text-[11px] text-ink-600">
                  {formatAngka(ringkasan?.totalLaporan ?? 0)} laporan
                </span>
              </div>
            </article>

            {/* Kartu 2: Total Serangan OPT */}
            <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  Total Serangan OPT
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-ink-900">
                  <CheckCircle2 className="h-4 w-4 text-brand-900" aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink-900">
                {formatLuas(ringkasan?.totalLuasTerdampak ?? 0)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                <LencanaPerubahan
                  persen={deltaSerangan.persen}
                  arah={deltaSerangan.arah}
                  naikBerartiPositif={false}
                />
                <span className="text-[11px] text-ink-600">
                  {ringkasan?.jumlahKabupatenTerdampak ?? 0} Kab/Kota
                </span>
              </div>
            </article>

            {/* Kartu 3: Serangan Berat / Kritis */}
            <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  Serangan Berat / Kritis
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
                  <AlertOctagon className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-danger-600">
                {formatLuas(ringkasan?.totalLuasBerat ?? 0)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                <LencanaPerubahan
                  persen={deltaBerat.persen}
                  arah={deltaBerat.arah}
                  naikBerartiPositif={false}
                />
                <span className="text-[11px] font-semibold text-danger-600">
                  {ringkasan?.jumlahTitikKritis ?? 0} titik kritis
                </span>
              </div>
            </article>

            {/* Kartu 4: Pengendalian & Eradikasi */}
            <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  Pengendalian & Eradikasi
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ok-100 text-ok-500">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-brand-900">
                {formatLuas(ringkasan?.totalLuasTerkendali ?? 0)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                <LencanaPerubahan
                  persen={deltaPengendalian.persen}
                  arah={deltaPengendalian.arah}
                  naikBerartiPositif
                />
                <span className="text-[11px] text-ink-600">Realisasi PHT</span>
              </div>
            </article>
          </div>

          {/* 4. MATRIKS KABUPATEN / KOTA (DESIGN.md §4.4) */}
          <TabelMatriksKabupaten matriks={matriks} />

          {/* 5. DUA GRAFIK REKAPITULASI (DESIGN.md §4.4) */}
          <GrafikRekapitulasi
            tahun={filterAktif.tahun ?? periodeSistem.tahun}
            trenTriwulan={trenTriwulan}
            intensitasKomoditas={intensitasKomoditas}
          />

          {/* 6. STANDAR BERITA ACARA (SIMULASI) & LOG EKSPOR (DESIGN.md §4.4) */}
          <PanelBeritaAcaraDanLog
            ringkasan={ringkasan}
            filterRingkas={keteranganFilterAktif}
            namaPenandatanganSimulasi={`${profilAktif.nama} (${profilAktif.jabatan})`}
            daftarLog={daftarLog}
            sedangCetakBeritaAcara={sedangCetakPdf}
            idLogSedangDiunduhUlang={idLogUnduhUlang}
            onCetakBeritaAcaraPdf={() => {
              void tanganiCetakBeritaAcaraPdf();
            }}
            onUnduhUlangLog={(entri) => {
              void tanganiUnduhUlangDariLog(entri);
            }}
          />
        </>
      )}
    </div>
  );
}
