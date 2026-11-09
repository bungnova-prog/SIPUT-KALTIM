import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Coffee,
  Droplets,
  Flower2,
  Leaf,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  TreePalm,
  Trees,
  type LucideIcon,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { susunNomorHalaman } from '../lib/analitikDashboard';
import { formatLuas } from '../lib/format';
import { useAppStore } from '../lib/storeAplikasi';
import {
  komoditasOptRepository,
  laporanRepository,
  rekapRepository,
} from '../services';
import {
  KerangkaMuat,
  KotakDataKosong,
  KotakGalatData,
} from '../components/StatusMuatData';
import type {
  BarisIntensitasKomoditas,
  JenisOpt,
  Komoditas,
  Opt,
} from '../types/domain';

const IKON_KOMODITAS: Record<Komoditas['kodeIkon'], LucideIcon> = {
  lada: Sprout,
  sawit: Trees,
  kakao: Flower2,
  karet: Droplets,
  aren: TreePalm,
  kelapa_dalam: Leaf,
  kopi: Coffee,
  pala: Sparkles,
};

const UKURAN_HALAMAN_OPT = 6;

export default function HalamanKomoditasOpt() {
  const profilAktif = useAppStore((s) => s.profilAktif);
  const tambahToast = useAppStore((s) => s.tambahToast);

  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [daftarOpt, setDaftarOpt] = useState<Opt[]>([]);
  const [ringkasanKomoditas, setRingkasanKomoditas] = useState<
    BarisIntensitasKomoditas[]
  >([]);

  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  // Filter & Paginasi Katalog OPT
  const [filterKomoditasId, setFilterKomoditasId] = useState<string>('');
  const [filterJenis, setFilterJenis] = useState<'semua' | JenisOpt>('semua');
  const [kataKunci, setKataKunci] = useState('');
  const [halaman, setHalaman] = useState(1);

  // Form Tambah OPT Simulasi (Khusus Admin)
  const [bukaFormTambah, setBukaFormTambah] = useState(false);
  const [komoditasBaruId, setKomoditasBaruId] = useState('kom-lada');
  const [namaLokalBaru, setNamaLokalBaru] = useState('');
  const [namaIlmiahBaru, setNamaIlmiahBaru] = useState('');
  const [jenisBaru, setJenisBaru] = useState<JenisOpt>('penyakit');
  const [gejalaBaru, setGejalaBaru] = useState('');
  const [rekomendasiBaru, setRekomendasiBaru] = useState('');
  const [sedangMenambah, setSedangMenambah] = useState(false);

  const muatKatalog = useCallback(() => {
    setMemuat(true);
    setGalat(null);
    Promise.all([
      komoditasOptRepository.daftarKomoditas(),
      komoditasOptRepository.daftarOpt(),
      rekapRepository.intensitasPerKomoditas({ modePeriode: 'realtime' }),
    ]).then(([hasilKom, hasilOpt, hasilIntensitas]) => {
      if (!hasilKom.ok) {
        setGalat(hasilKom.pesan);
      } else if (!hasilOpt.ok) {
        setGalat(hasilOpt.pesan);
      } else {
        setKomoditas(hasilKom.data);
        setDaftarOpt(hasilOpt.data);
        if (hasilIntensitas.ok) {
          setRingkasanKomoditas(hasilIntensitas.data);
        }
      }
      setMemuat(false);
    });
  }, []);

  useEffect(() => {
    muatKatalog();
    const berhentiKatalog = komoditasOptRepository.langganan(muatKatalog);
    const berhentiLaporan = laporanRepository.langganan({}, muatKatalog);
    return () => {
      berhentiKatalog();
      berhentiLaporan();
    };
  }, [muatKatalog]);

  const petaStatistikKomoditas = useMemo(() => {
    const peta = new Map<string, { jumlahOpt: number; luasTotal: number }>();
    for (const k of komoditas) {
      const jumlahOpt = daftarOpt.filter(
        (o) =>
          o.komoditasId === k.id ||
          o.komoditasId === k.kodeIkon ||
          o.komoditasId === `kom-${k.kodeIkon}` ||
          o.namaKomoditas.toLowerCase() === k.nama.toLowerCase()
      ).length;
      const barisRekap = ringkasanKomoditas.find((r) => r.komoditasId === k.id);
      peta.set(k.id, {
        jumlahOpt,
        luasTotal: barisRekap?.luasTotal ?? 0,
      });
    }
    return peta;
  }, [daftarOpt, komoditas, ringkasanKomoditas]);

  const optTersaring = useMemo(() => {
    const q = kataKunci.trim().toLowerCase();
    return daftarOpt.filter((item) => {
      if (filterKomoditasId) {
        const kom = komoditas.find((k) => k.id === filterKomoditasId);
        const cocok =
          item.komoditasId === filterKomoditasId ||
          (kom &&
            (item.komoditasId === kom.id ||
              item.komoditasId === kom.kodeIkon ||
              item.komoditasId === `kom-${kom.kodeIkon}` ||
              item.namaKomoditas.toLowerCase() === kom.nama.toLowerCase()));
        if (!cocok) return false;
      }
      if (filterJenis !== 'semua' && item.jenis !== filterJenis) return false;
      if (q) {
        const gabungan = [
          item.namaLokal,
          item.namaIlmiah,
          item.namaKomoditas,
          item.gejala,
          item.rekomendasi,
        ]
          .join(' ')
          .toLowerCase();
        if (!gabungan.includes(q)) return false;
      }
      return true;
    });
  }, [daftarOpt, filterJenis, filterKomoditasId, kataKunci, komoditas]);

  const totalHalaman = Math.max(1, Math.ceil(optTersaring.length / UKURAN_HALAMAN_OPT));
  const halamanAman = Math.min(halaman, totalHalaman);
  const indeksAwal = (halamanAman - 1) * UKURAN_HALAMAN_OPT;
  const optHalaman = optTersaring.slice(indeksAwal, indeksAwal + UKURAN_HALAMAN_OPT);
  const deretHalaman = susunNomorHalaman(halamanAman, totalHalaman);

  const kirimTambahOpt = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSedangMenambah(true);
    const hasil = await komoditasOptRepository.tambahOptSimulasi(
      {
        komoditasId: komoditasBaruId,
        namaLokal: namaLokalBaru,
        namaIlmiah: namaIlmiahBaru,
        jenis: jenisBaru,
        gejala: gejalaBaru,
        rekomendasi: rekomendasiBaru,
      },
      profilAktif
    );
    setSedangMenambah(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Menambah Katalog OPT',
        pesan: hasil.pesan,
      });
      return;
    }

    setNamaLokalBaru('');
    setNamaIlmiahBaru('');
    setGejalaBaru('');
    setRekomendasiBaru('');
    setBukaFormTambah(false);
    tambahToast({
      jenis: 'sukses',
      judul: 'OPT Simulasi Ditambahkan',
      pesan: `${hasil.data.namaLokal} (${hasil.data.namaIlmiah}) kini tersedia di katalog & formulir input.`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Kepala Halaman */}
      <header className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-900">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-900" aria-hidden />
                <span>Katalog Khusus Kaltim · Data Simulasi</span>
              </span>
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold text-brand-900 sm:text-2xl">
              Data Komoditas & Katalog Organisme Pengganggu Tumbuhan (OPT)
            </h1>
            <p className="mt-0.5 text-xs text-ink-600 sm:text-sm">
              Komoditas perkebunan unggulan Kalimantan Timur dicatat secara terpisah beserta
              identifikasi gejala dan rekomendasi pengendalian terpadu.
            </p>
          </div>

          {profilAktif.peran === 'admin' && (
            <button
              type="button"
              onClick={() => setBukaFormTambah((v) => !v)}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-surface hover:bg-brand-700"
            >
              <PlusCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>{bukaFormTambah ? 'Tutup Form OPT' : 'Tambah OPT Simulasi'}</span>
            </button>
          )}
        </div>

        {/* Form Tambah OPT Simulasi (Admin Provinsi) */}
        {bukaFormTambah && profilAktif.peran === 'admin' && (
          <form
            onSubmit={(e) => {
              void kirimTambahOpt(e);
            }}
            className="mt-5 space-y-4 rounded-xl border border-brand-700/25 bg-brand-100/35 p-4"
          >
            <h2 className="text-sm font-bold text-brand-900">
              Tambah Entri Katalog OPT Baru (Simulasi Admin Provinsi)
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="tambah-opt-komoditas"
                  className="block text-xs font-bold text-ink-900"
                >
                  Komoditas Baku <span className="text-danger-600">*</span>
                </label>
                <select
                  id="tambah-opt-komoditas"
                  value={komoditasBaruId}
                  onChange={(e) => setKomoditasBaruId(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900"
                >
                  {komoditas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tambah-opt-jenis"
                  className="block text-xs font-bold text-ink-900"
                >
                  Kategori OPT <span className="text-danger-600">*</span>
                </label>
                <select
                  id="tambah-opt-jenis"
                  value={jenisBaru}
                  onChange={(e) => setJenisBaru(e.target.value as JenisOpt)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900"
                >
                  <option value="penyakit">Penyakit Tumbuhan</option>
                  <option value="hama">Hama Perkebunan</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tambah-opt-lokal"
                  className="block text-xs font-bold text-ink-900"
                >
                  Nama Lokal OPT <span className="text-danger-600">*</span>
                </label>
                <input
                  id="tambah-opt-lokal"
                  type="text"
                  required
                  value={namaLokalBaru}
                  onChange={(e) => setNamaLokalBaru(e.target.value)}
                  placeholder="Contoh: Karat Daun Kopi"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label
                  htmlFor="tambah-opt-ilmiah"
                  className="block text-xs font-bold text-ink-900"
                >
                  Nama Ilmiah <span className="text-danger-600">*</span>
                </label>
                <input
                  id="tambah-opt-ilmiah"
                  type="text"
                  required
                  value={namaIlmiahBaru}
                  onChange={(e) => setNamaIlmiahBaru(e.target.value)}
                  placeholder="Contoh: Hemileia vastatrix"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs italic text-ink-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tambah-opt-gejala"
                  className="block text-xs font-bold text-ink-900"
                >
                  Ciri Gejala Serangan di Lapangan
                </label>
                <input
                  id="tambah-opt-gejala"
                  type="text"
                  value={gejalaBaru}
                  onChange={(e) => setGejalaBaru(e.target.value)}
                  placeholder="Bercak kuning jingga pada permukaan bawah daun..."
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>
              <div>
                <label
                  htmlFor="tambah-opt-rekomendasi"
                  className="block text-xs font-bold text-ink-900"
                >
                  Standar Rekomendasi Pengendalian
                </label>
                <input
                  id="tambah-opt-rekomendasi"
                  type="text"
                  value={rekomendasiBaru}
                  onChange={(e) => setRekomendasiBaru(e.target.value)}
                  placeholder="Pemangkasan naungan dan aplikasi agens hayati..."
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBukaFormTambah(false)}
                className="min-h-[44px] rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-900 hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={sedangMenambah}
                className="min-h-[44px] rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
              >
                {sedangMenambah ? 'Menyimpan...' : 'Simpan ke Katalog Simulasi'}
              </button>
            </div>
          </form>
        )}
      </header>

      {galat && <KotakGalatData pesan={galat} onCobaLagi={muatKatalog} />}

      {memuat && komoditas.length === 0 ? (
        <KerangkaMuat pesan="Memuat katalog komoditas baku dan OPT Kaltim..." jumlahBaris={5} />
      ) : (
        <>
          {/* Kartu Komoditas Baku Terpisah (AGENTS.md §8) */}
          <section aria-labelledby="judul-komoditas" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="judul-komoditas"
                className="text-sm font-bold uppercase tracking-wider text-ink-900"
              >
                Komoditas Perkebunan Baku (Klik untuk Menyaring Katalog OPT)
              </h2>
              {filterKomoditasId && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterKomoditasId('');
                    setHalaman(1);
                  }}
                  className="min-h-[44px] rounded-lg px-3 text-xs font-bold text-brand-700 hover:bg-surface"
                >
                  Tampilkan Semua Komoditas
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
              {komoditas.map((k) => {
                const IkonKom = IKON_KOMODITAS[k.kodeIkon] ?? Leaf;
                const stat = petaStatistikKomoditas.get(k.id);
                const terpilih = filterKomoditasId === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    aria-pressed={terpilih}
                    onClick={() => {
                      setFilterKomoditasId((lama) => (lama === k.id ? '' : k.id));
                      setHalaman(1);
                    }}
                    className={`flex min-h-[44px] flex-col justify-between rounded-2xl border p-3.5 text-left transition-colors ${
                      terpilih
                        ? 'border-brand-900 bg-brand-900 text-surface shadow-sm'
                        : 'border-line bg-surface text-ink-900 hover:bg-brand-100/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          terpilih
                            ? 'bg-brand-700 text-gold-500'
                            : 'bg-brand-100 text-brand-900'
                        }`}
                      >
                        <IkonKom className="h-4 w-4" aria-hidden />
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          terpilih
                            ? 'bg-ok-500 text-surface'
                            : 'bg-ok-100 text-ink-900'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                        <span>Aktif</span>
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-extrabold leading-snug">{k.nama}</p>
                      <p
                        className={`mt-1 text-[11px] tabular-nums ${
                          terpilih ? 'text-brand-100' : 'text-ink-600'
                        }`}
                      >
                        {stat?.jumlahOpt ?? 0} jenis OPT ·{' '}
                        {formatLuas(stat?.luasTotal ?? 0, 1)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Daftar Katalog OPT Lengkap dengan Pencarian & Paginasi */}
          <section
            aria-labelledby="judul-katalog-opt"
            className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
          >
            <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2
                  id="judul-katalog-opt"
                  className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-lg"
                >
                  <Bug className="h-5 w-5 text-brand-900" aria-hidden />
                  <span>Katalog Identifikasi OPT ({optTersaring.length} jenis)</span>
                </h2>
                <p className="mt-0.5 text-xs text-ink-600">
                  Nama ilmiah patogen/hama ditulis miring sesuai kaidah taksonomi proteksi tanaman.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <label htmlFor="cari-katalog-opt" className="sr-only">
                    Cari nama OPT, nama ilmiah, atau gejala
                  </label>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
                    aria-hidden
                  />
                  <input
                    id="cari-katalog-opt"
                    type="search"
                    value={kataKunci}
                    onChange={(e) => {
                      setKataKunci(e.target.value);
                      setHalaman(1);
                    }}
                    placeholder="Cari nama OPT / ilmiah..."
                    className="min-h-[44px] w-full rounded-xl border border-line bg-canvas/60 pl-9 pr-3 py-2 text-xs text-ink-900 focus:bg-surface"
                  />
                </div>

                <div>
                  <label htmlFor="filter-kategori-opt" className="sr-only">
                    Saring kategori OPT
                  </label>
                  <select
                    id="filter-kategori-opt"
                    value={filterJenis}
                    onChange={(e) => {
                      setFilterJenis(e.target.value as 'semua' | JenisOpt);
                      setHalaman(1);
                    }}
                    className="min-h-[44px] w-full rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs font-semibold text-ink-900 sm:w-auto"
                  >
                    <option value="semua">Semua Kategori</option>
                    <option value="hama">Hama</option>
                    <option value="penyakit">Penyakit</option>
                  </select>
                </div>
              </div>
            </div>

            {optTersaring.length === 0 ? (
              <div className="mt-4">
                <KotakDataKosong
                  judul="Tidak Ada OPT yang Cocok"
                  pesan="Ubah pilihan komoditas atau kata kunci pencarian katalog OPT."
                />
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  {optHalaman.map((o) => (
                    <article
                      key={o.id}
                      className="flex flex-col justify-between rounded-xl border border-line bg-canvas/45 p-4 text-xs"
                    >
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-900">
                              {o.namaKomoditas}
                            </span>
                            <h3 className="mt-1.5 text-sm font-bold text-ink-900">
                              {o.namaLokal}{' '}
                              <em className="font-normal text-ink-600">({o.namaIlmiah})</em>
                            </h3>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                              o.jenis === 'penyakit'
                                ? 'bg-gold-100 text-ink-900'
                                : 'bg-info-100 text-ink-900'
                            }`}
                          >
                            {o.jenis === 'penyakit' ? (
                              <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
                            ) : (
                              <Bug className="h-3 w-3 shrink-0" aria-hidden />
                            )}
                            <span>{o.jenis}</span>
                          </span>
                        </div>

                        <p className="mt-2.5 text-ink-600">
                          <strong className="text-ink-900">Gejala:</strong> {o.gejala}
                        </p>
                      </div>

                      <div className="mt-3 rounded-lg border border-line bg-surface p-2.5 text-ink-600">
                        <strong className="text-brand-900">Rekomendasi PHT:</strong>{' '}
                        {o.rekomendasi}
                      </div>
                    </article>
                  ))}
                </div>

                {/* Paginasi */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5 text-xs text-ink-600">
                  <span>
                    Menampilkan <strong className="text-ink-900">{indeksAwal + 1}</strong>–
                    <strong className="text-ink-900">
                      {Math.min(indeksAwal + UKURAN_HALAMAN_OPT, optTersaring.length)}
                    </strong>{' '}
                    dari <strong className="text-ink-900">{optTersaring.length}</strong> jenis OPT
                  </span>

                  {totalHalaman > 1 && (
                    <div className="flex items-center gap-1">
                      {deretHalaman.map((nomor, idx) =>
                        nomor === 'elipsis' ? (
                          <span key={`el-${idx}`} className="px-2 py-1">
                            …
                          </span>
                        ) : (
                          <button
                            key={nomor}
                            type="button"
                            onClick={() => setHalaman(nomor)}
                            aria-current={nomor === halamanAman ? 'page' : undefined}
                            className={`min-h-[44px] min-w-[44px] rounded-lg px-2.5 text-xs font-bold ${
                              nomor === halamanAman
                                ? 'bg-brand-900 text-surface'
                                : 'border border-line bg-surface text-ink-900 hover:bg-canvas'
                            }`}
                          >
                            {nomor}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
