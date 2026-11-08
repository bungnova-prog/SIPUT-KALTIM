import {
  MASTER_KECAMATAN,
  ambilMasterDesaPerKecamatan,
  normalisasiNamaWilayah,
} from '../data/masterWilayahKaltim';
import {
  buatFotoSvgSimulasi,
  MOCK_KOMODITAS,
  MOCK_LAPORAN,
  MOCK_LAPORAN_FOTO,
  MOCK_NOTIFIKASI,
  MOCK_OPT,
  MOCK_PROFILES,
  MOCK_UPTD,
  MOCK_WILAYAH,
  type DbKomoditasRow,
  type DbLaporanFotoRow,
  type DbLaporanRow,
  type DbNotifikasiRow,
  type DbOptRow,
  type DbProfileRow,
  type DbUptdRow,
  type DbWilayahRow,
} from '../mocks/dataSimulasi';
import {
  hitungIntensitas,
  klasifikasiTingkat,
  validasiKoordinatKaltim,
  validasiLuas,
  validasiPeriode,
} from '../lib/klasifikasi';
import {
  KONFIGURASI_KLASIFIKASI_BAWAAN,
  KONFIGURASI_PERINGATAN_FORM_BAWAAN,
} from '../lib/konfigurasi';
import { transisiStatusLaporan } from '../lib/alurLaporan';
import { tampilkanNipSesuaiPeran } from '../lib/format';
import { bulanTahunWita } from '../lib/waktuWita';
import type {
  BarisIntensitasKomoditas,
  BarisKerentananWilayah,
  BarisMatriksKabupaten,
  BarisTrenBulanan,
  BarisTrenTriwulanKomoditas,
  FilterLaporan,
  Halaman,
  Hasil,
  Komoditas,
  KonfigurasiSistem,
  Laporan,
  LaporanFoto,
  LaporanInput,
  LaporanRiwayat,
  LogEkspor,
  NotifikasiItem,
  Opt,
  PerubahanLaporan,
  ProfilPengguna,
  RingkasanRekap,
  StatusLaporan,
  TingkatSerangan,
  Uptd,
  Wilayah,
} from '../types/domain';
import type {
  EksporService,
  KomoditasOptRepository,
  KonfigurasiRepository,
  LaporanRepository,
  LogEksporRepository,
  NotifikasiRepository,
  PenggunaRepository,
  RekapRepository,
  WilayahRepository,
} from './kontrak';

const KUNCI_DRAF_LOKAL = 'siput_kaltim_draf_form_simulasi_v1';
const BATAS_USIA_DRAF_LOKAL_MS = 24 * 60 * 60 * 1000; // 24 jam (SECURITY.md §6 & §9)

const NAMA_BULAN_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const MOCK_LOG_EKSPOR_AWAL: LogEkspor[] = [
  {
    id: 'eks-sim-001',
    userId: 'usr-admin-01',
    namaPengguna: 'Admin Provinsi (Simulasi)',
    peranPengguna: 'admin',
    namaBerkas: 'SIPUT-Rekapitulasi-SIMULASI-20261104-1610.xlsx',
    format: 'xlsx',
    tipeDokumen: 'rekap',
    filterRingkas: 'Tahun 2026 · TW IV · Semua Wilayah',
    filterJson: { modePeriode: 'triwulan', tahun: 2026, triwulan: 4 },
    dibuatPada: '2026-11-04T08:10:00Z',
  },
  {
    id: 'eks-sim-002',
    userId: 'usr-op-kutim',
    namaPengguna: 'Operator UPTD Utara (Simulasi)',
    peranPengguna: 'operator',
    namaBerkas: 'SIPUT-BeritaAcara-SIMULASI-20261103-1025.pdf',
    format: 'pdf',
    tipeDokumen: 'berita_acara',
    filterRingkas: 'Tahun 2026 · Semester 2 · UPTD Utara',
    filterJson: { modePeriode: 'semester', tahun: 2026, semester: 2, uptdId: 'uptd-utara' },
    dibuatPada: '2026-11-03T02:25:00Z',
  },
];

function inisialisasiDbWilayahLengkap(): DbWilayahRow[] {
  const hasil: DbWilayahRow[] = structuredClone(MOCK_WILAYAH);
  const sudahAdaId = new Set(hasil.map((w) => w.id));

  // Lengkapi seluruh 105 kecamatan jika belum ada di mock
  MASTER_KECAMATAN.forEach((mk) => {
    const parentKab = hasil.find(
      (w) =>
        w.tipe === 'kabupaten' &&
        (w.id === mk.parentKode ||
          normalisasiNamaWilayah(w.nama) === normalisasiNamaWilayah(mk.parentKode ?? ''))
    );
    const normKec = normalisasiNamaWilayah(mk.nama);
    const adaKec = hasil.some(
      (w) =>
        w.tipe === 'kecamatan' &&
        (w.id === mk.kode || normalisasiNamaWilayah(w.nama) === normKec)
    );
    if (!adaKec) {
      hasil.push({
        id: mk.kode,
        tipe: 'kecamatan',
        nama: mk.nama,
        parent_id: parentKab?.id ?? mk.parentKode ?? null,
        uptd_id: parentKab?.uptd_id ?? null,
        lat_pusat: mk.latPusat ?? parentKab?.lat_pusat,
        lng_pusat: mk.lngPusat ?? parentKab?.lng_pusat,
      });
      sudahAdaId.add(mk.kode);
    }
  });

  // Lengkapi seluruh 1.012+ desa ke masing-masing kecamatan
  const desaPerKec = new Map<string, Set<string>>();
  hasil
    .filter((w) => w.tipe === 'desa' && w.parent_id)
    .forEach((d) => {
      const pId = d.parent_id!;
      if (!desaPerKec.has(pId)) desaPerKec.set(pId, new Set());
      desaPerKec.get(pId)!.add(normalisasiNamaWilayah(d.nama));
      desaPerKec.get(pId)!.add(d.id);
    });

  MASTER_KECAMATAN.forEach((mk) => {
    const targetKec = hasil.find(
      (w) =>
        w.tipe === 'kecamatan' &&
        (w.id === mk.kode || normalisasiNamaWilayah(w.nama) === normalisasiNamaWilayah(mk.nama))
    );
    if (!targetKec) return;

    const setDesa = desaPerKec.get(targetKec.id) ?? new Set();
    const masterDesas = ambilMasterDesaPerKecamatan(mk.kode);
    masterDesas.forEach((md) => {
      const normDesa = normalisasiNamaWilayah(md.nama);
      if (!setDesa.has(normDesa) && !sudahAdaId.has(md.kode)) {
        hasil.push({
          id: md.kode,
          tipe: 'desa',
          nama: md.nama,
          parent_id: targetKec.id,
          uptd_id: targetKec.uptd_id,
          lat_pusat: md.latPusat ?? targetKec.lat_pusat,
          lng_pusat: md.lngPusat ?? targetKec.lng_pusat,
        });
        setDesa.add(normDesa);
        setDesa.add(md.kode);
        sudahAdaId.add(md.kode);
      }
    });
    desaPerKec.set(targetKec.id, setDesa);
  });

  return hasil;
}

// Penyimpanan memori Fase 1 (diklon dari mock agar dapat direset saat Keluar Sistem)
let dbProfiles: DbProfileRow[] = structuredClone(MOCK_PROFILES);
let dbUptd: DbUptdRow[] = structuredClone(MOCK_UPTD);
let dbWilayah: DbWilayahRow[] = inisialisasiDbWilayahLengkap();
let dbKomoditas: DbKomoditasRow[] = structuredClone(MOCK_KOMODITAS);
let dbOpt: DbOptRow[] = structuredClone(MOCK_OPT);
let dbLaporan: DbLaporanRow[] = structuredClone(MOCK_LAPORAN);
let dbLaporanFoto: DbLaporanFotoRow[] = structuredClone(MOCK_LAPORAN_FOTO);
let dbNotifikasi: DbNotifikasiRow[] = structuredClone(MOCK_NOTIFIKASI);
let dbRiwayat: LaporanRiwayat[] = [];
let dbLogEkspor: LogEkspor[] = structuredClone(MOCK_LOG_EKSPOR_AWAL);

let konfigurasiAktif: KonfigurasiSistem = {
  klasifikasi: { ...KONFIGURASI_KLASIFIKASI_BAWAAN },
  peringatanForm: { ...KONFIGURASI_PERINGATAN_FORM_BAWAAN },
};

type PelangganLaporan = { filter: FilterLaporan; cb: (e: PerubahanLaporan) => void };
const pelangganLaporan = new Set<PelangganLaporan>();
const pelangganNotifikasi = new Set<() => void>();
const pelangganLogEkspor = new Set<() => void>();
const pelangganKomoditasOpt = new Set<() => void>();
const pelangganPengguna = new Set<() => void>();

function laporanCocokFilterLaporan(laporan: Laporan, filter: FilterLaporan): boolean {
  const hasil = saringTanpaStatus([laporan], filter);
  if (hasil.length === 0) return false;
  if (filter.statusList && filter.statusList.length > 0) {
    return filter.statusList.includes(laporan.status);
  }
  return laporan.status === 'menunggu' || laporan.status === 'terverifikasi';
}

