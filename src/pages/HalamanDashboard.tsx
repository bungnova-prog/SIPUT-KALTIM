import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Layers,
  Sprout,
} from 'lucide-react';
import {
  eksporService,
  laporanRepository,
  rekapRepository,
  wilayahRepository,
} from '../services';
import { useAppStore } from '../lib/storeAplikasi';
import {
  formatAngka,
  formatLuas,
  formatTanggalPanjang,
  formatWaktuWita,
} from '../lib/format';
import { KerangkaMuat, KotakGalatData } from '../components/StatusMuatData';
import GrafikDashboard from '../components/dashboard/GrafikDashboard';
import PetaMiniDanPeringatan from '../components/dashboard/PetaMiniDanPeringatan';
import TabelObservasiRealtime, {
  type PilihanStatusTabel,
} from '../components/dashboard/TabelObservasiRealtime';
import type {
  BarisIntensitasKomoditas,
  BarisKerentananWilayah,
  BarisTrenBulanan,
  FilterLaporan,
  Laporan,
  RingkasanRekap,
  StatusLaporan,
  Wilayah,
} from '../types/domain';

const UKURAN_HALAMAN_OBSERVASI = 6;

const LABEL_TRIWULAN: Array<{ nilai: 1 | 2 | 3 | 4; label: string }> = [
  { nilai: 1, label: 'TW I' },
  { nilai: 2, label: 'TW II' },
  { nilai: 3, label: 'TW III' },
  { nilai: 4, label: 'TW IV' },
];