function beritahuLaporan(e: PerubahanLaporan, sebelum?: Laporan): void {
  pelangganLaporan.forEach(({ filter, cb }) => {
    if (e.jenis === 'reset' || !e.laporanId) {
      cb(e);
      return;
    }
    const row = dbLaporan.find((l) => l.id === e.laporanId);
    if (!row) {
      cb(e);
      return;
    }
    const sesudah = petakanLaporan(row);
    if (
      laporanCocokFilterLaporan(sesudah, filter) ||
      (sebelum && laporanCocokFilterLaporan(sebelum, filter))
    ) {
      cb(e);
    }
  });
}

function beritahuNotifikasi(): void {
  pelangganNotifikasi.forEach((cb) => cb());
}

function beritahuLogEkspor(): void {
  pelangganLogEkspor.forEach((cb) => cb());
}

function beritahuKomoditasOpt(): void {
  pelangganKomoditasOpt.forEach((cb) => cb());
}

function beritahuPengguna(): void {
  pelangganPengguna.forEach((cb) => cb());
}

function samarkanNipTanpaPeminta(nip: string | null): string | null {
  if (!nip) return null;
  const bersih = nip.replace(/\s+/g, '');
  if (bersih.length <= 6) return '******';
  return `${bersih.slice(0, 6)}••••••••••••`;
}

function samarkanLaporanUntukPeminta(laporan: Laporan, peminta?: ProfilPengguna): Laporan {
  if (!laporan.nipPetugas) return laporan;
  const nipAman = peminta
    ? tampilkanNipSesuaiPeran(
        laporan.nipPetugas,
        laporan.petugasId,
        laporan.kabupatenId,
        peminta
      )
    : samarkanNipTanpaPeminta(laporan.nipPetugas);
  return { ...laporan, nipPetugas: nipAman };
}

// Pemetaan snake_case (DB) -> camelCase (Domain TypeScript) HANYA di lapisan ini (SCHEMA.md §7)
function petakanWilayah(row: DbWilayahRow): Wilayah {
  return {
    id: row.id,
    tipe: row.tipe,
    nama: row.nama,
    parentId: row.parent_id,
    uptdId: row.uptd_id,
    latPusat: row.lat_pusat,
    lngPusat: row.lng_pusat,
  };
}

function petakanUptd(row: DbUptdRow): Uptd {
  return {
    id: row.id,
    nama: row.nama,
    kabupatenId: row.kabupaten_id,
    jumlahPengamatAktif: row.jumlah_pengamat_aktif,
  };
}

function petakanProfil(row: DbProfileRow): ProfilPengguna {
  const wil = row.wilayah_id ? dbWilayah.find((w) => w.id === row.wilayah_id) : null;
  return {
    id: row.id,
    nama: row.nama,
    nip: row.nip,
    jabatan: row.jabatan,
    peran: row.peran,
    wilayahId: row.wilayah_id,
    namaWilayah: wil ? wil.nama : 'Provinsi Kalimantan Timur',
    wkpp: row.wkpp,
    aktif: row.aktif,
  };
}

function petakanKomoditas(row: DbKomoditasRow): Komoditas {
  return {
    id: row.id,
    nama: row.nama,
    aktif: row.aktif,
    kodeIkon: row.kode_ikon,
  };
}

function petakanOpt(row: DbOptRow): Opt {
  const kom = dbKomoditas.find((k) => k.id === row.komoditas_id);
  return {
    id: row.id,
    komoditasId: row.komoditas_id,
    namaKomoditas: kom ? kom.nama : '-',
    namaLokal: row.nama_lokal,
    namaIlmiah: row.nama_ilmiah,
    jenis: row.jenis,
    gejala: row.gejala,
    rekomendasi: row.rekomendasi,
  };
}

function petakanFoto(row: DbLaporanFotoRow): LaporanFoto {
  return {
    id: row.id,
    laporanId: row.laporan_id,
    namaBerkas: row.nama_berkas,
    pratinjauUrl: row.path_storage,
    geotagLat: row.geotag_lat,
    geotagLng: row.geotag_lng,
    urutan: row.urutan,
  };
}

function petakanLaporan(row: DbLaporanRow): Laporan {
  const desa = dbWilayah.find((w) => w.id === row.desa_id);
  const kec = desa?.parent_id ? dbWilayah.find((w) => w.id === desa.parent_id) : undefined;
  const kab = kec?.parent_id ? dbWilayah.find((w) => w.id === kec.parent_id) : undefined;
  const petugas = dbProfiles.find((p) => p.id === row.petugas_id);
  const kom = dbKomoditas.find((k) => k.id === row.komoditas_id);
  const opt = dbOpt.find((o) => o.id === row.opt_id);

  const intensitasPersen = hitungIntensitas(row.luas_ringan, row.luas_berat, row.luas_amatan);
  const tingkat = klasifikasiTingkat(intensitasPersen, konfigurasiAktif.klasifikasi);
  const fotos = dbLaporanFoto
    .filter((f) => f.laporan_id === row.id)
    .sort((a, b) => a.urutan - b.urutan)
    .map(petakanFoto);

  return {
    id: row.id,
    kode: row.kode,
    petugasId: row.petugas_id,
    namaPetugas: petugas?.nama ?? 'Petugas Simulasi',
    nipPetugas: petugas?.nip ?? null,
    desaId: row.desa_id,
    namaDesa: desa?.nama ?? '-',
    kecamatanId: kec?.id ?? '',
    namaKecamatan: kec?.nama ?? '-',
    kabupatenId: kab?.id ?? '',
    namaKabupaten: kab?.nama ?? '-',
    uptdId: kab?.uptd_id ?? desa?.uptd_id ?? null,
    namaBlok: row.nama_blok,
    lat: row.lat,
    lng: row.lng,
    komoditasId: row.komoditas_id,
    namaKomoditas: kom?.nama ?? '-',
    optId: row.opt_id,
    namaOptLokal: opt?.nama_lokal ?? '-',
    namaOptIlmiah: opt?.nama_ilmiah ?? '-',
    jenisOpt: opt?.jenis ?? 'hama',
    faseTanaman: row.fase_tanaman,
    tahun: row.tahun,
    triwulan: row.triwulan,
    semester: row.semester,
    luasAmatan: row.luas_amatan,
    luasRingan: row.luas_ringan,
    luasBerat: row.luas_berat,
    luasTerkendali: row.luas_terkendali,
    intensitasPersen,
    tingkat,
    status: row.status,
    rekomendasiKultur: row.rekomendasi_kultur,
    rekomendasiHayati: row.rekomendasi_hayati,
    rekomendasiKimiawi: row.rekomendasi_kimiawi,
    catatanVerifikasi: row.catatan_verifikasi,
    dibuatPada: row.dibuat_pada,
    diverifikasiOleh: row.diverifikasi_oleh,
    diverifikasiPada: row.diverifikasi_pada,
    fotos,
  };
}

function saringTanpaStatus(daftar: Laporan[], filter: FilterLaporan): Laporan[] {
  return daftar.filter((item) => {
    if (filter.tahun && item.tahun !== filter.tahun) return false;
    if (filter.modePeriode === 'triwulan' && filter.triwulan && item.triwulan !== filter.triwulan) {
      return false;
    }
    if (filter.modePeriode === 'semester' && filter.semester && item.semester !== filter.semester) {
      return false;
    }
    if (filter.modePeriode === 'realtime') {
      if (filter.triwulan && item.triwulan !== filter.triwulan) return false;
      if (filter.semester && item.semester !== filter.semester) return false;
    }
    if (!filter.modePeriode) {
      if (filter.triwulan && item.triwulan !== filter.triwulan) return false;
      if (filter.semester && item.semester !== filter.semester) return false;
    }

    if (filter.kabupatenId && item.kabupatenId !== filter.kabupatenId) return false;
    if (filter.kecamatanId && item.kecamatanId !== filter.kecamatanId) return false;
    if (filter.desaId && item.desaId !== filter.desaId) return false;
    if (filter.uptdId && item.uptdId !== filter.uptdId) return false;

    if (filter.komoditasIds && filter.komoditasIds.length > 0) {
      if (!filter.komoditasIds.includes(item.komoditasId)) return false;
    }

    if (filter.tingkatList && filter.tingkatList.length > 0) {
      if (!filter.tingkatList.includes(item.tingkat)) return false;
    }

    if (filter.kataKunci && filter.kataKunci.trim().length > 0) {
      const q = filter.kataKunci.trim().toLowerCase();
      const gabungan = [
        item.kode,
        item.namaKabupaten,
        item.namaKecamatan,
        item.namaDesa,
        item.namaBlok,
        item.namaKomoditas,
        item.namaOptLokal,
        item.namaOptIlmiah,
        item.namaPetugas,
      ]
        .join(' ')
        .toLowerCase();
      if (!gabungan.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Satu fungsi penyaring terpusat untuk Dashboard, Peta GIS, Rekapitulasi, dan Ekspor (AGENTS.md §7).
 * Bila statusList tidak ditentukan, menampilkan laporan terpublikasi ('menunggu' & 'terverifikasi')
 * sesuai nilai bawaan AGENTS.md §11 no. 7.
 */
function saringLaporanTerpusat(filter: FilterLaporan): Laporan[] {
  const semua = dbLaporan
    .map(petakanLaporan)
    .sort((a, b) => new Date(b.dibuatPada).getTime() - new Date(a.dibuatPada).getTime());

  const hasilAwal = saringTanpaStatus(semua, filter);
  const statusAktif: StatusLaporan[] =
    filter.statusList && filter.statusList.length > 0
      ? filter.statusList
      : ['menunggu', 'terverifikasi'];

  return hasilAwal.filter((item) => statusAktif.includes(item.status));
}

function wilayahDesaDenganKabupaten(desaId: string): { desa: DbWilayahRow; kabupaten: DbWilayahRow } | null {
  const desa = dbWilayah.find((w) => w.id === desaId && w.tipe === 'desa');
  if (!desa?.parent_id) return null;
  const kec = dbWilayah.find((w) => w.id === desa.parent_id && w.tipe === 'kecamatan');
  if (!kec?.parent_id) return null;
  const kabupaten = dbWilayah.find((w) => w.id === kec.parent_id && w.tipe === 'kabupaten');
  if (!kabupaten) return null;
  return { desa, kabupaten };
}

function validasiWilayahKabupatenUntukPeran(
  kabupatenId: string,
  peminta: ProfilPengguna
): string | null {
  if (peminta.peran === 'admin') return null;
  if (!peminta.wilayahId) {
    return 'Profil pengguna simulasi tidak memiliki wilayah kabupaten kerja.';
  }
  if (peminta.wilayahId !== kabupatenId) {
    return 'Anda hanya dapat mengelola laporan pada kabupaten/kota wilayah kerja simulasi Anda.';
  }
  return null;
}

function validasiInputLaporan(input: LaporanInput, peminta?: ProfilPengguna): string | null {
  if (!input.desaId) return 'Desa/Kelurahan wajib dipilih.';
  const hierarki = wilayahDesaDenganKabupaten(input.desaId);
  if (!hierarki) return 'Desa/Kelurahan tidak valid atau tidak memiliki hierarki kabupaten/kota.';
  if (!input.namaBlok || input.namaBlok.trim().length < 3) {
    return 'Nama Blok / Kelompok Tani wajib diisi (minimal 3 karakter).';
  }
  const cekKoord = validasiKoordinatKaltim(input.lat, input.lng);
  if (!cekKoord.valid) return cekKoord.pesan ?? 'Koordinat di luar Kalimantan Timur.';

  const kom = dbKomoditas.find((k) => k.id === input.komoditasId);
  if (!kom) return 'Komoditas perkebunan wajib dipilih.';

  const opt = dbOpt.find((o) => o.id === input.optId);
  if (!opt) return 'Jenis Hama/OPT wajib dipilih.';
  if (opt.komoditas_id !== input.komoditasId) {
    return 'Jenis OPT yang dipilih tidak sesuai dengan komoditas.';
  }

  if (!validasiPeriode(input.triwulan, input.semester)) {
    return 'Kombinasi Triwulan dan Semester tidak konsisten (TW I–II = Semester 1, TW III–IV = Semester 2).';
  }

  const cekLuas = validasiLuas(
    input.luasAmatan,
    input.luasRingan,
    input.luasBerat,
    input.luasTerkendali
  );
  if (!cekLuas.valid) return cekLuas.galat[0] ?? 'Data luas serangan tidak valid.';

  if (input.fotos.length > 3) {
    return 'Maksimal 3 foto dokumentasi per laporan.';
  }

  if (peminta) {
    const cekWilayah = validasiWilayahKabupatenUntukPeran(hierarki.kabupaten.id, peminta);
    if (cekWilayah) return cekWilayah;
  }

  return null;
}

const SINGKATAN_KABUPATEN: Record<string, string> = {
  'kab-paser': 'PSR',
  'kab-ppu': 'PPU',
  'kab-kubar': 'KBR',
  'kab-kukar': 'KKR',
  'kab-kutim': 'KTM',
  'kab-berau': 'BRU',
  'kab-mahulu': 'MHU',
  'kota-balikpapan': 'BPN',
  'kota-samarinda': 'SMD',
  'kota-bontang': 'BTG',
};

function buatKodeSimulasi(desaId: string, tahun: number): string {
  const hierarki = wilayahDesaDenganKabupaten(desaId);
  const kabId = hierarki?.kabupaten.id ?? '';
  const singkatan =
    SINGKATAN_KABUPATEN[kabId] ??
    (hierarki?.kabupaten.nama ?? 'KTM')
      .replace(/^(Kab\.|Kota)\s+/i, '')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 3)
      .toUpperCase();

  const awalan = `SIM-${singkatan}-${tahun}-`;
  let maksUrut = 0;
  for (const row of dbLaporan) {
    if (!row.kode.startsWith(awalan)) continue;
    const nomor = Number.parseInt(row.kode.slice(awalan.length), 10);
    if (Number.isFinite(nomor) && nomor > maksUrut) maksUrut = nomor;
  }
  return `${awalan}${String(maksUrut + 1).padStart(3, '0')}`;
}

function simpanFotoLaporan(laporanId: string, fotos: LaporanInput['fotos']): void {
  dbLaporanFoto = dbLaporanFoto.filter((f) => f.laporan_id !== laporanId);
  fotos.slice(0, 3).forEach((f, idx) => {
    dbLaporanFoto.push({
      id: `foto-${laporanId}-${idx + 1}`,
      laporan_id: laporanId,
      nama_berkas: f.namaBerkas,
      path_storage: f.pratinjauUrl,
      geotag_lat: f.geotagLat,
      geotag_lng: f.geotagLng,
      urutan: (idx + 1) as 1 | 2 | 3,
    });
  });
}

export const laporanRepository: LaporanRepository = {
  async daftar(
    filter: FilterLaporan,
    halaman?: Halaman,
    peminta?: ProfilPengguna
  ): Promise<Hasil<Laporan[]>> {
    const tersaring = saringLaporanTerpusat(filter).map((item) =>
      samarkanLaporanUntukPeminta(item, peminta)
    );
    const total = tersaring.length;
    if (!halaman) {
      return { ok: true, data: tersaring, total };
    }
    const mulai = Math.max(0, (halaman.nomor - 1) * halaman.ukuran);
    const potongan = tersaring.slice(mulai, mulai + halaman.ukuran);
    return { ok: true, data: potongan, total };
  },

  async detail(id: string, peminta?: ProfilPengguna): Promise<Hasil<Laporan>> {
    const row = dbLaporan.find((l) => l.id === id);
    if (!row) return { ok: false, pesan: 'Laporan tidak ditemukan.' };
    return { ok: true, data: samarkanLaporanUntukPeminta(petakanLaporan(row), peminta) };
  },

  async simpanDraf(input: LaporanInput, peminta: ProfilPengguna): Promise<Hasil<Laporan>> {
    if (!input.desaId) {
      return { ok: false, pesan: 'Pilih minimal Desa/Kelurahan sebelum menyimpan draf.' };
    }
    const hierarki = wilayahDesaDenganKabupaten(input.desaId);
    if (!hierarki) {
      return { ok: false, pesan: 'Desa/Kelurahan tidak valid atau tidak memiliki hierarki kabupaten/kota.' };
    }
    const cekWilayah = validasiWilayahKabupatenUntukPeran(hierarki.kabupaten.id, peminta);
    if (cekWilayah) return { ok: false, pesan: cekWilayah };

    if (input.luasAmatan <= 0) {
      return { ok: false, pesan: 'Luas pengamatan wajib lebih besar dari 0 Ha untuk menyimpan laporan.' };
    }
    const sekarang = new Date().toISOString();
    const idAda = input.id ? dbLaporan.find((l) => l.id === input.id) : undefined;

    if (idAda) {
      if (peminta.peran === 'petugas' && idAda.petugas_id !== peminta.id) {
        return {
          ok: false,
          pesan: 'Petugas lapangan hanya dapat mengubah draf/laporan miliknya sendiri.',
        };
      }
      const transisi = transisiStatusLaporan({ statusSaatIni: idAda.status, aksi: 'simpan_draf' });
      if (!transisi.diizinkan) return { ok: false, pesan: transisi.pesan ?? 'Transisi status tidak diizinkan.' };
      if (idAda.status === 'terverifikasi' && peminta.peran === 'petugas') {
        return { ok: false, pesan: 'Laporan terverifikasi tidak dapat diubah oleh Petugas.' };
      }

      const sebelum = petakanLaporan(idAda);
      idAda.desa_id = input.desaId;
      idAda.nama_blok = input.namaBlok?.trim() || 'Blok Draf';
      idAda.lat = input.lat;
      idAda.lng = input.lng;
      idAda.komoditas_id = input.komoditasId;
      idAda.opt_id = input.optId;
      idAda.fase_tanaman = input.faseTanaman;
      idAda.tahun = input.tahun;
      idAda.triwulan = input.triwulan;
      idAda.semester = input.semester;
      idAda.luas_amatan = input.luasAmatan;
      idAda.luas_ringan = input.luasRingan;
      idAda.luas_berat = input.luasBerat;
      idAda.luas_terkendali = input.luasTerkendali;
      idAda.status = 'draf';
      idAda.rekomendasi_kultur = input.rekomendasiKultur ?? '';
      idAda.rekomendasi_hayati = input.rekomendasiHayati ?? '';
      idAda.rekomendasi_kimiawi = input.rekomendasiKimiawi ?? '';
      simpanFotoLaporan(idAda.id, input.fotos ?? []);
      beritahuLaporan({ jenis: 'ubah', laporanId: idAda.id }, sebelum);
      return { ok: true, data: samarkanLaporanUntukPeminta(petakanLaporan(idAda), peminta) };
    }

    const idBaru = `lap-${Date.now()}`;
    const barisBaru: DbLaporanRow = {
      id: idBaru,
      kode: buatKodeSimulasi(input.desaId, input.tahun),
      petugas_id: peminta.id || input.petugasId,
      desa_id: input.desaId,
      nama_blok: input.namaBlok?.trim() || 'Blok Draf',
      lat: input.lat,
      lng: input.lng,
      komoditas_id: input.komoditasId,
      opt_id: input.optId,
      fase_tanaman: input.faseTanaman,
      tahun: input.tahun,
      triwulan: input.triwulan,
      semester: input.semester,
      luas_amatan: input.luasAmatan,
      luas_ringan: input.luasRingan,
      luas_berat: input.luasBerat,
      luas_terkendali: input.luasTerkendali,
      status: 'draf',
      rekomendasi_kultur: input.rekomendasiKultur ?? '',
      rekomendasi_hayati: input.rekomendasiHayati ?? '',
      rekomendasi_kimiawi: input.rekomendasiKimiawi ?? '',
      catatan_verifikasi: null,
      dibuat_pada: sekarang,
      diverifikasi_oleh: null,
      diverifikasi_pada: null,
    };
    dbLaporan = [barisBaru, ...dbLaporan];
    simpanFotoLaporan(idBaru, input.fotos ?? []);
    beritahuLaporan({ jenis: 'tambah', laporanId: idBaru });
    return { ok: true, data: samarkanLaporanUntukPeminta(petakanLaporan(barisBaru), peminta) };
  },

  async publikasikan(input: LaporanInput, peminta: ProfilPengguna): Promise<Hasil<Laporan>> {
    const pesanGalat = validasiInputLaporan(input, peminta);
    if (pesanGalat) {
      return { ok: false, pesan: pesanGalat };
    }

    const sekarang = new Date().toISOString();
    const idTarget = input.id ?? `lap-${Date.now()}`;
    const lama = dbLaporan.find((l) => l.id === idTarget);
    let sebelum: Laporan | undefined;

    if (lama) {
      if (peminta.peran === 'petugas' && lama.petugas_id !== peminta.id) {
        return {
          ok: false,
          pesan: 'Petugas lapangan hanya dapat mempublikasikan laporan miliknya sendiri.',
        };
      }
      const transisi = transisiStatusLaporan({ statusSaatIni: lama.status, aksi: 'publikasikan' });
      if (!transisi.diizinkan) return { ok: false, pesan: transisi.pesan ?? 'Transisi status tidak diizinkan.' };
      if (lama.status === 'terverifikasi' && peminta.peran === 'petugas') {
        return { ok: false, pesan: 'Laporan yang telah terverifikasi tidak dapat diubah oleh Petugas.' };
      }
      sebelum = petakanLaporan(lama);
    }

    const baris: DbLaporanRow = {
      id: idTarget,
      kode: lama ? lama.kode : buatKodeSimulasi(input.desaId, input.tahun),
      petugas_id: lama ? lama.petugas_id : peminta.id || input.petugasId,
      desa_id: input.desaId,
      nama_blok: input.namaBlok.trim(),
      lat: input.lat,
      lng: input.lng,
      komoditas_id: input.komoditasId,
      opt_id: input.optId,
      fase_tanaman: input.faseTanaman,
      tahun: input.tahun,
      triwulan: input.triwulan,
      semester: input.semester,
      luas_amatan: input.luasAmatan,
      luas_ringan: input.luasRingan,
      luas_berat: input.luasBerat,
      luas_terkendali: input.luasTerkendali,
      status: 'menunggu',
      rekomendasi_kultur: input.rekomendasiKultur.trim(),
      rekomendasi_hayati: input.rekomendasiHayati.trim(),
      rekomendasi_kimiawi: input.rekomendasiKimiawi.trim(),
      catatan_verifikasi: null,
      dibuat_pada: lama ? lama.dibuat_pada : sekarang,
      diverifikasi_oleh: null,
      diverifikasi_pada: null,
    };

    if (lama) {
      dbLaporan = dbLaporan.map((l) => (l.id === idTarget ? baris : l));
    } else {
      dbLaporan = [baris, ...dbLaporan];
    }

    simpanFotoLaporan(idTarget, input.fotos);
    hapusDrafLokalForm();

    const hasil = petakanLaporan(baris);
    const eksplosif = hasil.intensitasPersen > konfigurasiAktif.peringatanForm.ambangEksplosif;

    dbNotifikasi = [
      {
        id: `notif-${Date.now()}`,
        user_id: 'semua',
        judul: eksplosif
          ? `Peringatan Eksplosif: ${hasil.namaOptLokal} (${hasil.intensitasPersen.toFixed(1).replace('.', ',')}%)`
          : `Menunggu Validasi: ${hasil.namaKomoditas} — ${hasil.namaKabupaten}`,
        isi: `Laporan ${hasil.kode} di Desa ${hasil.namaDesa} (${hasil.namaKecamatan}) seluas ${(hasil.luasRingan + hasil.luasBerat).toFixed(2).replace('.', ',')} Ha telah dipublikasikan ke GIS.`,
        tipe: eksplosif ? 'peringatan_eksplosif' : 'menunggu_validasi',
        dibaca: false,
        dibuat_pada: sekarang,
        laporan_id: idTarget,
      },
      ...dbNotifikasi,
    ];

    beritahuNotifikasi();
    beritahuLaporan({ jenis: lama ? 'ubah' : 'tambah', laporanId: idTarget }, sebelum);
    return { ok: true, data: samarkanLaporanUntukPeminta(hasil, peminta) };
  },

  async ubahLaporanTerverifikasi(
    id: string,
    input: LaporanInput,
    peminta: ProfilPengguna,
    catatanPerubahan: string
  ): Promise<Hasil<Laporan>> {
    if (peminta.peran === 'petugas') {
      return { ok: false, pesan: 'Petugas lapangan tidak memiliki izin mengubah laporan terverifikasi.' };
    }
    if (!catatanPerubahan || catatanPerubahan.trim().length < 5) {
      return {
        ok: false,
        pesan: 'Perubahan laporan terverifikasi oleh Operator/Admin wajib disertai catatan perubahan.',
      };
    }
    const pesanGalat = validasiInputLaporan(input, peminta);
    if (pesanGalat) return { ok: false, pesan: pesanGalat };

    const target = dbLaporan.find((l) => l.id === id);
    if (!target) return { ok: false, pesan: 'Laporan tidak ditemukan.' };
    if (target.status !== 'terverifikasi') {
      return {
        ok: false,
        pesan: 'Metode ini hanya untuk mengubah laporan yang sudah terverifikasi.',
      };
    }

    const sebelum = petakanLaporan(target);
    target.desa_id = input.desaId;
    target.nama_blok = input.namaBlok.trim();
    target.lat = input.lat;
    target.lng = input.lng;
    target.komoditas_id = input.komoditasId;
    target.opt_id = input.optId;
    target.fase_tanaman = input.faseTanaman;
    target.tahun = input.tahun;
    target.triwulan = input.triwulan;
    target.semester = input.semester;
    target.luas_amatan = input.luasAmatan;
    target.luas_ringan = input.luasRingan;
    target.luas_berat = input.luasBerat;
    target.luas_terkendali = input.luasTerkendali;
    target.rekomendasi_kultur = input.rekomendasiKultur.trim();
    target.rekomendasi_hayati = input.rekomendasiHayati.trim();
    target.rekomendasi_kimiawi = input.rekomendasiKimiawi.trim();
    target.catatan_verifikasi = catatanPerubahan.trim();

    simpanFotoLaporan(id, input.fotos);

    dbRiwayat = [
      {
        id: `riw-${Date.now()}`,
        laporanId: id,
        diubahOleh: peminta.id,
        namaPengubah: peminta.nama,
        diubahPada: new Date().toISOString(),
        catatan: catatanPerubahan.trim(),
      },
      ...dbRiwayat,
    ];

    beritahuLaporan({ jenis: 'ubah', laporanId: id }, sebelum);
    return { ok: true, data: samarkanLaporanUntukPeminta(petakanLaporan(target), peminta) };
  },

  async verifikasi(
    id: string,
    keputusan: 'terverifikasi' | 'ditolak',
    peminta: ProfilPengguna,
    catatan?: string
  ): Promise<Hasil<Laporan>> {
    if (peminta.peran === 'petugas') {
      return {
        ok: false,
        pesan: 'Petugas POPT tidak dapat memverifikasi laporan. Beralihlah ke Portal Operator UPTD atau Admin.',
      };
    }
    if (keputusan === 'ditolak' && (!catatan || catatan.trim().length < 5)) {
      return { ok: false, pesan: 'Penolakan laporan wajib disertai alasan penolakan (minimal 5 karakter).' };
    }

    const row = dbLaporan.find((l) => l.id === id);
    if (!row) return { ok: false, pesan: 'Laporan tidak ditemukan.' };

    const hierarki = wilayahDesaDenganKabupaten(row.desa_id);
    if (hierarki) {
      const cekWilayah = validasiWilayahKabupatenUntukPeran(hierarki.kabupaten.id, peminta);
      if (cekWilayah) return { ok: false, pesan: cekWilayah };
    }

    const transisi = transisiStatusLaporan({ statusSaatIni: row.status, aksi: 'verifikasi', keputusan });
    if (!transisi.diizinkan) return { ok: false, pesan: transisi.pesan ?? 'Transisi status tidak diizinkan.' };

    if (row.status === 'terverifikasi' && (!catatan || catatan.trim().length < 5)) {
      return {
        ok: false,
        pesan: 'Perubahan atas laporan yang sudah terverifikasi wajib menyertakan catatan perubahan.',
      };
    }

    const sebelum = petakanLaporan(row);
    const waktu = new Date().toISOString();
    row.status = keputusan;
    row.catatan_verifikasi =
      catatan && catatan.trim().length > 0
        ? catatan.trim()
        : `Diverifikasi oleh ${peminta.nama}.`;
    row.diverifikasi_oleh = peminta.id;
    row.diverifikasi_pada = waktu;

    dbRiwayat = [
      {
        id: `riw-${Date.now()}`,
        laporanId: id,
        diubahOleh: peminta.id,
        namaPengubah: peminta.nama,
        diubahPada: waktu,
        catatan: row.catatan_verifikasi,
      },
      ...dbRiwayat,
    ];

    beritahuLaporan({ jenis: 'verifikasi', laporanId: id }, sebelum);
    return { ok: true, data: samarkanLaporanUntukPeminta(petakanLaporan(row), peminta) };
  },

  async riwayat(laporanId: string): Promise<Hasil<LaporanRiwayat[]>> {
    return {
      ok: true,
      data: dbRiwayat.filter((r) => r.laporanId === laporanId),
    };
  },

  langganan(filter: FilterLaporan, cb: (e: PerubahanLaporan) => void): () => void {
    const entri: PelangganLaporan = { filter, cb };
    pelangganLaporan.add(entri);
    return () => {
      pelangganLaporan.delete(entri);
    };
  },
};

export const wilayahRepository: WilayahRepository = {
  async daftarKabupaten(): Promise<Hasil<Wilayah[]>> {
    return {
      ok: true,
      data: dbWilayah.filter((w) => w.tipe === 'kabupaten').map(petakanWilayah),
    };
  },
  async daftarKecamatan(kabupatenId?: string): Promise<Hasil<Wilayah[]>> {
    return {
      ok: true,
      data: dbWilayah
        .filter((w) => w.tipe === 'kecamatan' && (!kabupatenId || w.parent_id === kabupatenId))
        .map(petakanWilayah),
    };
  },
  async daftarDesa(kecamatanId?: string): Promise<Hasil<Wilayah[]>> {
    return {
      ok: true,
      data: dbWilayah
        .filter((w) => w.tipe === 'desa' && (!kecamatanId || w.parent_id === kecamatanId))
        .map(petakanWilayah),
    };
  },
  async semuaWilayah(): Promise<Hasil<Wilayah[]>> {
    return { ok: true, data: dbWilayah.map(petakanWilayah) };
  },
  async daftarUptd(): Promise<Hasil<Uptd[]>> {
    return { ok: true, data: dbUptd.map(petakanUptd) };
  },
  async tambahDesa(input: {
    nama: string;
    kecamatanId: string;
    latPusat?: number;
    lngPusat?: number;
  }): Promise<Hasil<Wilayah>> {
    const namaBersih = input.nama.trim();
    if (!namaBersih) {
      return { ok: false, pesan: 'Nama desa / kelurahan wajib diisi.' };
    }
    const kecInduk = dbWilayah.find((w) => w.id === input.kecamatanId && w.tipe === 'kecamatan');
    if (!kecInduk) {
      return { ok: false, pesan: 'Kecamatan induk tidak ditemukan.' };
    }
    const idBaru = `desa-custom-${Date.now()}`;
    const barisDesaBaru: DbWilayahRow = {
      id: idBaru,
      tipe: 'desa',
      nama: namaBersih,
      parent_id: input.kecamatanId,
      uptd_id: kecInduk.uptd_id,
      lat_pusat: input.latPusat ?? kecInduk.lat_pusat,
      lng_pusat: input.lngPusat ?? kecInduk.lng_pusat,
    };
    dbWilayah.push(barisDesaBaru);
    return { ok: true, data: petakanWilayah(barisDesaBaru) };
  },
  async tambahKecamatan(input: {
    nama: string;
    kabupatenId: string;
  }): Promise<Hasil<Wilayah>> {
    const namaBersih = input.nama.trim();
    if (!namaBersih) {
      return { ok: false, pesan: 'Nama kecamatan wajib diisi.' };
    }
    const kabInduk = dbWilayah.find((w) => w.id === input.kabupatenId && w.tipe === 'kabupaten');
    if (!kabInduk) {
      return { ok: false, pesan: 'Kabupaten induk tidak ditemukan.' };
    }
    const idBaru = `kec-custom-${Date.now()}`;
    const barisKecBaru: DbWilayahRow = {
      id: idBaru,
      tipe: 'kecamatan',
      nama: namaBersih,
      parent_id: input.kabupatenId,
      uptd_id: kabInduk.uptd_id,
      lat_pusat: kabInduk.lat_pusat,
      lng_pusat: kabInduk.lng_pusat,
    };
    dbWilayah.push(barisKecBaru);
    return { ok: true, data: petakanWilayah(barisKecBaru) };
  },
};

export const komoditasOptRepository: KomoditasOptRepository = {
  async daftarKomoditas(): Promise<Hasil<Komoditas[]>> {
    return { ok: true, data: dbKomoditas.map(petakanKomoditas) };
  },
  async daftarOpt(komoditasId?: string): Promise<Hasil<Opt[]>> {
    return {
      ok: true,
      data: dbOpt
        .filter((o) => !komoditasId || o.komoditas_id === komoditasId)
        .map(petakanOpt),
    };
  },
  async tambahOptSimulasi(input, peminta): Promise<Hasil<Opt>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat menambah katalog OPT.' };
    }
    const komoditas = dbKomoditas.find((k) => k.id === input.komoditasId);
    if (!komoditas) {
      return { ok: false, pesan: 'Komoditas untuk OPT tidak valid.' };
    }
    if (!input.namaLokal.trim() || !input.namaIlmiah.trim()) {
      return { ok: false, pesan: 'Nama lokal dan nama ilmiah OPT wajib diisi.' };
    }
    const baru: DbOptRow = {
      id: `opt-sim-${Date.now()}`,
      komoditas_id: input.komoditasId,
      nama_lokal: input.namaLokal.trim(),
      nama_ilmiah: input.namaIlmiah.trim(),
      jenis: input.jenis,
      gejala: input.gejala.trim() || 'Gejala pengamatan simulasi.',
      rekomendasi: input.rekomendasi.trim() || 'Rekomendasi pengendalian terpadu simulasi.',
    };
    dbOpt = [...dbOpt, baru];
    beritahuKomoditasOpt();
    beritahuLaporan({ jenis: 'ubah' });
    return { ok: true, data: petakanOpt(baru) };
  },
  langganan(cb: () => void): () => void {
    pelangganKomoditasOpt.add(cb);
    return () => {
      pelangganKomoditasOpt.delete(cb);
    };
  },
};

export const rekapRepository: RekapRepository = {
  async ringkasan(filter: FilterLaporan): Promise<Hasil<RingkasanRekap>> {
    const semuaTerpetakan = dbLaporan.map(petakanLaporan);
    const lintasStatus = saringTanpaStatus(semuaTerpetakan, filter);
    const daftar = saringLaporanTerpusat(filter);

    let totalLuasAmatan = 0;
    let totalLuasRingan = 0;
    let totalLuasBerat = 0;
    let totalLuasTerkendali = 0;
    let jumlahTitikKritis = 0;
    let jumlahTitikWaspada = 0;
    let jumlahTitikRingan = 0;
    let laporanMenunggu = 0;
    let laporanTerverifikasi = 0;

    const kabSet = new Set<string>();
    const luasPerKomoditas = new Map<string, number>();
    const luasPerOpt = new Map<string, number>();

    for (const l of daftar) {
      totalLuasAmatan += l.luasAmatan;
      totalLuasRingan += l.luasRingan;
      totalLuasBerat += l.luasBerat;
      totalLuasTerkendali += l.luasTerkendali;

      if (l.tingkat === 'berat') jumlahTitikKritis += 1;
      else if (l.tingkat === 'sedang') jumlahTitikWaspada += 1;
      else jumlahTitikRingan += 1;

      if (l.status === 'menunggu') laporanMenunggu += 1;
      if (l.status === 'terverifikasi') laporanTerverifikasi += 1;

      const serang = l.luasRingan + l.luasBerat;
      if (serang > 0 && l.kabupatenId) kabSet.add(l.kabupatenId);

      luasPerKomoditas.set(
        l.namaKomoditas,
        (luasPerKomoditas.get(l.namaKomoditas) ?? 0) + serang
      );
      luasPerOpt.set(l.namaOptLokal, (luasPerOpt.get(l.namaOptLokal) ?? 0) + serang);
    }

    let komoditasUtama = '-';
    let maksKom = -1;
    luasPerKomoditas.forEach((luas, nama) => {
      if (luas > maksKom) {
        maksKom = luas;
        komoditasUtama = nama;
      }
    });

    let optDominan = '-';
    let maksOpt = -1;
    luasPerOpt.forEach((luas, nama) => {
      if (luas > maksOpt) {
        maksOpt = luas;
        optDominan = nama;
      }
    });

    const pembulatan = (n: number) => Math.round(n * 100) / 100;
    const statusListEksplisit = filter.statusList && filter.statusList.length > 0 ? filter.statusList : null;
    const laporanDitolak =
      statusListEksplisit && !statusListEksplisit.includes('ditolak')
        ? 0
        : lintasStatus.filter((l) => l.status === 'ditolak').length;

    return {
      ok: true,
      data: {
        totalLaporan: daftar.length,
        laporanMenunggu,
        laporanTerverifikasi,
        laporanDitolak,
        totalLuasAmatan: pembulatan(totalLuasAmatan),
        totalLuasTerdampak: pembulatan(totalLuasRingan + totalLuasBerat),
        totalLuasBerat: pembulatan(totalLuasBerat),
        // Nama field dipertahankan untuk kompatibilitas; nilainya total luas kategori ringan (Ha).
        totalLuasRinganSedang: pembulatan(totalLuasRingan),
        totalLuasTerkendali: pembulatan(totalLuasTerkendali),
        jumlahTitikKritis,
        jumlahTitikWaspada,
        jumlahTitikRingan,
        jumlahKabupatenTerdampak: kabSet.size,
        komoditasUtama,
        optDominan,
      },
    };
  },

  async trenBulanan(tahun: number, filter: FilterLaporan = {}): Promise<Hasil<BarisTrenBulanan[]>> {
    const filterTahunan: FilterLaporan = {
      ...filter,
      modePeriode: 'tahunan',
      tahun,
      triwulan: undefined,
      semester: undefined,
    };
    const daftar = saringLaporanTerpusat(filterTahunan);

    const petaBulan = new Map<number, { total: number; berat: number }>();
    for (let i = 0; i < 12; i += 1) {
      petaBulan.set(i, { total: 0, berat: 0 });
    }

    let bulanTerakhirTerisi = -1;
    for (const l of daftar) {
      const wita = bulanTahunWita(l.dibuatPada);
      const indeks =
        wita && wita.tahun === tahun
          ? wita.bulanIndex
          : Math.min(11, Math.max(0, (l.triwulan - 1) * 3 + 1));
      const entri = petaBulan.get(indeks) ?? { total: 0, berat: 0 };
      entri.total += l.luasRingan + l.luasBerat;
      entri.berat += l.luasBerat;
      petaBulan.set(indeks, entri);
      if (indeks > bulanTerakhirTerisi) bulanTerakhirTerisi = indeks;
    }

    const baris: BarisTrenBulanan[] = NAMA_BULAN_ID.map((bulan, idx) => {
      const nilai = petaBulan.get(idx) ?? { total: 0, berat: 0 };
      return {
        bulan,
        indeksBulan: idx + 1,
        luasTotal: Math.round(nilai.total * 100) / 100,
        luasBerat: Math.round(nilai.berat * 100) / 100,
        aktif: bulanTerakhirTerisi >= 0 && idx === bulanTerakhirTerisi,
      };
    });

    return { ok: true, data: baris };
  },

  async intensitasPerKomoditas(
    filter: FilterLaporan
  ): Promise<Hasil<BarisIntensitasKomoditas[]>> {
    const daftar = saringLaporanTerpusat(filter);
    const baris: BarisIntensitasKomoditas[] = dbKomoditas.map((kom) => {
      const milik = daftar.filter((l) => l.komoditasId === kom.id);
      let ringan = 0;
      let berat = 0;
      const hitungOpt = new Map<string, number>();

      for (const m of milik) {
        ringan += m.luasRingan;
        berat += m.luasBerat;
        hitungOpt.set(
          m.namaOptLokal,
          (hitungOpt.get(m.namaOptLokal) ?? 0) + m.luasRingan + m.luasBerat
        );
      }

      let optUtama = '-';
      let maks = -1;
      hitungOpt.forEach((v, k) => {
        if (v > maks) {
          maks = v;
          optUtama = k;
        }
      });

      return {
        komoditasId: kom.id,
        namaKomoditas: kom.nama,
        luasRinganSedang: Math.round(ringan * 100) / 100,
        luasBerat: Math.round(berat * 100) / 100,
        luasTotal: Math.round((ringan + berat) * 100) / 100,
        optUtama,
      };
    });

    baris.sort((a, b) => b.luasTotal - a.luasTotal);
    return { ok: true, data: baris };
  },

  async kerentananWilayah(filter: FilterLaporan): Promise<Hasil<BarisKerentananWilayah[]>> {
    const daftar = saringLaporanTerpusat(filter);
    const kabupatenList = dbWilayah.filter((w) => w.tipe === 'kabupaten');

    const baris: BarisKerentananWilayah[] = [];

    for (const kab of kabupatenList) {
      const milik = daftar.filter((l) => l.kabupatenId === kab.id);
      if (milik.length === 0) continue;

      let luasAmatan = 0;
      let luasSerangan = 0;
      let luasBerat = 0;
      let terparah = milik[0];

      for (const m of milik) {
        const serang = m.luasRingan + m.luasBerat;
        luasAmatan += m.luasAmatan;
        luasSerangan += serang;
        luasBerat += m.luasBerat;
        if (m.intensitasPersen > terparah.intensitasPersen) {
          terparah = m;
        }
      }

      const intensitasRata = hitungIntensitas(luasSerangan - luasBerat, luasBerat, luasAmatan);
      const tingkatAncaman = klasifikasiTingkat(
        Math.max(intensitasRata, terparah.intensitasPersen),
        konfigurasiAktif.klasifikasi
      );

      baris.push({
        kabupatenId: kab.id,
        namaKabupaten: kab.nama,
        kecamatanTerparah: terparah.namaKecamatan,
        komoditasUtama: terparah.namaKomoditas,
        namaOptLokal: terparah.namaOptLokal,
        namaOptIlmiah: terparah.namaOptIlmiah,
        luasSerangan: Math.round(luasSerangan * 100) / 100,
        luasBerat: Math.round(luasBerat * 100) / 100,
        intensitasRata,
        tingkatAncaman,
        tindakanLapangan:
          terparah.rekomendasiKultur || terparah.rekomendasiHayati || 'Pemantauan intensif berkala',
      });
    }

    baris.sort((a, b) => b.luasSerangan - a.luasSerangan);
    return { ok: true, data: baris };
  },

  async matriksKabupaten(filter: FilterLaporan): Promise<Hasil<BarisMatriksKabupaten[]>> {
    const daftar = saringLaporanTerpusat(filter);
    const kabupatenList = dbWilayah.filter((w) => w.tipe === 'kabupaten');

    const hasil: BarisMatriksKabupaten[] = kabupatenList.map((kab, idx) => {
      const milik = daftar.filter((l) => l.kabupatenId === kab.id);
      const kecAll = dbWilayah
        .filter((w) => w.tipe === 'kecamatan' && w.parent_id === kab.id)
        .map((k) => k.nama);

      let luasAmatan = 0;
      let luasRingan = 0;
      let luasBerat = 0;
      let luasTerkendali = 0;
      let utama: Laporan | undefined = milik[0];

      for (const m of milik) {
        luasAmatan += m.luasAmatan;
        luasRingan += m.luasRingan;
        luasBerat += m.luasBerat;
        luasTerkendali += m.luasTerkendali;
        if (utama && m.luasRingan + m.luasBerat > utama.luasRingan + utama.luasBerat) {
          utama = m;
        }
      }

      const persenRingan =
        luasAmatan > 0 ? Math.round((luasRingan / luasAmatan) * 1000) / 10 : 0;
      const persenBerat =
        luasAmatan > 0 ? Math.round((luasBerat / luasAmatan) * 1000) / 10 : 0;

      return {
        no: idx + 1,
        kabupatenId: kab.id,
        namaKabupaten: kab.nama,
        daftarKecamatan: kecAll.join(', ') || '-',
        komoditasUtama: utama ? utama.namaKomoditas : 'Belum ada laporan periode ini',
        optDominanLokal: utama ? utama.namaOptLokal : '-',
        optDominanIlmiah: utama ? utama.namaOptIlmiah : '-',
        luasAmatan: Math.round(luasAmatan * 100) / 100,
        luasRingan: Math.round(luasRingan * 100) / 100,
        persenRingan,
        luasBerat: Math.round(luasBerat * 100) / 100,
        persenBerat,
        totalSerangan: Math.round((luasRingan + luasBerat) * 100) / 100,
        luasTerkendali: Math.round(luasTerkendali * 100) / 100,
      };
    });

    return { ok: true, data: hasil };
  },

  async trenTriwulanKomoditas(
    tahun: number,
    filter: FilterLaporan = {}
  ): Promise<Hasil<BarisTrenTriwulanKomoditas[]>> {
    const filterTahunan: FilterLaporan = {
      ...filter,
      modePeriode: 'tahunan',
      tahun,
      triwulan: undefined,
      semester: undefined,
    };
    const daftar = saringLaporanTerpusat(filterTahunan);

    const triwulanList: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
    const labelRomawi = ['TW I', 'TW II', 'TW III', 'TW IV'];

    const data: BarisTrenTriwulanKomoditas[] = triwulanList.map((tw, i) => {
      const baris: BarisTrenTriwulanKomoditas = {
        triwulanLabel: `${labelRomawi[i]} ${tahun}`,
      };
      for (const kom of dbKomoditas) {
        const totalKom = daftar
          .filter((l) => l.triwulan === tw && l.komoditasId === kom.id)
          .reduce((acc, cur) => acc + cur.luasRingan + cur.luasBerat, 0);
        baris[kom.nama] = Math.round(totalKom * 100) / 100;
      }
      return baris;
    });

    return { ok: true, data };
  },
};

export const logEksporRepository: LogEksporRepository = {
  async daftar(): Promise<Hasil<LogEkspor[]>> {
    return { ok: true, data: [...dbLogEkspor] };
  },
  async catat(entri): Promise<Hasil<LogEkspor>> {
    const baru: LogEkspor = {
      ...entri,
      id: `eks-${Date.now()}`,
      dibuatPada: new Date().toISOString(),
    };
    dbLogEkspor = [baru, ...dbLogEkspor];
    beritahuLogEkspor();
    return { ok: true, data: baru };
  },
  langganan(cb: () => void): () => void {
    pelangganLogEkspor.add(cb);
    return () => {
      pelangganLogEkspor.delete(cb);
    };
  },
};

export const notifikasiRepository: NotifikasiRepository = {
  async daftar(userId?: string): Promise<Hasil<NotifikasiItem[]>> {
    const items: NotifikasiItem[] = dbNotifikasi
      .filter((n) => n.user_id === 'semua' || !userId || n.user_id === userId)
      .map((n) => ({
        id: n.id,
        userId: n.user_id,
        judul: n.judul,
        isi: n.isi,
        tipe: n.tipe,
        dibaca: n.dibaca,
        dibuatPada: n.dibuat_pada,
        laporanId: n.laporan_id,
      }));
    return { ok: true, data: items };
  },
  async tandaiDibaca(id: string): Promise<Hasil<void>> {
    dbNotifikasi = dbNotifikasi.map((n) => (n.id === id ? { ...n, dibaca: true } : n));
    beritahuNotifikasi();
    return { ok: true, data: undefined };
  },
  async tandaiSemuaDibaca(): Promise<Hasil<void>> {
    dbNotifikasi = dbNotifikasi.map((n) => ({ ...n, dibaca: true }));
    beritahuNotifikasi();
    return { ok: true, data: undefined };
  },
  langganan(cb: () => void): () => void {
    pelangganNotifikasi.add(cb);
    return () => {
      pelangganNotifikasi.delete(cb);
    };
  },
};

export const penggunaRepository: PenggunaRepository = {
  async daftar(peminta?: ProfilPengguna): Promise<Hasil<ProfilPengguna[]>> {
    const semua = dbProfiles.map(petakanProfil);
    if (!peminta) {
      return {
        ok: true,
        data: semua.map((p) => ({ ...p, nip: samarkanNipTanpaPeminta(p.nip) })),
      };
    }
    if (peminta.peran === 'admin') {
      return { ok: true, data: semua };
    }
    if (peminta.peran === 'operator') {
      const diWilayah = semua
        .filter((p) => p.id === peminta.id || (peminta.wilayahId !== null && p.wilayahId === peminta.wilayahId && p.peran !== 'admin'))
        .filter((p) => p.id === peminta.id || p.wilayahId === peminta.wilayahId)
        .map((p) => ({
          ...p,
          nip: p.nip ? tampilkanNipSesuaiPeran(p.nip, p.id, p.wilayahId, peminta) : null,
        }));
      return { ok: true, data: diWilayah };
    }
    // Petugas hanya dapat melihat profil dirinya sendiri (SCHEMA.md §5)
    return {
      ok: true,
      data: semua.filter((p) => p.id === peminta.id),
    };
  },
  async tambahSimulasi(input, peminta): Promise<Hasil<ProfilPengguna>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat menambah pengguna simulasi.' };
    }
    if (!input.nama.trim()) {
      return { ok: false, pesan: 'Nama pengguna wajib diisi.' };
    }
    if (input.peran === 'petugas') {
      if (!input.wilayahId) {
        return { ok: false, pesan: 'Wilayah kabupaten/kota wajib dipilih untuk Petugas Lapangan.' };
      }
      const wilayah = dbWilayah.find((w) => w.id === input.wilayahId && w.tipe === 'kabupaten');
      if (!wilayah) {
        return { ok: false, pesan: 'Wilayah kabupaten/kota tidak valid.' };
      }
    }

    const namaSimulasi = input.nama.toLowerCase().includes('simulasi')
      ? input.nama.trim()
      : `${input.nama.trim()} (Simulasi)`;
    const nipMentah = input.nip.trim();
    let nipSimulasi = nipMentah
      ? nipMentah.toUpperCase().startsWith('SIM-')
        ? nipMentah.trim()
        : `SIM-${nipMentah.trim()}`
      : `SIM-USR-${String(dbProfiles.length + 1).padStart(4, '0')}`;
    if (dbProfiles.some((p) => p.nip && p.nip.toLowerCase() === nipSimulasi.toLowerCase())) {
      let urut = dbProfiles.length + 1;
      while (dbProfiles.some((p) => p.nip === `SIM-USR-${String(urut).padStart(4, '0')}`)) urut += 1;
      nipSimulasi = `SIM-USR-${String(urut).padStart(4, '0')}`;
    }

    const idWilayahFinal = input.peran === 'admin' || !input.wilayahId ? null : input.wilayahId;

    const barisBaru: DbProfileRow = {
      id: `usr-sim-${Date.now()}`,
      nama: namaSimulasi,
      nip: nipSimulasi,
      jabatan: input.jabatan.trim() || 'Petugas Proteksi Perkebunan (Simulasi)',
      peran: input.peran,
      wilayah_id: idWilayahFinal,
      wkpp: input.wkpp.trim() || 'Wilayah Kerja Simulasi',
      aktif: true,
    };
    dbProfiles = [...dbProfiles, barisBaru];
    beritahuPengguna();
    return { ok: true, data: petakanProfil(barisBaru) };
  },
  async ubahStatusAktif(id, aktif, peminta): Promise<Hasil<ProfilPengguna>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat mengubah status pengguna.' };
    }
    const row = dbProfiles.find((p) => p.id === id);
    if (!row) return { ok: false, pesan: 'Pengguna tidak ditemukan.' };
    row.aktif = aktif;
    beritahuPengguna();
    return { ok: true, data: petakanProfil(row) };
  },
  async hapus(id, peminta): Promise<Hasil<void>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat menghapus pengguna.' };
    }
    if (id === peminta.id) {
      return { ok: false, pesan: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.' };
    }
    const index = dbProfiles.findIndex((p) => p.id === id);
    if (index === -1) {
      return { ok: false, pesan: 'Pengguna tidak ditemukan.' };
    }
    dbProfiles = dbProfiles.filter((p) => p.id !== id);
    beritahuPengguna();
    return { ok: true, data: undefined };
  },
  langganan(cb: () => void): () => void {
    pelangganPengguna.add(cb);
    return () => {
      pelangganPengguna.delete(cb);
    };
  },
};