export default function HalamanDashboard() {
  const {
    tahunDefault,
    triwulanDefault,
    semesterDefault,
    profilAktif,
    tambahToast,
  } = useAppStore();

  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [modePeriode, setModePeriode] = useState<'triwulan' | 'semester'>(
    'triwulan'
  );
  const [triwulan, setTriwulan] = useState<1 | 2 | 3 | 4>(triwulanDefault);
  const [semester, setSemester] = useState<1 | 2>(semesterDefault);
  const [kabupatenId, setKabupatenId] = useState<string>('');
  const [kabupatenList, setKabupatenList] = useState<Wilayah[]>([]);

  const [kataKunci, setKataKunci] = useState('');
  const [pilihanStatus, setPilihanStatus] =
    useState<PilihanStatusTabel>('terpublikasi');
  const [halamanTabel, setHalamanTabel] = useState(1);

  const [ringkasan, setRingkasan] = useState<RingkasanRekap | null>(null);
  const [trenBulanan, setTrenBulanan] = useState<BarisTrenBulanan[]>([]);
  const [intensitasKomoditas, setIntensitasKomoditas] = useState<
    BarisIntensitasKomoditas[]
  >([]);
  const [kerentananWilayah, setKerentananWilayah] = useState<
    BarisKerentananWilayah[]
  >([]);
  const [laporanPetaMini, setLaporanPetaMini] = useState<Laporan[]>([]);
  const [laporanTabel, setLaporanTabel] = useState<Laporan[]>([]);
  const [totalBarisTabel, setTotalBarisTabel] = useState(0);

  const [memuatUtama, setMemuatUtama] = useState(true);
  const [memuatTabel, setMemuatTabel] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangEkspor, setSedangEkspor] = useState<'xlsx' | 'pdf' | null>(null);
  const [sedangMemprosesId, setSedangMemprosesId] = useState<string | null>(
    null
  );

  // Jam real-time WITA berjalan setiap detik (AGENTS.md §8 & DESIGN.md §4.1)
  useEffect(() => {
    const id = window.setInterval(() => setWaktuSekarang(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    wilayahRepository.daftarKabupaten().then((hasil) => {
      if (hasil.ok) setKabupatenList(hasil.data);
    });
  }, []);

  const filterDasar: FilterLaporan = useMemo(
    () => ({
      modePeriode,
      tahun: tahunDefault,
      triwulan: modePeriode === 'triwulan' ? triwulan : undefined,
      semester: modePeriode === 'semester' ? semester : undefined,
      kabupatenId: kabupatenId || undefined,
    }),
    [kabupatenId, modePeriode, semester, tahunDefault, triwulan]
  );

  const filterTabel: FilterLaporan = useMemo(() => {
    const statusList: StatusLaporan[] | undefined =
      pilihanStatus === 'terpublikasi' ? undefined : [pilihanStatus];
    return {
      ...filterDasar,
      kataKunci: kataKunci.trim() || undefined,
      statusList,
    };
  }, [filterDasar, kataKunci, pilihanStatus]);

  const keteranganFilterRingkas = useMemo(() => {
    const labelPeriode =
      modePeriode === 'triwulan'
        ? `TW ${triwulan} ${tahunDefault}`
        : `Semester ${semester} ${tahunDefault}`;
    const namaWil = kabupatenId
      ? kabupatenList.find((k) => k.id === kabupatenId)?.nama ?? 'Wilayah Terpilih'
      : 'Semua Wilayah (10 Kab/Kota)';
    return `${labelPeriode} · ${namaWil}`;
  }, [kabupatenId, kabupatenList, modePeriode, semester, tahunDefault, triwulan]);

  const muatAnalitikUtama = useCallback(() => {
    setMemuatUtama(true);
    setGalat(null);

    Promise.all([
      rekapRepository.ringkasan(filterDasar),
      rekapRepository.trenBulanan(tahunDefault, {
        kabupatenId: kabupatenId || undefined,
      }),
      rekapRepository.intensitasPerKomoditas(filterDasar),
      rekapRepository.kerentananWilayah(filterDasar),
      laporanRepository.daftar(filterDasar, undefined, profilAktif),
    ]).then(([hRingkas, hTren, hKom, hRentan, hLaporan]) => {
      if (!hRingkas.ok) setGalat(hRingkas.pesan);
      else if (!hTren.ok) setGalat(hTren.pesan);
      else if (!hKom.ok) setGalat(hKom.pesan);
      else if (!hRentan.ok) setGalat(hRentan.pesan);
      else if (!hLaporan.ok) setGalat(hLaporan.pesan);
      else {
        setRingkasan(hRingkas.data);
        setTrenBulanan(hTren.data);
        setIntensitasKomoditas(hKom.data);
        setKerentananWilayah(hRentan.data);
        setLaporanPetaMini(hLaporan.data);
      }
      setMemuatUtama(false);
    });
  }, [filterDasar, kabupatenId, profilAktif, tahunDefault]);

  const muatDaftarTabel = useCallback(() => {
    setMemuatTabel(true);
    laporanRepository
      .daftar(
        filterTabel,
        { nomor: halamanTabel, ukuran: UKURAN_HALAMAN_OBSERVASI },
        profilAktif
      )
      .then((hasil) => {
        if (hasil.ok) {
          setLaporanTabel(hasil.data);
          setTotalBarisTabel(hasil.total ?? hasil.data.length);
        } else {
          setGalat(hasil.pesan);
        }
        setMemuatTabel(false);
      });
  }, [filterTabel, halamanTabel, profilAktif]);

  useEffect(() => {
    muatAnalitikUtama();
  }, [muatAnalitikUtama]);

  useEffect(() => {
    muatDaftarTabel();
  }, [muatDaftarTabel]);

  useEffect(() => {
    // Langganan tanpa filter sempit agar perubahan di tahun berjalan juga memperbarui grafik tren bulanan
    const berhenti = laporanRepository.langganan({ tahun: tahunDefault }, () => {
      muatAnalitikUtama();
      muatDaftarTabel();
    });
    return berhenti;
  }, [muatAnalitikUtama, muatDaftarTabel, tahunDefault]);

  const pilihSemester = (nilai: 1 | 2) => {
    setModePeriode('semester');
    setSemester(nilai);
    setHalamanTabel(1);
  };

  const pilihTriwulan = (nilai: 1 | 2 | 3 | 4) => {
    setModePeriode('triwulan');
    setTriwulan(nilai);
    setSemester(nilai <= 2 ? 1 : 2);
    setHalamanTabel(1);
  };

  const jalankanEksporExcel = async () => {
    setSedangEkspor('xlsx');
    const hasil = await eksporService.eksporObservasiExcel(
      filterDasar,
      profilAktif,
      keteranganFilterRingkas,
      'observasi'
    );
    setSedangEkspor(null);
    if (hasil.ok) {
      tambahToast({
        jenis: 'sukses',
        judul: 'Ekspor Excel Simulasi Berhasil',
        pesan: `Berkas ${hasil.data.namaBerkas} diunduh dan dicatat ke log ekspor.`,
      });
    } else {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mengekspor Excel',
        pesan: hasil.pesan,
        onCobaLagi: jalankanEksporExcel,
      });
    }
  };

  const jalankanCetakPdf = async () => {
    setSedangEkspor('pdf');
    const hasil = await eksporService.eksporBeritaAcaraPdf(
      filterDasar,
      profilAktif,
      keteranganFilterRingkas,
      'RINGKASAN EKSEKUTIF SERANGAN OPT (SIMULASI FASE 1)'
    );
    setSedangEkspor(null);
    if (hasil.ok) {
      tambahToast({
        jenis: 'sukses',
        judul: 'Cetak PDF Simulasi Berhasil',
        pesan: `Berkas ${hasil.data.namaBerkas} berlabel simulasi berhasil diunduh.`,
      });
    } else {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mencetak PDF',
        pesan: hasil.pesan,
        onCobaLagi: jalankanCetakPdf,
      });
    }
  };

  const tanganiVerifikasiCepat = async (
    id: string,
    keputusan: 'terverifikasi' | 'ditolak',
    catatan?: string
  ) => {
    setSedangMemprosesId(id);
    const hasil = await laporanRepository.verifikasi(
      id,
      keputusan,
      profilAktif,
      catatan
    );
    setSedangMemprosesId(null);

    if (hasil.ok) {
      tambahToast({
        jenis: keputusan === 'terverifikasi' ? 'sukses' : 'peringatan',
        judul:
          keputusan === 'terverifikasi'
            ? 'Laporan Terverifikasi'
            : 'Laporan Ditolak',
        pesan: `Status laporan ${hasil.data.kode} diperbarui menjadi ${keputusan.toUpperCase()}.`,
      });
    } else {
      tambahToast({
        jenis: 'gagal',
        judul: 'Verifikasi Tidak Diizinkan',
        pesan: hasil.pesan,
      });
    }
  };

  const tanganiDisposisi = (wilayahPrioritas: string, rekomendasi: string) => {
    tambahToast({
      jenis: 'info',
      judul: 'Disposisi Tindak Lanjut (Simulasi)',
      pesan: `Arahan ke UPTD terkait untuk ${wilayahPrioritas}: ${rekomendasi}`,
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Kepala Halaman: Judul, Jam Real-Time WITA Bertitik Merah, Filter Periode/Wilayah, & Ekspor */}
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Dinas Perkebunan Provinsi Kalimantan Timur
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-brand-900 sm:text-[28px]">
            Ringkasan Eksekutif Serangan OPT
          </h1>
          <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-xs font-medium text-ink-600 tabular-nums">
            <span
              className="h-2.5 w-2.5 rounded-full bg-danger-600"
              aria-hidden="true"
            />
            <span>
              {formatTanggalPanjang(waktuSekarang)} |{' '}
              {formatWaktuWita(waktuSekarang)}
            </span>
            <span className="rounded bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-900">
              {keteranganFilterRingkas}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Tab Semester I / II */}
          <div
            role="group"
            aria-label="Filter semester"
            className="inline-flex rounded-lg border border-line bg-canvas p-1"
          >
            {([1, 2] as const).map((sem) => {
              const aktif = modePeriode === 'semester' && semester === sem;
              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => pilihSemester(sem)}
                  className={`min-h-[44px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    aktif
                      ? 'bg-brand-900 text-surface'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  Sem {sem === 1 ? 'I' : 'II'}
                </button>
              );
            })}
          </div>

          {/* Tab TW I – IV */}
          <div
            role="group"
            aria-label="Filter triwulan"
            className="inline-flex rounded-lg border border-line bg-canvas p-1"
          >
            {LABEL_TRIWULAN.map((tw) => {
              const aktif = modePeriode === 'triwulan' && triwulan === tw.nilai;
              return (
                <button
                  key={tw.nilai}
                  type="button"
                  onClick={() => pilihTriwulan(tw.nilai)}
                  className={`min-h-[44px] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    aktif
                      ? 'bg-brand-900 text-surface'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {tw.label}
                </button>
              );
            })}
          </div>

          {/* Pilihan Wilayah Kabupaten/Kota */}
          <div>
            <label htmlFor="pilih-wilayah-dashboard" className="sr-only">
              Pilih kabupaten atau kota
            </label>
            <select
              id="pilih-wilayah-dashboard"
              value={kabupatenId}
              onChange={(e) => {
                setKabupatenId(e.target.value);
                setHalamanTabel(1);
              }}
              className="min-h-[44px] w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-900 sm:w-auto"
            >
              <option value="">Semua Wilayah (10 Kab/Kota)</option>
              {kabupatenList.map((kab) => (
                <option key={kab.id} value={kab.id}>
                  {kab.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Ekspor Cepat Excel & Cetak PDF */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={sedangEkspor !== null}
              onClick={jalankanEksporExcel}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-100 px-3.5 py-2 text-xs font-bold text-brand-900 hover:bg-brand-900 hover:text-surface disabled:opacity-50 sm:flex-none"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              <span>
                {sedangEkspor === 'xlsx' ? 'Mengunduh...' : 'Excel (.xlsx)'}
              </span>
            </button>
            <button
              type="button"
              disabled={sedangEkspor !== null}
              onClick={jalankanCetakPdf}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-danger-600 px-3.5 py-2 text-xs font-bold text-surface hover:opacity-95 disabled:opacity-50 sm:flex-none"
            >
              <FileText className="h-4 w-4" aria-hidden />
              <span>{sedangEkspor === 'pdf' ? 'Mencetak...' : 'Cetak PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {galat && (
        <KotakGalatData
          pesan={galat}
          onCobaLagi={() => {
            muatAnalitikUtama();
            muatDaftarTabel();
          }}
        />
      )}

      {/* 2. Lima Kartu KPI Sebaris */}
      {memuatUtama && !ringkasan ? (
        <KerangkaMuat
          pesan="Memuat 5 indikator kinerja utama..."
          jumlahBaris={2}
        />
      ) : (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
          aria-label="Lima kartu ringkasan KPI"
        >
          <KartuKpi
            label="Total Laporan Lapangan"
            nilai={ringkasan ? formatAngka(ringkasan.totalLaporan) : '0'}
            satuan="Laporan"
            lencanaPositif={
              ringkasan
                ? `${formatAngka(ringkasan.laporanTerverifikasi)} Terverifikasi`
                : undefined
            }
            keterangan={
              ringkasan
                ? `${formatAngka(ringkasan.laporanMenunggu)} menunggu validasi · ${formatAngka(ringkasan.jumlahKabupatenTerdampak)} kab/kota`
                : undefined
            }
            Ikon={ClipboardList}
            kotakIkon="bg-brand-100 text-brand-900"
          />

          <KartuKpi
            label="Total Luas Serangan OPT"
            nilai={
              ringkasan
                ? formatAngka(ringkasan.totalLuasTerdampak, 2, 2)
                : '0,00'
            }
            satuan="Ha"
            keterangan={
              ringkasan
                ? `Dari ${formatLuas(ringkasan.totalLuasAmatan)} luas amatan`
                : undefined
            }
            Ikon={Layers}
            kotakIkon="bg-info-100 text-brand-900"
          />

          <KartuKpi
            label="Serangan Berat/Eksplosif"
            nilai={
              ringkasan ? formatAngka(ringkasan.totalLuasBerat, 2, 2) : '0,00'
            }
            satuan="Ha"
            bahaya
            lencanaDarurat="Ambang Darurat Tinggi"
            keterangan={
              ringkasan
                ? `${formatAngka(ringkasan.jumlahTitikKritis)} titik berstatus kritis (> 50%)`
                : undefined
            }
            Ikon={AlertTriangle}
            kotakIkon="bg-danger-100 text-danger-600"
          />

          <KartuKpi
            label="Serangan Ringan & Sedang"
            nilai={
              ringkasan
                ? formatAngka(ringkasan.totalLuasRinganSedang, 2, 2)
                : '0,00'
            }
            satuan="Ha"
            keterangan={
              ringkasan
                ? `${formatAngka(ringkasan.jumlahTitikRingan + ringkasan.jumlahTitikWaspada)} titik · Terkendali ${formatLuas(ringkasan.totalLuasTerkendali)}`
                : undefined
            }
            Ikon={CheckCircle2}
            kotakIkon="bg-ok-100 text-ok-500"
          />

          <KartuKpi
            label="Komoditas Pantauan Utama"
            nilai={ringkasan?.komoditasUtama ?? '-'}
            keterangan={
              ringkasan && ringkasan.optDominan !== '-'
                ? `OPT dominan: ${ringkasan.optDominan}`
                : 'Belum ada serangan pada filter aktif'
            }
            Ikon={Sprout}
            kotakIkon="bg-gold-100 text-ink-900"
          />
        </section>
      )}

      {/* 3. Dua Grafik Berdampingan */}
      <GrafikDashboard
        tahun={tahunDefault}
        trenBulanan={trenBulanan}
        intensitasKomoditas={intensitasKomoditas}
        memuat={memuatUtama}
      />

      {/* 4. Baris Peta Mini & Tumpukan Kartu Peringatan / Rekomendasi */}
      <PetaMiniDanPeringatan
        daftarLaporan={laporanPetaMini}
        kerentananWilayah={kerentananWilayah}
        onDisposisi={tanganiDisposisi}
      />

      {/* 5. Tabel Laporan Observasi Lapangan Real-Time */}
      <TabelObservasiRealtime
        daftarHalaman={laporanTabel}
        totalBaris={totalBarisTabel}
        halamanAktif={halamanTabel}
        ukuranHalaman={UKURAN_HALAMAN_OBSERVASI}
        kataKunci={kataKunci}
        pilihanStatus={pilihanStatus}
        memuat={memuatTabel}
        profilAktif={profilAktif}
        sedangMemprosesId={sedangMemprosesId}
        onUbahKataKunci={(v) => {
          setKataKunci(v);
          setHalamanTabel(1);
        }}
        onUbahPilihanStatus={(st) => {
          setPilihanStatus(st);
          setHalamanTabel(1);
        }}
        onPilihHalaman={setHalamanTabel}
        onVerifikasi={tanganiVerifikasiCepat}
      />
    </div>
  );
}

function KartuKpi({
  label,
  nilai,
  satuan,
  keterangan,
  bahaya,
  lencanaPositif,
  lencanaDarurat,
  Ikon,
  kotakIkon,
}: {
  label: string;
  nilai: string;
  satuan?: string;
  keterangan?: string;
  bahaya?: boolean;
  lencanaPositif?: string;
  lencanaDarurat?: string;
  Ikon: typeof ClipboardList;
  kotakIkon: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${kotakIkon}`}
          aria-hidden="true"
        >
          <Ikon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2">
        <p
          className={`text-2xl font-bold tabular-nums ${
            bahaya ? 'text-danger-600' : 'text-ink-900'
          }`}
        >
          {nilai}
          {satuan && (
            <span className="ml-1 text-xs font-semibold text-ink-600">
              {satuan}
            </span>
          )}
        </p>

        {lencanaPositif && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-ok-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-900">
            <CheckCircle2 className="h-3 w-3 text-ok-500" aria-hidden />
            <span>{lencanaPositif}</span>
          </span>
        )}

        {lencanaDarurat && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-0.5 text-[11px] font-semibold text-danger-600">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            <span>{lencanaDarurat}</span>
          </span>
        )}

        {keterangan && (
          <p className="mt-1.5 text-xs text-ink-600">{keterangan}</p>
        )}
      </div>
    </div>
  );
}