export const konfigurasiRepository: KonfigurasiRepository = {
  async ambil(): Promise<Hasil<KonfigurasiSistem>> {
    return {
      ok: true,
      data: {
        klasifikasi: { ...konfigurasiAktif.klasifikasi },
        peringatanForm: { ...konfigurasiAktif.peringatanForm },
      },
    };
  },
  async perbarui(konfigurasi, peminta): Promise<Hasil<KonfigurasiSistem>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat memperbarui konfigurasi ambang.' };
    }
    const { klasifikasi, peringatanForm } = konfigurasi;
    const angkaValid = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100;
    if (!angkaValid(klasifikasi.ambangSedangMin) || !angkaValid(klasifikasi.ambangBeratMin)) {
      return { ok: false, pesan: 'Ambang klasifikasi harus berupa angka 0–100 yang valid.' };
    }
    if (klasifikasi.ambangSedangMin <= 0 || klasifikasi.ambangBeratMin <= klasifikasi.ambangSedangMin) {
      return { ok: false, pesan: 'Ambang Berat harus lebih besar dari Ambang Sedang (> 0).' };
    }
    if (!angkaValid(peringatanForm.ambangPeringatan) || !angkaValid(peringatanForm.ambangEksplosif)) {
      return { ok: false, pesan: 'Ambang peringatan formulir harus berupa angka 0–100 yang valid.' };
    }
    if (peringatanForm.ambangEksplosif < peringatanForm.ambangPeringatan) {
      return { ok: false, pesan: 'Ambang eksplosif formulir tidak boleh lebih kecil dari ambang peringatan.' };
    }
    konfigurasiAktif = {
      klasifikasi: { ...klasifikasi },
      peringatanForm: { ...peringatanForm },
    };
    beritahuLaporan({ jenis: 'ubah' });
    return { ok: true, data: structuredClone(konfigurasiAktif) };
  },
};

/**
 * Penyimpanan draf lokal formulir pada peramban (tanpa foto sensitif — SECURITY.md §6).
 */
export interface DrafLokalForm {
  disimpanPada: string;
  nilai: Omit<LaporanInput, 'fotos' | 'petugasId'> & {
    kabupatenId?: string;
    kecamatanId?: string;
  };
}

function storageTersedia(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function simpanDrafLokalForm(nilai: DrafLokalForm['nilai']): void {
  try {
    const storage = storageTersedia();
    if (!storage) return;
    const payload: DrafLokalForm = {
      disimpanPada: new Date().toISOString(),
      nilai,
    };
    storage.setItem(KUNCI_DRAF_LOKAL, JSON.stringify(payload));
  } catch {
    // Abaikan bila mode privat peramban memblokir localStorage
  }
}

function angkaValidDraft(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function drafLokalValid(x: unknown): x is DrafLokalForm {
  if (!x || typeof x !== 'object') return false;
  const d = x as { disimpanPada?: unknown; nilai?: unknown };
  if (typeof d.disimpanPada !== 'string' || !d.nilai || typeof d.nilai !== 'object') return false;
  const v = d.nilai as Record<string, unknown>;
  const teks = ['desaId', 'namaBlok', 'komoditasId', 'optId', 'faseTanaman'];
  if (!teks.every((k) => typeof v[k] === 'string')) return false;
  const angka = ['lat', 'lng', 'tahun', 'triwulan', 'semester', 'luasAmatan', 'luasRingan', 'luasBerat', 'luasTerkendali'];
  if (!angka.every((k) => angkaValidDraft(v[k]))) return false;
  if (![1, 2, 3, 4].includes(v.triwulan as number)) return false;
  if (![1, 2].includes(v.semester as number)) return false;
  return true;
}

export function muatDrafLokalForm(): DrafLokalForm | null {
  try {
    const storage = storageTersedia();
    if (!storage) return null;
    const mentah = storage.getItem(KUNCI_DRAF_LOKAL);
    if (!mentah) return null;
    const parsed = JSON.parse(mentah) as unknown;
    if (!drafLokalValid(parsed)) {
      storage.removeItem(KUNCI_DRAF_LOKAL);
      return null;
    }
    const waktuSimpan = Date.parse(parsed.disimpanPada);
    if (Number.isNaN(waktuSimpan) || Date.now() - waktuSimpan > BATAS_USIA_DRAF_LOKAL_MS) {
      storage.removeItem(KUNCI_DRAF_LOKAL);
      return null;
    }
    return parsed;
  } catch {
    try {
      storageTersedia()?.removeItem(KUNCI_DRAF_LOKAL);
    } catch {
      // Abaikan
    }
    return null;
  }
}

export function hapusDrafLokalForm(): void {
  try {
    storageTersedia()?.removeItem(KUNCI_DRAF_LOKAL);
  } catch {
    // Abaikan
  }
}

/**
 * Menghapus draf lokal dan memulihkan sesi simulasi saat "Keluar Sistem" ditekan (SECURITY.md §6).
 */
export function bersihkanSesiSimulasi(): void {
  hapusDrafLokalForm();
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.clear();
  } catch {
    // Abaikan
  }
  dbProfiles = structuredClone(MOCK_PROFILES);
  dbUptd = structuredClone(MOCK_UPTD);
  dbWilayah = inisialisasiDbWilayahLengkap();
  dbKomoditas = structuredClone(MOCK_KOMODITAS);
  dbOpt = structuredClone(MOCK_OPT);
  dbLaporan = structuredClone(MOCK_LAPORAN);
  dbLaporanFoto = structuredClone(MOCK_LAPORAN_FOTO);
  dbNotifikasi = structuredClone(MOCK_NOTIFIKASI);
  dbRiwayat = [];
  dbLogEkspor = structuredClone(MOCK_LOG_EKSPOR_AWAL);
  konfigurasiAktif = {
    klasifikasi: { ...KONFIGURASI_KLASIFIKASI_BAWAAN },
    peringatanForm: { ...KONFIGURASI_PERINGATAN_FORM_BAWAAN },
  };
  beritahuNotifikasi();
  beritahuLogEkspor();
  beritahuKomoditasOpt();
  beritahuPengguna();
  beritahuLaporan({ jenis: 'reset' });
}

export const eksporService: EksporService = {
  async eksporObservasiExcel(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string,
    tipe: 'observasi' | 'geodata' = 'observasi'
  ): Promise<Hasil<LogEkspor>> {
    try {
      const { unduhExcelLaporan } = await import('../lib/ekspor');
      const daftar = saringLaporanTerpusat(filter).map((item) =>
        samarkanLaporanUntukPeminta(item, peminta)
      );
      const namaBerkas = unduhExcelLaporan(daftar, peminta, filterRingkas, tipe);
      return logEksporRepository.catat({
        userId: peminta.id,
        namaPengguna: peminta.nama,
        peranPengguna: peminta.peran,
        namaBerkas,
        format: 'xlsx',
        tipeDokumen: tipe,
        filterRingkas,
        filterJson: filter,
      });
    } catch {
      return { ok: false, pesan: 'Gagal membuat berkas ekspor Excel simulasi.' };
    }
  },

  async eksporRekapExcel(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string
  ): Promise<Hasil<LogEkspor>> {
    try {
      const [{ unduhExcelMatriksRekap }, matriksHasil, ringkasanHasil] = await Promise.all([
        import('../lib/ekspor'),
        rekapRepository.matriksKabupaten(filter),
        rekapRepository.ringkasan(filter),
      ]);
      if (!matriksHasil.ok) return { ok: false, pesan: matriksHasil.pesan };
      if (!ringkasanHasil.ok) return { ok: false, pesan: ringkasanHasil.pesan };
      const namaBerkas = unduhExcelMatriksRekap(
        matriksHasil.data,
        ringkasanHasil.data,
        peminta,
        filterRingkas
      );
      return logEksporRepository.catat({
        userId: peminta.id,
        namaPengguna: peminta.nama,
        peranPengguna: peminta.peran,
        namaBerkas,
        format: 'xlsx',
        tipeDokumen: 'rekap',
        filterRingkas,
        filterJson: filter,
      });
    } catch {
      return { ok: false, pesan: 'Gagal membuat berkas Excel rekapitulasi simulasi.' };
    }
  },

  async eksporBeritaAcaraPdf(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string,
    judulDokumen?: string
  ): Promise<Hasil<LogEkspor>> {
    try {
      const [{ unduhPdfRekapitulasi }, matriksHasil, ringkasanHasil] = await Promise.all([
        import('../lib/ekspor'),
        rekapRepository.matriksKabupaten(filter),
        rekapRepository.ringkasan(filter),
      ]);
      if (!matriksHasil.ok) return { ok: false, pesan: matriksHasil.pesan };
      if (!ringkasanHasil.ok) return { ok: false, pesan: ringkasanHasil.pesan };
      const namaBerkas = unduhPdfRekapitulasi(
        matriksHasil.data,
        ringkasanHasil.data,
        peminta,
        filterRingkas,
        judulDokumen
      );
      return logEksporRepository.catat({
        userId: peminta.id,
        namaPengguna: peminta.nama,
        peranPengguna: peminta.peran,
        namaBerkas,
        format: 'pdf',
        tipeDokumen: 'berita_acara',
        filterRingkas,
        filterJson: filter,
      });
    } catch {
      return { ok: false, pesan: 'Gagal membuat berkas PDF Berita Acara simulasi.' };
    }
  },

  async eksporPetaSpasialPdf(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string
  ): Promise<Hasil<LogEkspor>> {
    try {
      const [{ unduhPdfKerentananSpasial }, kerentananHasil] = await Promise.all([
        import('../lib/ekspor'),
        rekapRepository.kerentananWilayah(filter),
      ]);
      if (!kerentananHasil.ok) return { ok: false, pesan: kerentananHasil.pesan };
      const namaBerkas = unduhPdfKerentananSpasial(
        kerentananHasil.data,
        peminta,
        filterRingkas
      );
      return logEksporRepository.catat({
        userId: peminta.id,
        namaPengguna: peminta.nama,
        peranPengguna: peminta.peran,
        namaBerkas,
        format: 'pdf',
        tipeDokumen: 'geodata',
        filterRingkas,
        filterJson: filter,
      });
    } catch {
      return { ok: false, pesan: 'Gagal membuat berkas PDF rekap spasial simulasi.' };
    }
  },
};

export function ambilProfilDefaultPeran(peran: 'admin' | 'operator' | 'petugas'): ProfilPengguna {
  const cocok = dbProfiles.find((p) => p.peran === peran && p.aktif) ?? dbProfiles[0];
  return petakanProfil(cocok);
}

/**
 * Menghasilkan satu objek FotoInput pratinjau geotagging simulasi agar UI tidak perlu
 * mengimpor mocks/ atau menulis warna heksadesimal secara langsung.
 */
export function buatContohFotoSimulasi(params: {
  label: string;
  lat: number;
  lng: number;
  tingkat: TingkatSerangan;
  urutan: 1 | 2 | 3;
}): LaporanInput['fotos'][number] {
  const warna =
    params.tingkat === 'berat'
      ? '#C8161D'
      : params.tingkat === 'sedang'
        ? '#B47B00'
        : '#116B31';
  const slugAman = params.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
  return {
    namaBerkas: `simulasi-slot-${params.urutan}-${slugAman || 'kebun'}.jpg`,
    pratinjauUrl: buatFotoSvgSimulasi(params.label, params.lat, params.lng, warna),
    geotagLat: params.lat,
    geotagLng: params.lng,
    urutan: params.urutan,
  };
}
