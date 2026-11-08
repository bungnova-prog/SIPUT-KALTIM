import { transisiStatusLaporan } from '../lib/alurLaporan';
import {
  hitungIntensitasKomoditasDariLaporan,
  hitungKerentananWilayahDariLaporan,
  hitungMatriksKabupatenDariLaporan,
  hitungRingkasanRekapDariLaporan,
  hitungTrenBulananDariLaporan,
  hitungTrenTriwulanKomoditasDariLaporan,
  saringDaftarLaporan,
} from '../lib/agregasiRekap';
import { tampilkanNipSesuaiPeran } from '../lib/format';
import {
  KONFIGURASI_KLASIFIKASI_BAWAAN,
  KONFIGURASI_PERINGATAN_FORM_BAWAAN,
} from '../lib/konfigurasi';
import {
  hitungIntensitas,
  klasifikasiTingkat,
  validasiKoordinatKaltim,
  validasiLuas,
  validasiPeriode,
} from '../lib/klasifikasi';
import type {
  BarisIntensitasKomoditas,
  BarisKerentananWilayah,
  BarisMatriksKabupaten,
  BarisTrenBulanan,
  BarisTrenTriwulanKomoditas,
  FaseTanaman,
  FilterLaporan,
  FotoInput,
  Halaman,
  Hasil,
  JenisOpt,
  Komoditas,
  KonfigurasiSistem,
  Laporan,
  LaporanFoto,
  LaporanInput,
  LaporanRiwayat,
  LogEkspor,
  NotifikasiItem,
  Opt,
  Peran,
  PerubahanLaporan,
  ProfilPengguna,
  RingkasanRekap,
  StatusLaporan,
  TingkatSerangan,
  TipeNotifikasi,
  TipeWilayah,
  Uptd,
  Wilayah,
} from '../types/domain';
import type {
  AuthService,
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
import { hapusDrafLokalForm } from '../lib/drafLokal';
import { ambilKlienSupabase, apakahKonfigurasiSupabaseLengkap } from './klienSupabase';
import { createClient } from '@supabase/supabase-js';

const BUCKET_FOTO_LAPORAN = 'laporan-foto';
const DURASI_URL_BERTANDA_TANGAN_DETIK = 3600;
const UKURAN_MAKS_FOTO_BYTES = 8 * 1024 * 1024;

// Baris snake_case dari PostgreSQL / Supabase (dipetakan hanya di lapisan services/)
interface BarisDbUptd {
  id: string;
  kode?: string;
  nama: string;
  kabupaten_id: string | null;
  jumlah_pengamat_aktif: number;
}

interface BarisDbWilayah {
  id: string;
  kode?: string;
  tipe: TipeWilayah;
  nama: string;
  parent_id: string | null;
  uptd_id: string | null;
  lat_pusat: number | null;
  lng_pusat: number | null;
}

interface BarisDbProfil {
  id: string;
  nama: string;
  nip: string | null;
  jabatan: string;
  peran: Peran;
  wilayah_id: string | null;
  wkpp: string;
  aktif: boolean;
}

interface BarisDbKomoditas {
  id: string;
  nama: string;
  aktif: boolean;
  kode_ikon: Komoditas['kodeIkon'];
}

interface BarisDbOpt {
  id: string;
  komoditas_id: string;
  nama_lokal: string;
  nama_ilmiah: string;
  jenis: JenisOpt;
  gejala: string;
  rekomendasi: string;
}

interface BarisDbKonfigurasi {
  kunci: string;
  nilai: number | string;
}

interface BarisDbLaporanFoto {
  id: string;
  laporan_id: string;
  nama_berkas: string;
  path_storage: string;
  geotag_lat: number;
  geotag_lng: number;
  urutan: 1 | 2 | 3;
}

interface BarisDbLaporan {
  id: string;
  kode: string;
  petugas_id: string;
  desa_id: string;
  nama_blok: string;
  lat: number;
  lng: number;
  komoditas_id: string;
  opt_id: string;
  fase_tanaman: FaseTanaman;
  tahun: number;
  triwulan: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  luas_amatan: number | string;
  luas_ringan: number | string;
  luas_berat: number | string;
  luas_terkendali: number | string;
  intensitas_persen: number | string;
  tingkat: TingkatSerangan;
  status: StatusLaporan;
  rekomendasi_kultur: string;
  rekomendasi_hayati: string;
  rekomendasi_kimiawi: string;
  catatan_verifikasi: string | null;
  dibuat_pada: string;
  diverifikasi_oleh: string | null;
  diverifikasi_pada: string | null;
  profiles?: { nama: string; nip: string | null } | Array<{ nama: string; nip: string | null }>;
  laporan_foto?: BarisDbLaporanFoto[];
}

interface BarisDbRiwayat {
  id: string;
  laporan_id: string;
  diubah_oleh: string;
  diubah_pada: string;
  catatan: string;
  profiles?: { nama: string } | Array<{ nama: string }>;
}

interface BarisDbLogEkspor {
  id: string;
  user_id: string;
  nama_berkas: string;
  format: 'xlsx' | 'pdf';
  tipe_dokumen: LogEkspor['tipeDokumen'];
  filter_ringkas: string;
  filter_json: FilterLaporan;
  dibuat_pada: string;
  profiles?: { nama: string; peran: Peran } | Array<{ nama: string; peran: Peran }>;
}

interface BarisDbNotifikasi {
  id: string;
  user_id: string;
  judul: string;
  isi: string;
  tipe: TipeNotifikasi;
  dibaca: boolean;
  dibuat_pada: string;
  laporan_id: string | null;
}

// Cache referensi sesi ringan (dibersihkan saat keluarSistem)
let cacheWilayah: Wilayah[] | null = null;
let cacheKomoditas: Komoditas[] | null = null;
let cacheOpt: Opt[] | null = null;
let cacheKonfigurasi: KonfigurasiSistem | null = null;

// Pelanggan lokal pendamping Supabase Realtime agar mutasi lokal langsung memperbarui UI
const pelangganLokalLaporan = new Set<(e: PerubahanLaporan) => void>();
const pelangganLokalOpt = new Set<() => void>();
const pelangganLokalLogEkspor = new Set<() => void>();
const pelangganLokalNotifikasi = new Set<() => void>();
const pelangganLokalPengguna = new Set<() => void>();

export function bersihkanCacheSesiSupabase(): void {
  cacheWilayah = null;
  cacheKomoditas = null;
  cacheOpt = null;
  cacheKonfigurasi = null;
}

function terjemahkanGalat(err: unknown, pesanBawaan: string): string {
  if (!err) return pesanBawaan;
  let msg = '';
  if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === 'object' && err !== null && 'message' in err) {
    msg = String((err as { message: unknown }).message || '');
  }

  if (msg) {
    if (msg.includes('Invalid login credentials')) {
      return 'Email atau kata sandi tidak sesuai. Periksa kembali kredensial akun Anda.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Alamat email akun belum dikonfirmasi. Buka tautan aktivasi pada email dinas Anda.';
    }
    if (msg.includes('row-level security') || msg.includes('permission denied')) {
      return 'Akses ditolak oleh kebijakan keamanan wilayah/peran (Row Level Security).';
    }
    if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
      return 'Batas pengiriman email autentikasi Supabase terlampaui. Silakan gunakan fungsi RPC admin_tambah_pengguna melalui berkas SQL di Supabase SQL Editor.';
    }
    if (msg.includes('User already registered') || msg.includes('already registered')) {
      return 'Pengguna dengan alamat email ini sudah terdaftar di sistem autentikasi.';
    }
    if (msg.includes('Signups not allowed')) {
      return 'Pendaftaran akun baru ditutup pada pengaturan Supabase (Authentication > Providers > Email).';
    }
    if (msg.includes('Password should be at least')) {
      return 'Kata sandi minimal 6 karakter.';
    }
    return msg;
  }
  return pesanBawaan;
}

function keAngka(nilai: number | string | null | undefined): number {
  if (typeof nilai === 'number') return Number.isFinite(nilai) ? nilai : 0;
  if (typeof nilai === 'string') {
    const n = Number(nilai);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function petakanWilayah(row: BarisDbWilayah): Wilayah {
  return {
    id: row.id,
    tipe: row.tipe,
    nama: row.nama,
    parentId: row.parent_id,
    uptdId: row.uptd_id,
    latPusat: row.lat_pusat ?? undefined,
    lngPusat: row.lng_pusat ?? undefined,
  };
}

function petakanProfil(row: BarisDbProfil, daftarWilayah: Wilayah[]): ProfilPengguna {
  const wilayah = row.wilayah_id
    ? daftarWilayah.find((w) => w.id === row.wilayah_id)
    : undefined;
  return {
    id: row.id,
    nama: row.nama,
    nip: row.nip,
    jabatan: row.jabatan,
    peran: row.peran,
    wilayahId: row.wilayah_id,
    namaWilayah: wilayah ? wilayah.nama : 'Provinsi Kalimantan Timur',
    wkpp: row.wkpp,
    aktif: row.aktif,
  };
}

function samarkanNipTanpaPeminta(nip: string | null): string {
  if (!nip) return '-';
  const bersih = nip.trim();
  if (bersih.length <= 4) return '••••';
  return `${bersih.slice(0, 4)}••••${bersih.slice(-3)}`;
}

function samarkanLaporanUntukPeminta(item: Laporan, peminta?: ProfilPengguna): Laporan {
  if (!item.nipPetugas) return item;
  const nipTampil = peminta
    ? tampilkanNipSesuaiPeran(item.nipPetugas, item.petugasId, item.kabupatenId, peminta)
    : samarkanNipTanpaPeminta(item.nipPetugas);
  return {
    ...item,
    nipPetugas: nipTampil,
  };
}

async function muatProfilPenggunaDariUserId(userId: string): Promise<Hasil<ProfilPengguna>> {
  try {
    const klien = ambilKlienSupabase();
    const [{ data: barisProfil, error: galatProfil }, hasilWilayah] = await Promise.all([
      klien
        .from('profiles')
        .select('id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif')
        .eq('id', userId)
        .maybeSingle<BarisDbProfil>(),
      wilayahRepository.semuaWilayah(),
    ]);

    if (galatProfil) {
      return {
        ok: false,
        pesan: terjemahkanGalat(galatProfil, 'Gagal memuat profil pengguna dari basis data.'),
      };
    }

    if (!barisProfil) {
      await klien.auth.signOut();
      return {
        ok: false,
        pesan:
          'Akun autentikasi belum memiliki profil peran di tabel profiles. Hubungi Admin Provinsi.',
      };
    }

    if (!barisProfil.aktif) {
      await klien.auth.signOut();
      return {
        ok: false,
        pesan: 'Akun Anda sedang dinonaktifkan oleh Admin Provinsi.',
      };
    }

    const daftarWilayah = hasilWilayah.ok ? hasilWilayah.data : [];
    return {
      ok: true,
      data: petakanProfil(barisProfil, daftarWilayah),
    };
  } catch (err) {
    return {
      ok: false,
      pesan: terjemahkanGalat(err, 'Gagal memverifikasi profil sesi pengguna.'),
    };
  }
}

export const authService: AuthService = {
  statusKonfigurasi() {
    return { lengkap: apakahKonfigurasiSupabaseLengkap() };
  },

  async pulihkanSesiAktif(): Promise<Hasil<ProfilPengguna | null>> {
    if (!apakahKonfigurasiSupabaseLengkap()) {
      return { ok: true, data: null };
    }
    try {
      const klien = ambilKlienSupabase();
      const {
        data: { session },
        error: galatSesi,
      } = await klien.auth.getSession();

      if (galatSesi || !session?.user) {
        return { ok: true, data: null };
      }

      const {
        data: { user },
        error: galatUser,
      } = await klien.auth.getUser();

      if (galatUser || !user) {
        return { ok: true, data: null };
      }

      const hasilProfil = await muatProfilPenggunaDariUserId(user.id);
      if (!hasilProfil.ok) {
        return { ok: false, pesan: hasilProfil.pesan };
      }
      return { ok: true, data: hasilProfil.data };
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Gagal memulihkan sesi autentikasi.'),
      };
    }
  },

  async masukDenganEmailSandi(
    email: string,
    kataSandi: string
  ): Promise<Hasil<ProfilPengguna>> {
    if (!apakahKonfigurasiSupabaseLengkap()) {
      return {
        ok: false,
        pesan:
          'Variabel lingkungan publik VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY belum diisi pada .env lokal.',
      };
    }
    const emailBersih = email.trim().toLowerCase();
    if (!emailBersih || !kataSandi) {
      return { ok: false, pesan: 'Alamat email dan kata sandi wajib diisi.' };
    }

    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien.auth.signInWithPassword({
        email: emailBersih,
        password: kataSandi,
      });

      if (error || !data.user) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal masuk ke sistem. Periksa email dan kata sandi.'),
        };
      }

      return muatProfilPenggunaDariUserId(data.user.id);
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Terjadi kendala jaringan saat menghubungi layanan autentikasi.'),
      };
    }
  },

  async keluarSistem(): Promise<Hasil<void>> {
    hapusDrafLokalForm();
    bersihkanCacheSesiSupabase();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch {
      // Abaikan bila sessionStorage diblokir peramban
    }

    if (!apakahKonfigurasiSupabaseLengkap()) {
      return { ok: true, data: undefined };
    }

    try {
      const klien = ambilKlienSupabase();
      const { error } = await klien.auth.signOut();
      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal menutup sesi autentikasi.') };
      }
      return { ok: true, data: undefined };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal menutup sesi autentikasi.') };
    }
  },

  langgananSesiAuth(cb: (profil: ProfilPengguna | null) => void): () => void {
    if (!apakahKonfigurasiSupabaseLengkap()) {
      return () => undefined;
    }
    try {
      const klien = ambilKlienSupabase();
      const {
        data: { subscription },
      } = klien.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          bersihkanCacheSesiSupabase();
          cb(null);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          void muatProfilPenggunaDariUserId(session.user.id).then((hasil) => {
            cb(hasil.ok ? hasil.data : null);
          });
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    } catch {
      return () => undefined;
    }
  },

  async ubahKataSandi(kataSandiBaru: string): Promise<Hasil<void>> {
    const sandiBersih = kataSandiBaru.trim();
    if (!sandiBersih || sandiBersih.length < 6) {
      return { ok: false, pesan: 'Kata sandi baru minimal 6 karakter.' };
    }
    if (!apakahKonfigurasiSupabaseLengkap()) {
      return { ok: true, data: undefined };
    }
    try {
      const klien = ambilKlienSupabase();
      const { error } = await klien.auth.updateUser({
        password: sandiBersih,
      });
      if (error) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal memperbarui kata sandi pengguna.'),
        };
      }
      return { ok: true, data: undefined };
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Terjadi gangguan saat memperbarui kata sandi.'),
      };
    }
  },
};

export const wilayahRepository: WilayahRepository = {
  async semuaWilayah(): Promise<Hasil<Wilayah[]>> {
    if (cacheWilayah) {
      return { ok: true, data: cacheWilayah };
    }
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('wilayah')
        .select('id, tipe, nama, parent_id, uptd_id, lat_pusat, lng_pusat')
        .order('nama', { ascending: true })
        .returns<BarisDbWilayah[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat referensi wilayah.') };
      }
      cacheWilayah = (data ?? []).map(petakanWilayah);
      return { ok: true, data: cacheWilayah };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat referensi wilayah.') };
    }
  },

  async daftarKabupaten(): Promise<Hasil<Wilayah[]>> {
    const semua = await wilayahRepository.semuaWilayah();
    if (!semua.ok) return semua;
    return {
      ok: true,
      data: semua.data.filter((w) => w.tipe === 'kabupaten'),
    };
  },

  async daftarKecamatan(kabupatenId?: string): Promise<Hasil<Wilayah[]>> {
    const semua = await wilayahRepository.semuaWilayah();
    if (!semua.ok) return semua;
    return {
      ok: true,
      data: semua.data.filter(
        (w) => w.tipe === 'kecamatan' && (!kabupatenId || w.parentId === kabupatenId)
      ),
    };
  },

  async daftarDesa(kecamatanId?: string): Promise<Hasil<Wilayah[]>> {
    const semua = await wilayahRepository.semuaWilayah();
    if (!semua.ok) return semua;
    return {
      ok: true,
      data: semua.data.filter(
        (w) => w.tipe === 'desa' && (!kecamatanId || w.parentId === kecamatanId)
      ),
    };
  },

  async daftarUptd(): Promise<Hasil<Uptd[]>> {
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('uptd')
        .select('id, nama, kabupaten_id, jumlah_pengamat_aktif')
        .order('nama', { ascending: true })
        .returns<BarisDbUptd[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat daftar UPTD.') };
      }

      return {
        ok: true,
        data: (data ?? []).map((u) => ({
          id: u.id,
          nama: u.nama,
          kabupatenId: u.kabupaten_id ?? '',
          jumlahPengamatAktif: u.jumlah_pengamat_aktif,
        })),
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat daftar UPTD.') };
    }
  },
};

export const komoditasOptRepository: KomoditasOptRepository = {
  async daftarKomoditas(): Promise<Hasil<Komoditas[]>> {
    if (cacheKomoditas) {
      return { ok: true, data: cacheKomoditas };
    }
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('komoditas')
        .select('id, nama, aktif, kode_ikon')
        .eq('aktif', true)
        .order('nama', { ascending: true })
        .returns<BarisDbKomoditas[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat daftar komoditas.') };
      }

      cacheKomoditas = (data ?? []).map((k) => ({
        id: k.id,
        nama: k.nama,
        aktif: k.aktif,
        kodeIkon: k.kode_ikon,
      }));
      return { ok: true, data: cacheKomoditas };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat daftar komoditas.') };
    }
  },

  async daftarOpt(komoditasId?: string): Promise<Hasil<Opt[]>> {
    if (!cacheOpt) {
      try {
        const [klien, komHasil] = await Promise.all([
          Promise.resolve(ambilKlienSupabase()),
          komoditasOptRepository.daftarKomoditas(),
        ]);
        if (!komHasil.ok) return { ok: false, pesan: komHasil.pesan };

        const { data, error } = await klien
          .from('opt')
          .select('id, komoditas_id, nama_lokal, nama_ilmiah, jenis, gejala, rekomendasi')
          .order('nama_lokal', { ascending: true })
          .returns<BarisDbOpt[]>();

        if (error) {
          return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat katalog OPT.') };
        }

        const petaKom = new Map(komHasil.data.map((k) => [k.id, k.nama]));
        cacheOpt = (data ?? []).map((o) => ({
          id: o.id,
          komoditasId: o.komoditas_id,
          namaKomoditas: petaKom.get(o.komoditas_id) ?? '-',
          namaLokal: o.nama_lokal,
          namaIlmiah: o.nama_ilmiah,
          jenis: o.jenis,
          gejala: o.gejala,
          rekomendasi: o.rekomendasi,
        }));
      } catch (err) {
        return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat katalog OPT.') };
      }
    }

    const daftar = komoditasId
      ? cacheOpt.filter((o) => o.komoditasId === komoditasId)
      : cacheOpt;
    return { ok: true, data: daftar };
  },

  async tambahOptSimulasi(input, peminta): Promise<Hasil<Opt>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat menambah katalog OPT.' };
    }
    if (!input.namaLokal.trim() || !input.namaIlmiah.trim()) {
      return { ok: false, pesan: 'Nama lokal dan nama ilmiah OPT wajib diisi.' };
    }

    const komHasil = await komoditasOptRepository.daftarKomoditas();
    if (!komHasil.ok) return { ok: false, pesan: komHasil.pesan };
    const kom = komHasil.data.find((k) => k.id === input.komoditasId);
    if (!kom) {
      return { ok: false, pesan: 'Komoditas tidak ditemukan atau tidak aktif.' };
    }

    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('opt')
        .insert({
          komoditas_id: input.komoditasId,
          nama_lokal: input.namaLokal.trim(),
          nama_ilmiah: input.namaIlmiah.trim(),
          jenis: input.jenis,
          gejala: input.gejala.trim(),
          rekomendasi: input.rekomendasi.trim(),
        })
        .select('id, komoditas_id, nama_lokal, nama_ilmiah, jenis, gejala, rekomendasi')
        .single<BarisDbOpt>();

      if (error || !data) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal menyimpan katalog OPT baru.') };
      }

      cacheOpt = null;
      pelangganLokalOpt.forEach((cb) => cb());

      return {
        ok: true,
        data: {
          id: data.id,
          komoditasId: data.komoditas_id,
          namaKomoditas: kom.nama,
          namaLokal: data.nama_lokal,
          namaIlmiah: data.nama_ilmiah,
          jenis: data.jenis,
          gejala: data.gejala,
          rekomendasi: data.rekomendasi,
        },
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal menyimpan katalog OPT baru.') };
    }
  },

  langganan(cb: () => void): () => void {
    pelangganLokalOpt.add(cb);
    let hapusChannel = () => undefined;
    if (apakahKonfigurasiSupabaseLengkap()) {
      try {
        const klien = ambilKlienSupabase();
        const channel = klien
          .channel(`rt-opt-${Math.random().toString(36).slice(2, 8)}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'opt' }, () => {
            cacheOpt = null;
            cb();
          })
          .subscribe();
        hapusChannel = () => {
          void klien.removeChannel(channel);
        };
      } catch {
        // Abaikan bila WebSocket Realtime belum aktif
      }
    }
    return () => {
      pelangganLokalOpt.delete(cb);
      hapusChannel();
    };
  },
};

export const konfigurasiRepository: KonfigurasiRepository = {
  async ambil(): Promise<Hasil<KonfigurasiSistem>> {
    if (cacheKonfigurasi) {
      return {
        ok: true,
        data: {
          klasifikasi: { ...cacheKonfigurasi.klasifikasi },
          peringatanForm: { ...cacheKonfigurasi.peringatanForm },
        },
      };
    }
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('konfigurasi')
        .select('kunci, nilai')
        .returns<BarisDbKonfigurasi[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat konfigurasi sistem.') };
      }

      const peta = new Map<string, number>();
      for (const row of data ?? []) {
        peta.set(row.kunci, keAngka(row.nilai));
      }

      cacheKonfigurasi = {
        klasifikasi: {
          ambangSedangMin:
            peta.get('ambang_sedang_min') ?? KONFIGURASI_KLASIFIKASI_BAWAAN.ambangSedangMin,
          ambangBeratMin:
            peta.get('ambang_berat_min') ?? KONFIGURASI_KLASIFIKASI_BAWAAN.ambangBeratMin,
        },
        peringatanForm: {
          ambangPeringatan:
            peta.get('ambang_peringatan') ?? KONFIGURASI_PERINGATAN_FORM_BAWAAN.ambangPeringatan,
          ambangEksplosif:
            peta.get('ambang_eksplosif') ?? KONFIGURASI_PERINGATAN_FORM_BAWAAN.ambangEksplosif,
        },
      };

      return {
        ok: true,
        data: {
          klasifikasi: { ...cacheKonfigurasi.klasifikasi },
          peringatanForm: { ...cacheKonfigurasi.peringatanForm },
        },
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat konfigurasi sistem.') };
    }
  },

  async perbarui(konfigurasi, peminta): Promise<Hasil<KonfigurasiSistem>> {
    if (peminta.peran !== 'admin') {
      return {
        ok: false,
        pesan: 'Hanya Admin Provinsi yang dapat memperbarui konfigurasi ambang.',
      };
    }
    const { klasifikasi, peringatanForm } = konfigurasi;
    const angkaValid = (n: unknown): n is number =>
      typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100;

    if (!angkaValid(klasifikasi.ambangSedangMin) || !angkaValid(klasifikasi.ambangBeratMin)) {
      return { ok: false, pesan: 'Ambang klasifikasi harus berupa angka 0–100 yang valid.' };
    }
    if (
      klasifikasi.ambangSedangMin <= 0 ||
      klasifikasi.ambangBeratMin <= klasifikasi.ambangSedangMin
    ) {
      return { ok: false, pesan: 'Ambang Berat harus lebih besar dari Ambang Sedang (> 0).' };
    }
    if (
      !angkaValid(peringatanForm.ambangPeringatan) ||
      !angkaValid(peringatanForm.ambangEksplosif)
    ) {
      return {
        ok: false,
        pesan: 'Ambang peringatan formulir harus berupa angka 0–100 yang valid.',
      };
    }
    if (peringatanForm.ambangEksplosif < peringatanForm.ambangPeringatan) {
      return {
        ok: false,
        pesan: 'Ambang eksplosif formulir tidak boleh lebih kecil dari ambang peringatan.',
      };
    }

    try {
      const klien = ambilKlienSupabase();
      const { error } = await klien.from('konfigurasi').upsert([
        {
          kunci: 'ambang_sedang_min',
          nilai: klasifikasi.ambangSedangMin,
          diperbarui_oleh: peminta.id,
          diperbarui_pada: new Date().toISOString(),
        },
        {
          kunci: 'ambang_berat_min',
          nilai: klasifikasi.ambangBeratMin,
          diperbarui_oleh: peminta.id,
          diperbarui_pada: new Date().toISOString(),
        },
        {
          kunci: 'ambang_peringatan',
          nilai: peringatanForm.ambangPeringatan,
          diperbarui_oleh: peminta.id,
          diperbarui_pada: new Date().toISOString(),
        },
        {
          kunci: 'ambang_eksplosif',
          nilai: peringatanForm.ambangEksplosif,
          diperbarui_oleh: peminta.id,
          diperbarui_pada: new Date().toISOString(),
        },
      ]);

      if (error) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal menyimpan konfigurasi ambang ke basis data.'),
        };
      }

      cacheKonfigurasi = {
        klasifikasi: { ...klasifikasi },
        peringatanForm: { ...peringatanForm },
      };
      pelangganLokalLaporan.forEach((cb) => cb({ jenis: 'ubah' }));

      return {
        ok: true,
        data: {
          klasifikasi: { ...klasifikasi },
          peringatanForm: { ...peringatanForm },
        },
      };
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Gagal menyimpan konfigurasi ambang ke basis data.'),
      };
    }
  },
};

function dataUrlKeBlob(dataUrl: string): { blob: Blob; ekstensi: 'jpg' | 'png'; mime: string } | null {
  const cocok = /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!cocok) return null;
  const mime = cocok[1];
  const b64 = cocok[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  const ekstensi = mime === 'image/png' ? 'png' : 'jpg';
  return { blob: new Blob([bytes], { type: mime }), ekstensi, mime };
}

async function sinkronkanFotoLaporan(
  laporanId: string,
  fotos: FotoInput[]
): Promise<Hasil<void>> {
  const daftarTerbatas = fotos.slice(0, 3);
  if (daftarTerbatas.length === 0) {
    return { ok: true, data: undefined };
  }

  try {
    const klien = ambilKlienSupabase();
    const { data: fotoLama } = await klien
      .from('laporan_foto')
      .select('id, urutan, path_storage')
      .eq('laporan_id', laporanId)
      .returns<Array<{ id: string; urutan: 1 | 2 | 3; path_storage: string }>>();

    const petaLama = new Map((fotoLama ?? []).map((f) => [f.urutan, f.path_storage]));
    const urutanAktif = new Set(daftarTerbatas.map((f) => f.urutan));

    // Hapus slot urutan lama yang tidak lagi dipakai
    const hapusUrutan = (fotoLama ?? []).filter((f) => !urutanAktif.has(f.urutan));
    if (hapusUrutan.length > 0) {
      await klien
        .storage
        .from(BUCKET_FOTO_LAPORAN)
        .remove(hapusUrutan.map((h) => h.path_storage));
      await klien
        .from('laporan_foto')
        .delete()
        .in(
          'id',
          hapusUrutan.map((h) => h.id)
        );
    }

    for (const foto of daftarTerbatas) {
      if (foto.pratinjauUrl.startsWith('data:image/')) {
        const hasilBlob = dataUrlKeBlob(foto.pratinjauUrl);
        if (!hasilBlob) {
          return {
            ok: false,
            pesan: `Format foto slot ${foto.urutan} tidak valid (hanya JPG atau PNG).`,
          };
        }
        if (hasilBlob.blob.size > UKURAN_MAKS_FOTO_BYTES) {
          return {
            ok: false,
            pesan: `Ukuran foto slot ${foto.urutan} melebihi batas maksimal 8 MB.`,
          };
        }

        const pathStorage = `laporan/${laporanId}/${foto.urutan}.${hasilBlob.ekstensi}`;
        const { error: galatUnggah } = await klien.storage
          .from(BUCKET_FOTO_LAPORAN)
          .upload(pathStorage, hasilBlob.blob, {
            contentType: hasilBlob.mime,
            upsert: true,
          });

        if (galatUnggah) {
          return {
            ok: false,
            pesan: terjemahkanGalat(
              galatUnggah,
              `Gagal mengunggah foto dokumentasi slot ${foto.urutan} ke penyimpanan privat.`
            ),
          };
        }

        const { error: galatMeta } = await klien.from('laporan_foto').upsert(
          {
            laporan_id: laporanId,
            nama_berkas: foto.namaBerkas,
            path_storage: pathStorage,
            geotag_lat: foto.geotagLat,
            geotag_lng: foto.geotagLng,
            urutan: foto.urutan,
          },
          { onConflict: 'laporan_id,urutan' }
        );

        if (galatMeta) {
          return {
            ok: false,
            pesan: terjemahkanGalat(galatMeta, 'Gagal mencatat metadata foto geotagging.'),
          };
        }
      } else if (petaLama.has(foto.urutan)) {
        await klien.from('laporan_foto').upsert(
          {
            laporan_id: laporanId,
            nama_berkas: foto.namaBerkas,
            path_storage: petaLama.get(foto.urutan)!,
            geotag_lat: foto.geotagLat,
            geotag_lng: foto.geotagLng,
            urutan: foto.urutan,
          },
          { onConflict: 'laporan_id,urutan' }
        );
      }
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      pesan: terjemahkanGalat(err, 'Gagal menyinkronkan berkas foto dokumentasi laporan.'),
    };
  }
}

async function ambilSemuaLaporanTerpetakan(): Promise<Hasil<Laporan[]>> {
  try {
    const klien = ambilKlienSupabase();
    const [
      { data: barisLaporan, error: galatLaporan },
      wilayahHasil,
      komHasil,
      optHasil,
      konfHasil,
    ] = await Promise.all([
      klien
        .from('laporan')
        .select(
          `
          id, kode, petugas_id, desa_id, nama_blok, lat, lng,
          komoditas_id, opt_id, fase_tanaman, tahun, triwulan, semester,
          luas_amatan, luas_ringan, luas_berat, luas_terkendali,
          intensitas_persen, tingkat, status,
          rekomendasi_kultur, rekomendasi_hayati, rekomendasi_kimiawi,
          catatan_verifikasi, dibuat_pada, diverifikasi_oleh, diverifikasi_pada,
          profiles!laporan_petugas_id_fkey ( nama, nip ),
          laporan_foto ( id, laporan_id, nama_berkas, path_storage, geotag_lat, geotag_lng, urutan )
        `
        )
        .order('dibuat_pada', { ascending: false })
        .returns<BarisDbLaporan[]>(),
      wilayahRepository.semuaWilayah(),
      komoditasOptRepository.daftarKomoditas(),
      komoditasOptRepository.daftarOpt(),
      konfigurasiRepository.ambil(),
    ]);

    if (galatLaporan) {
      return {
        ok: false,
        pesan: terjemahkanGalat(galatLaporan, 'Gagal memuat daftar laporan observasi.'),
      };
    }
    if (!wilayahHasil.ok) return { ok: false, pesan: wilayahHasil.pesan };
    if (!komHasil.ok) return { ok: false, pesan: komHasil.pesan };
    if (!optHasil.ok) return { ok: false, pesan: optHasil.pesan };

    const konfKlasifikasi = konfHasil.ok
      ? konfHasil.data.klasifikasi
      : KONFIGURASI_KLASIFIKASI_BAWAAN;

    const petaWilayah = new Map(wilayahHasil.data.map((w) => [w.id, w]));
    const petaKom = new Map(komHasil.data.map((k) => [k.id, k]));
    const petaOpt = new Map(optHasil.data.map((o) => [o.id, o]));

    // Buat URL bertanda tangan berumur pendek untuk seluruh path_storage foto privat
    const semuaPath = new Set<string>();
    for (const row of barisLaporan ?? []) {
      for (const f of row.laporan_foto ?? []) {
        if (f.path_storage) semuaPath.add(f.path_storage);
      }
    }

    const petaSignedUrl = new Map<string, string>();
    if (semuaPath.size > 0) {
      const { data: daftarSigned } = await klien.storage
        .from(BUCKET_FOTO_LAPORAN)
        .createSignedUrls(Array.from(semuaPath), DURASI_URL_BERTANDA_TANGAN_DETIK);
      for (const item of daftarSigned ?? []) {
        if (item.path && item.signedUrl) {
          petaSignedUrl.set(item.path, item.signedUrl);
        }
      }
    }

    const hasil: Laporan[] = (barisLaporan ?? []).map((row) => {
      const desa = petaWilayah.get(row.desa_id);
      const kecamatan = desa?.parentId ? petaWilayah.get(desa.parentId) : undefined;
      const kabupaten = kecamatan?.parentId ? petaWilayah.get(kecamatan.parentId) : undefined;
      const kom = petaKom.get(row.komoditas_id);
      const opt = petaOpt.get(row.opt_id);

      const relasiProfil = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

      const luasAmatan = keAngka(row.luas_amatan);
      const luasRingan = keAngka(row.luas_ringan);
      const luasBerat = keAngka(row.luas_berat);
      const luasTerkendali = keAngka(row.luas_terkendali);
      const intensitasPersen =
        row.intensitas_persen !== null && row.intensitas_persen !== undefined
          ? keAngka(row.intensitas_persen)
          : hitungIntensitas(luasRingan, luasBerat, luasAmatan);
      const tingkat =
        row.tingkat ?? klasifikasiTingkat(intensitasPersen, konfKlasifikasi);

      const fotos: LaporanFoto[] = [...(row.laporan_foto ?? [])]
        .sort((a, b) => a.urutan - b.urutan)
        .map((f) => ({
          id: f.id,
          laporanId: f.laporan_id,
          namaBerkas: f.nama_berkas,
          pratinjauUrl: petaSignedUrl.get(f.path_storage) ?? '',
          geotagLat: f.geotag_lat,
          geotagLng: f.geotag_lng,
          urutan: f.urutan,
        }));

      return {
        id: row.id,
        kode: row.kode,
        petugasId: row.petugas_id,
        namaPetugas: relasiProfil?.nama ?? 'Petugas POPT',
        nipPetugas: relasiProfil?.nip ?? null,
        desaId: row.desa_id,
        namaDesa: desa?.nama ?? '-',
        kecamatanId: kecamatan?.id ?? '',
        namaKecamatan: kecamatan?.nama ?? '-',
        kabupatenId: kabupaten?.id ?? '',
        namaKabupaten: kabupaten?.nama ?? '-',
        uptdId: kabupaten?.uptdId ?? desa?.uptdId ?? null,
        namaBlok: row.nama_blok,
        lat: row.lat,
        lng: row.lng,
        komoditasId: row.komoditas_id,
        namaKomoditas: kom?.nama ?? '-',
        optId: row.opt_id,
        namaOptLokal: opt?.namaLokal ?? '-',
        namaOptIlmiah: opt?.namaIlmiah ?? '-',
        jenisOpt: opt?.jenis ?? 'hama',
        faseTanaman: row.fase_tanaman,
        tahun: row.tahun,
        triwulan: row.triwulan,
        semester: row.semester,
        luasAmatan,
        luasRingan,
        luasBerat,
        luasTerkendali,
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
    });

    return { ok: true, data: hasil };
  } catch (err) {
    return {
      ok: false,
      pesan: terjemahkanGalat(err, 'Gagal memuat daftar laporan observasi.'),
    };
  }
}

async function validasiInputLaporanKlien(input: LaporanInput): Promise<string | null> {
  const cekLuas = validasiLuas(
    input.luasAmatan,
    input.luasRingan,
    input.luasBerat,
    input.luasTerkendali
  );
  if (!cekLuas.valid) return cekLuas.galat[0] ?? 'Rincian luas laporan tidak valid.';

  if (!validasiPeriode(input.triwulan, input.semester)) {
    return 'Kombinasi Triwulan dan Semester tidak konsisten.';
  }

  const cekKoordinat = validasiKoordinatKaltim(input.lat, input.lng);
  if (!cekKoordinat.valid) {
    return cekKoordinat.pesan ?? 'Koordinat berada di luar wilayah Provinsi Kalimantan Timur.';
  }

  if (!input.namaBlok.trim()) {
    return 'Nama blok kebun atau kelompok tani wajib diisi.';
  }

  if (input.fotos.length > 3) {
    return 'Dokumentasi foto maksimal 3 berkas per laporan.';
  }

  const [wilHasil, optHasil] = await Promise.all([
    wilayahRepository.semuaWilayah(),
    komoditasOptRepository.daftarOpt(input.komoditasId),
  ]);

  if (wilHasil.ok) {
    const desa = wilHasil.data.find((w) => w.id === input.desaId && w.tipe === 'desa');
    if (!desa) return 'Desa/Kelurahan pengamatan tidak valid.';
  }

  if (optHasil.ok) {
    const opt = optHasil.data.find((o) => o.id === input.optId);
    if (!opt) return 'Jenis OPT tidak sesuai dengan komoditas yang dipilih.';
  }

  return null;
}

async function simpanAtauPublikasikanLaporan(
  input: LaporanInput,
  peminta: ProfilPengguna,
  statusTujuan: 'draf' | 'menunggu'
): Promise<Hasil<Laporan>> {
  const galatValidasi = await validasiInputLaporanKlien(input);
  if (galatValidasi) return { ok: false, pesan: galatValidasi };

  try {
    const klien = ambilKlienSupabase();
    let idTarget = input.id;

    if (idTarget) {
      const detailLama = await laporanRepository.detail(idTarget, peminta);
      if (!detailLama.ok) return detailLama;
      const lama = detailLama.data;

      if (peminta.peran === 'petugas' && lama.petugasId !== peminta.id) {
        return {
          ok: false,
          pesan: 'Petugas hanya dapat mengubah laporan miliknya sendiri.',
        };
      }

      const izin = transisiStatusLaporan({
        statusSaatIni: lama.status,
        aksi: statusTujuan === 'draf' ? 'simpan_draf' : 'publikasikan',
      });
      if (!izin.diizinkan) {
        return { ok: false, pesan: izin.pesan ?? 'Perubahan status laporan tidak diizinkan.' };
      }

      const { error } = await klien
        .from('laporan')
        .update({
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
          status: statusTujuan,
          rekomendasi_kultur: input.rekomendasiKultur.trim(),
          rekomendasi_hayati: input.rekomendasiHayati.trim(),
          rekomendasi_kimiawi: input.rekomendasiKimiawi.trim(),
        })
        .eq('id', idTarget);

      if (error) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal memperbarui data laporan observasi.'),
        };
      }
    } else {
      const { data: baru, error } = await klien
        .from('laporan')
        .insert({
          kode: '',
          petugas_id: peminta.id,
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
          status: statusTujuan,
          rekomendasi_kultur: input.rekomendasiKultur.trim(),
          rekomendasi_hayati: input.rekomendasiHayati.trim(),
          rekomendasi_kimiawi: input.rekomendasiKimiawi.trim(),
        })
        .select('id')
        .single<{ id: string }>();

      if (error || !baru) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal menyimpan laporan observasi baru.'),
        };
      }
      idTarget = baru.id;
    }

    const hasilFoto = await sinkronkanFotoLaporan(idTarget, input.fotos);
    if (!hasilFoto.ok) return { ok: false, pesan: hasilFoto.pesan };

    if (statusTujuan === 'menunggu') {
      hapusDrafLokalForm();
    }

    const hasilDetail = await laporanRepository.detail(idTarget, peminta);
    pelangganLokalLaporan.forEach((cb) =>
      cb({ jenis: input.id ? 'ubah' : 'tambah', laporanId: idTarget })
    );
    pelangganLokalNotifikasi.forEach((cb) => cb());
    return hasilDetail;
  } catch (err) {
    return {
      ok: false,
      pesan: terjemahkanGalat(err, 'Gagal menyimpan laporan observasi.'),
    };
  }
}

export const laporanRepository: LaporanRepository = {
  async daftar(
    filter: FilterLaporan,
    halaman?: Halaman,
    peminta?: ProfilPengguna
  ): Promise<Hasil<Laporan[]>> {
    const semua = await ambilSemuaLaporanTerpetakan();
    if (!semua.ok) return semua;

    const tersaring = saringDaftarLaporan(semua.data, filter).map((item) =>
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
    const semua = await ambilSemuaLaporanTerpetakan();
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    const ditemukan = semua.data.find((l) => l.id === id);
    if (!ditemukan) {
      return { ok: false, pesan: 'Data laporan observasi tidak ditemukan atau di luar wewenang wilayah.' };
    }
    return { ok: true, data: samarkanLaporanUntukPeminta(ditemukan, peminta) };
  },

  async simpanDraf(input: LaporanInput, peminta: ProfilPengguna): Promise<Hasil<Laporan>> {
    return simpanAtauPublikasikanLaporan(input, peminta, 'draf');
  },

  async publikasikan(input: LaporanInput, peminta: ProfilPengguna): Promise<Hasil<Laporan>> {
    return simpanAtauPublikasikanLaporan(input, peminta, 'menunggu');
  },

  async ubahLaporanTerverifikasi(
    id: string,
    input: LaporanInput,
    peminta: ProfilPengguna,
    catatanPerubahan: string
  ): Promise<Hasil<Laporan>> {
    if (peminta.peran === 'petugas') {
      return {
        ok: false,
        pesan: 'Petugas tidak memiliki wewenang mengubah laporan yang sudah terverifikasi.',
      };
    }
    if (catatanPerubahan.trim().length < 5) {
      return {
        ok: false,
        pesan: 'Catatan perubahan laporan terverifikasi wajib diisi minimal 5 karakter.',
      };
    }
    const galatValidasi = await validasiInputLaporanKlien(input);
    if (galatValidasi) return { ok: false, pesan: galatValidasi };

    try {
      const klien = ambilKlienSupabase();
      const { error } = await klien
        .from('laporan')
        .update({
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
          rekomendasi_kultur: input.rekomendasiKultur.trim(),
          rekomendasi_hayati: input.rekomendasiHayati.trim(),
          rekomendasi_kimiawi: input.rekomendasiKimiawi.trim(),
          catatan_verifikasi: catatanPerubahan.trim(),
        })
        .eq('id', id);

      if (error) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal menyimpan perubahan laporan terverifikasi.'),
        };
      }

      const hasilFoto = await sinkronkanFotoLaporan(id, input.fotos);
      if (!hasilFoto.ok) return { ok: false, pesan: hasilFoto.pesan };

      const detail = await laporanRepository.detail(id, peminta);
      pelangganLokalLaporan.forEach((cb) => cb({ jenis: 'ubah', laporanId: id }));
      return detail;
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Gagal menyimpan perubahan laporan terverifikasi.'),
      };
    }
  },

  async verifikasi(
    id: string,
    keputusan: 'terverifikasi' | 'ditolak',
    peminta: ProfilPengguna,
    catatan?: string
  ): Promise<Hasil<Laporan>> {
    if (peminta.peran === 'petugas') {
      return { ok: false, pesan: 'Petugas tidak dapat melakukan verifikasi laporan.' };
    }

    const lamaHasil = await laporanRepository.detail(id, peminta);
    if (!lamaHasil.ok) return lamaHasil;

    if (peminta.peran === 'operator' && peminta.wilayahId !== lamaHasil.data.kabupatenId) {
      return {
        ok: false,
        pesan: 'Operator hanya dapat memverifikasi laporan pada kabupaten/kota kerjanya.',
      };
    }

    if (keputusan === 'ditolak' && (!catatan || catatan.trim().length < 5)) {
      return {
        ok: false,
        pesan: 'Penolakan laporan wajib disertai catatan alasan minimal 5 karakter.',
      };
    }

    const izin = transisiStatusLaporan({
      statusSaatIni: lamaHasil.data.status,
      aksi: 'verifikasi',
      keputusan,
    });
    if (!izin.diizinkan) {
      return { ok: false, pesan: izin.pesan ?? 'Tindakan verifikasi tidak diizinkan.' };
    }

    try {
      const klien = ambilKlienSupabase();
      const { error } = await klien
        .from('laporan')
        .update({
          status: keputusan,
          catatan_verifikasi: catatan?.trim() || lamaHasil.data.catatanVerifikasi,
          diverifikasi_oleh: peminta.id,
          diverifikasi_pada: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal memperbarui status verifikasi laporan.'),
        };
      }

      const detail = await laporanRepository.detail(id, peminta);
      pelangganLokalLaporan.forEach((cb) => cb({ jenis: 'verifikasi', laporanId: id }));
      pelangganLokalNotifikasi.forEach((cb) => cb());
      return detail;
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Gagal memperbarui status verifikasi laporan.'),
      };
    }
  },

  async riwayat(laporanId: string): Promise<Hasil<LaporanRiwayat[]>> {
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('laporan_riwayat')
        .select('id, laporan_id, diubah_oleh, diubah_pada, catatan, profiles ( nama )')
        .eq('laporan_id', laporanId)
        .order('diubah_pada', { ascending: false })
        .returns<BarisDbRiwayat[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat riwayat perubahan laporan.') };
      }

      return {
        ok: true,
        data: (data ?? []).map((r) => {
          const rel = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
          return {
            id: r.id,
            laporanId: r.laporan_id,
            diubahOleh: r.diubah_oleh,
            namaPengubah: rel?.nama ?? 'Pejabat Berwenang',
            diubahPada: r.diubah_pada,
            catatan: r.catatan,
          };
        }),
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat riwayat perubahan laporan.') };
    }
  },

  langganan(_filter: FilterLaporan, cb: (e: PerubahanLaporan) => void): () => void {
    pelangganLokalLaporan.add(cb);
    let hapusChannel = () => undefined;

    if (apakahKonfigurasiSupabaseLengkap()) {
      try {
        const klien = ambilKlienSupabase();
        const channel = klien
          .channel(`rt-laporan-${Math.random().toString(36).slice(2, 8)}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'laporan' },
            (payload) => {
              const idRekaman =
                (payload.new as { id?: string } | null)?.id ??
                (payload.old as { id?: string } | null)?.id;
              cb({
                jenis: payload.eventType === 'INSERT' ? 'tambah' : 'ubah',
                laporanId: idRekaman,
              });
            }
          )
          .subscribe();
        hapusChannel = () => {
          void klien.removeChannel(channel);
        };
      } catch {
        // Abaikan bila WebSocket Realtime belum aktif
      }
    }

    return () => {
      pelangganLokalLaporan.delete(cb);
      hapusChannel();
    };
  },
};

export const rekapRepository: RekapRepository = {
  async ringkasan(filter: FilterLaporan): Promise<Hasil<RingkasanRekap>> {
    const semua = await ambilSemuaLaporanTerpetakan();
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    return {
      ok: true,
      data: hitungRingkasanRekapDariLaporan(semua.data, filter),
    };
  },

  async trenBulanan(
    tahun: number,
    filter: FilterLaporan = {}
  ): Promise<Hasil<BarisTrenBulanan[]>> {
    const semua = await ambilSemuaLaporanTerpetakan();
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    return {
      ok: true,
      data: hitungTrenBulananDariLaporan(semua.data, tahun, filter),
    };
  },

  async intensitasPerKomoditas(
    filter: FilterLaporan
  ): Promise<Hasil<BarisIntensitasKomoditas[]>> {
    const [semua, komHasil] = await Promise.all([
      ambilSemuaLaporanTerpetakan(),
      komoditasOptRepository.daftarKomoditas(),
    ]);
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    if (!komHasil.ok) return { ok: false, pesan: komHasil.pesan };
    return {
      ok: true,
      data: hitungIntensitasKomoditasDariLaporan(semua.data, komHasil.data, filter),
    };
  },

  async kerentananWilayah(filter: FilterLaporan): Promise<Hasil<BarisKerentananWilayah[]>> {
    const [semua, wilHasil, konfHasil] = await Promise.all([
      ambilSemuaLaporanTerpetakan(),
      wilayahRepository.semuaWilayah(),
      konfigurasiRepository.ambil(),
    ]);
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    if (!wilHasil.ok) return { ok: false, pesan: wilHasil.pesan };
    const konf = konfHasil.ok ? konfHasil.data.klasifikasi : KONFIGURASI_KLASIFIKASI_BAWAAN;
    return {
      ok: true,
      data: hitungKerentananWilayahDariLaporan(semua.data, wilHasil.data, konf, filter),
    };
  },

  async matriksKabupaten(filter: FilterLaporan): Promise<Hasil<BarisMatriksKabupaten[]>> {
    const [semua, wilHasil] = await Promise.all([
      ambilSemuaLaporanTerpetakan(),
      wilayahRepository.semuaWilayah(),
    ]);
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    if (!wilHasil.ok) return { ok: false, pesan: wilHasil.pesan };
    return {
      ok: true,
      data: hitungMatriksKabupatenDariLaporan(semua.data, wilHasil.data, filter),
    };
  },

  async trenTriwulanKomoditas(
    tahun: number,
    filter: FilterLaporan = {}
  ): Promise<Hasil<BarisTrenTriwulanKomoditas[]>> {
    const [semua, komHasil] = await Promise.all([
      ambilSemuaLaporanTerpetakan(),
      komoditasOptRepository.daftarKomoditas(),
    ]);
    if (!semua.ok) return { ok: false, pesan: semua.pesan };
    if (!komHasil.ok) return { ok: false, pesan: komHasil.pesan };
    return {
      ok: true,
      data: hitungTrenTriwulanKomoditasDariLaporan(semua.data, komHasil.data, tahun, filter),
    };
  },
};

export const logEksporRepository: LogEksporRepository = {
  async daftar(): Promise<Hasil<LogEkspor[]>> {
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('log_ekspor')
        .select(
          'id, user_id, nama_berkas, format, tipe_dokumen, filter_ringkas, filter_json, dibuat_pada, profiles ( nama, peran )'
        )
        .order('dibuat_pada', { ascending: false })
        .limit(100)
        .returns<BarisDbLogEkspor[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat riwayat log ekspor.') };
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => {
          const rel = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          return {
            id: row.id,
            userId: row.user_id,
            namaPengguna: rel?.nama ?? 'Pengguna Terautentikasi',
            peranPengguna: rel?.peran ?? 'petugas',
            namaBerkas: row.nama_berkas,
            format: row.format,
            tipeDokumen: row.tipe_dokumen,
            filterRingkas: row.filter_ringkas,
            filterJson: row.filter_json ?? {},
            dibuatPada: row.dibuat_pada,
          };
        }),
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat riwayat log ekspor.') };
    }
  },

  async catat(entri): Promise<Hasil<LogEkspor>> {
    try {
      const klien = ambilKlienSupabase();
      const { data, error } = await klien
        .from('log_ekspor')
        .insert({
          user_id: entri.userId,
          nama_berkas: entri.namaBerkas,
          format: entri.format,
          tipe_dokumen: entri.tipeDokumen,
          filter_ringkas: entri.filterRingkas,
          filter_json: entri.filterJson,
        })
        .select('id, dibuat_pada')
        .single<{ id: string; dibuat_pada: string }>();

      if (error || !data) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal mencatat riwayat log ekspor.') };
      }

      pelangganLokalLogEkspor.forEach((cb) => cb());
      return {
        ok: true,
        data: {
          ...entri,
          id: data.id,
          dibuatPada: data.dibuat_pada,
        },
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal mencatat riwayat log ekspor.') };
    }
  },

  langganan(cb: () => void): () => void {
    pelangganLokalLogEkspor.add(cb);
    let hapusChannel = () => undefined;
    if (apakahKonfigurasiSupabaseLengkap()) {
      try {
        const klien = ambilKlienSupabase();
        const channel = klien
          .channel(`rt-log-ekspor-${Math.random().toString(36).slice(2, 8)}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'log_ekspor' }, () =>
            cb()
          )
          .subscribe();
        hapusChannel = () => {
          void klien.removeChannel(channel);
        };
      } catch {
        // Abaikan
      }
    }
    return () => {
      pelangganLokalLogEkspor.delete(cb);
      hapusChannel();
    };
  },
};

export const notifikasiRepository: NotifikasiRepository = {
  async daftar(userId?: string): Promise<Hasil<NotifikasiItem[]>> {
    try {
      const klien = ambilKlienSupabase();
      let query = klien
        .from('notifikasi')
        .select('id, user_id, judul, isi, tipe, dibaca, dibuat_pada, laporan_id')
        .order('dibuat_pada', { ascending: false })
        .limit(50);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.returns<BarisDbNotifikasi[]>();
      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat daftar notifikasi.') };
      }

      return {
        ok: true,
        data: (data ?? []).map((n) => ({
          id: n.id,
          userId: n.user_id,
          judul: n.judul,
          isi: n.isi,
          tipe: n.tipe,
          dibaca: n.dibaca,
          dibuatPada: n.dibuat_pada,
          laporanId: n.laporan_id ?? undefined,
        })),
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat daftar notifikasi.') };
    }
  },

  async tandaiDibaca(id: string): Promise<Hasil<void>> {
    try {
      const klien = ambilKlienSupabase();
      const { error } = await klien.from('notifikasi').update({ dibaca: true }).eq('id', id);
      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memperbarui status notifikasi.') };
      }
      pelangganLokalNotifikasi.forEach((cb) => cb());
      return { ok: true, data: undefined };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memperbarui status notifikasi.') };
    }
  },

  async tandaiSemuaDibaca(): Promise<Hasil<void>> {
    try {
      const klien = ambilKlienSupabase();
      const {
        data: { user },
      } = await klien.auth.getUser();
      if (!user) return { ok: true, data: undefined };

      const { error } = await klien
        .from('notifikasi')
        .update({ dibaca: true })
        .eq('user_id', user.id)
        .eq('dibaca', false);

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal menandai seluruh notifikasi.') };
      }
      pelangganLokalNotifikasi.forEach((cb) => cb());
      return { ok: true, data: undefined };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal menandai seluruh notifikasi.') };
    }
  },

  langganan(cb: () => void): () => void {
    pelangganLokalNotifikasi.add(cb);
    let hapusChannel = () => undefined;
    if (apakahKonfigurasiSupabaseLengkap()) {
      try {
        const klien = ambilKlienSupabase();
        const channel = klien
          .channel(`rt-notifikasi-${Math.random().toString(36).slice(2, 8)}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifikasi' }, () => cb())
          .subscribe();
        hapusChannel = () => {
          void klien.removeChannel(channel);
        };
      } catch {
        // Abaikan
      }
    }
    return () => {
      pelangganLokalNotifikasi.delete(cb);
      hapusChannel();
    };
  },
};

export const penggunaRepository: PenggunaRepository = {
  async daftar(peminta?: ProfilPengguna): Promise<Hasil<ProfilPengguna[]>> {
    try {
      const [klien, wilHasil] = await Promise.all([
        Promise.resolve(ambilKlienSupabase()),
        wilayahRepository.semuaWilayah(),
      ]);
      if (!wilHasil.ok) return { ok: false, pesan: wilHasil.pesan };

      const { data, error } = await klien
        .from('profiles')
        .select('id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif')
        .order('nama', { ascending: true })
        .returns<BarisDbProfil[]>();

      if (error) {
        return { ok: false, pesan: terjemahkanGalat(error, 'Gagal memuat daftar profil pengguna.') };
      }

      const semua = (data ?? []).map((row) => petakanProfil(row, wilHasil.data));
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
        return {
          ok: true,
          data: semua
            .filter((p) => p.id === peminta.id || p.wilayahId === peminta.wilayahId)
            .map((p) => ({
              ...p,
              nip: p.nip ? tampilkanNipSesuaiPeran(p.nip, p.id, p.wilayahId, peminta) : null,
            })),
        };
      }
      return {
        ok: true,
        data: semua.filter((p) => p.id === peminta.id),
      };
    } catch (err) {
      return { ok: false, pesan: terjemahkanGalat(err, 'Gagal memuat daftar profil pengguna.') };
    }
  },

  async tambahSimulasi(input, peminta): Promise<Hasil<ProfilPengguna>> {
    if (peminta.peran !== 'admin') {
      return {
        ok: false,
        pesan: 'Hanya Admin Provinsi yang dapat mengundang akun pengguna baru.',
      };
    }
    const email = (input.email ?? '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        ok: false,
        pesan: 'Alamat email dinas wajib diisi dengan format yang valid untuk undangan akun.',
      };
    }
    if (!input.nama.trim()) {
      return { ok: false, pesan: 'Nama lengkap pengguna wajib diisi.' };
    }
    if (input.peran === 'petugas' && !input.wilayahId) {
      return {
        ok: false,
        pesan: 'Wilayah kerja Kabupaten/Kota wajib dipilih untuk Petugas Lapangan.',
      };
    }

    try {
      const [klien, wilHasil] = await Promise.all([
        Promise.resolve(ambilKlienSupabase()),
        wilayahRepository.semuaWilayah(),
      ]);

      const kataSandi = (input.kataSandi ?? '').trim() || 'Perlindungan.1!';
      const idWilayahFinal = input.peran === 'admin' || !input.wilayahId ? null : input.wilayahId;
      const daftarWilayah = wilHasil.ok ? wilHasil.data : [];

      // METODE 1: Jalankan RPC admin_tambah_pengguna (Langsung ke DB, bypass pembatasan email/rate limit)
      try {
        const { data: rawRpcData, error: rpcErr } = await klien.rpc('admin_tambah_pengguna', {
          p_email: email,
          p_kata_sandi: kataSandi,
          p_nama: input.nama.trim(),
          p_nip: input.nip.trim() || null,
          p_jabatan: input.jabatan.trim() || '',
          p_peran: input.peran,
          p_wilayah_id: idWilayahFinal,
          p_wkpp: input.wkpp.trim() || '',
        });
        const rpcRes = rawRpcData as {
          ok: boolean;
          pesan?: string;
          data?: BarisDbProfil;
        } | null;

        if (!rpcErr && rpcRes) {
          if (!rpcRes.ok || !rpcRes.data) {
            return {
              ok: false,
              pesan: rpcRes.pesan ?? 'Gagal menyimpan akun pengguna.',
            };
          }
          pelangganLokalPengguna.forEach((cb) => cb());
          return { ok: true, data: petakanProfil(rpcRes.data, daftarWilayah) };
        }
      } catch {
        // Lanjutkan ke fallback jika RPC gagal atau belum terpasang
      }

      // METODE 2 (Fallback): Menggunakan Supabase Auth client jika RPC belum dipasang di database
      const url = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
      const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

      let userId: string | null = null;

      if (url && anonKey) {
        try {
          const klienDaftar = createClient(url, anonKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          });

          const { data: authData, error: authGalat } = await klienDaftar.auth.signUp({
            email,
            password: kataSandi,
            options: {
              data: {
                nama: input.nama.trim(),
                nip: input.nip.trim() || null,
              },
            },
          });

          if (!authGalat && authData?.user?.id) {
            userId = authData.user.id;
          } else if (authGalat) {
            const pesanGalatAuth = authGalat.message || '';
            return {
              ok: false,
              pesan: `Gagal mendaftarkan akun autentikasi: ${pesanGalatAuth}. Silakan jalankan skrip SQL "supabase/AKTIFKAN_MANAJEMEN_PENGGUNA_LANGSUNG.sql" di Supabase SQL Editor agar Admin dapat mendaftarkan akun secara langsung tanpa pembatasan email.`,
            };
          }
        } catch (errAuth) {
          return {
            ok: false,
            pesan: terjemahkanGalat(errAuth, 'Gagal menghubungkan pendaftaran autentikasi.'),
          };
        }
      }

      if (!userId) {
        return {
          ok: false,
          pesan: 'ID akun autentikasi tidak ditemukan. Silakan jalankan skrip SQL "supabase/AKTIFKAN_MANAJEMEN_PENGGUNA_LANGSUNG.sql" di Supabase SQL Editor.',
        };
      }

      // 2. Simpan profil lengkap ke tabel public.profiles dengan hak Admin
      const barisInput = {
        id: userId,
        nama: input.nama.trim(),
        nip: input.nip.trim() || null,
        jabatan: input.jabatan.trim() || (input.peran === 'petugas' ? 'Petugas Lapangan' : 'Operator UPTD'),
        peran: input.peran,
        wilayah_id: idWilayahFinal,
        wkpp: input.wkpp.trim() || 'Wilayah Kerja',
        aktif: true,
      };

      const { data: barisProfilBaru, error: galatProfil } = await klien
        .from('profiles')
        .upsert(barisInput, { onConflict: 'id' })
        .select()
        .single<BarisDbProfil>();

      if (galatProfil) {
        return {
          ok: false,
          pesan: terjemahkanGalat(
            galatProfil,
            'Gagal menyimpan profil pengguna ke tabel profiles basis data.'
          ),
        };
      }

      pelangganLokalPengguna.forEach((cb) => cb());
      return { ok: true, data: petakanProfil(barisProfilBaru, daftarWilayah) };
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Gagal menyimpan data akun pengguna.'),
      };
    }
  },

  async ubahStatusAktif(id, aktif, peminta): Promise<Hasil<ProfilPengguna>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang dapat mengubah status pengguna.' };
    }
    try {
      const [klien, wilHasil] = await Promise.all([
        Promise.resolve(ambilKlienSupabase()),
        wilayahRepository.semuaWilayah(),
      ]);

      const { data, error } = await klien
        .from('profiles')
        .update({ aktif })
        .eq('id', id)
        .select('id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif')
        .single<BarisDbProfil>();

      if (error || !data) {
        return {
          ok: false,
          pesan: terjemahkanGalat(error, 'Gagal memperbarui status aktif pengguna.'),
        };
      }

      pelangganLokalPengguna.forEach((cb) => cb());
      return {
        ok: true,
        data: petakanProfil(data, wilHasil.ok ? wilHasil.data : []),
      };
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Gagal memperbarui status aktif pengguna.'),
      };
    }
  },

  async hapus(id: string, peminta: ProfilPengguna): Promise<Hasil<void>> {
    if (peminta.peran !== 'admin') {
      return { ok: false, pesan: 'Hanya Admin Provinsi yang berwenang menghapus pengguna.' };
    }
    if (id === peminta.id) {
      return { ok: false, pesan: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.' };
    }

    try {
      const klien = ambilKlienSupabase();

      // METODE 1: Coba panggil RPC admin_hapus_pengguna terlebih dahulu
      try {
        const { data: rawRpcHapus, error: rpcErr } = await klien.rpc('admin_hapus_pengguna', {
          p_target_id: id,
        });
        const rpcRes = rawRpcHapus as {
          ok: boolean;
          pesan?: string;
        } | null;

        if (!rpcErr && rpcRes) {
          if (!rpcRes.ok) {
            return { ok: false, pesan: rpcRes.pesan ?? 'Gagal menghapus pengguna.' };
          }
          pelangganLokalPengguna.forEach((cb) => cb());
          return { ok: true, data: undefined };
        }
      } catch {
        // Lanjutkan ke fallback
      }

      // METODE 2 (Fallback): Periksa riwayat laporan dan hapus dari tabel profiles
      const { count, error: galatHitung } = await klien
        .from('laporan')
        .select('id', { count: 'exact', head: true })
        .eq('petugas_id', id);

      if (!galatHitung && typeof count === 'number' && count > 0) {
        return {
          ok: false,
          pesan: `Akun ini telah mencatat ${count} laporan serangan OPT. Demi integritas audit riwayat dinas, akun tidak dapat dihapus permanen. Silakan gunakan tombol Nonaktifkan.`,
        };
      }

      const { error: galatHapus } = await klien
        .from('profiles')
        .delete()
        .eq('id', id);

      if (galatHapus) {
        return {
          ok: false,
          pesan: terjemahkanGalat(
            galatHapus,
            'Gagal menghapus profil pengguna. Pastikan kebijakan penghapusan akun diizinkan pada Supabase.'
          ),
        };
      }

      pelangganLokalPengguna.forEach((cb) => cb());
      return { ok: true, data: undefined };
    } catch (err) {
      return {
        ok: false,
        pesan: terjemahkanGalat(err, 'Terjadi kesalahan saat menghapus pengguna.'),
      };
    }
  },

  langganan(cb: () => void): () => void {
    pelangganLokalPengguna.add(cb);
    let hapusChannel = () => undefined;
    if (apakahKonfigurasiSupabaseLengkap()) {
      try {
        const klien = ambilKlienSupabase();
        const channel = klien
          .channel(`rt-profiles-${Math.random().toString(36).slice(2, 8)}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => cb())
          .subscribe();
        hapusChannel = () => {
          void klien.removeChannel(channel);
        };
      } catch {
        // Abaikan
      }
    }
    return () => {
      pelangganLokalPengguna.delete(cb);
      hapusChannel();
    };
  },
};

export const eksporService: EksporService = {
  async eksporObservasiExcel(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string,
    tipe: 'observasi' | 'geodata' = 'observasi'
  ): Promise<Hasil<LogEkspor>> {
    try {
      const [{ unduhExcelLaporan }, daftarHasil] = await Promise.all([
        import('../lib/ekspor'),
        laporanRepository.daftar(filter, undefined, peminta),
      ]);
      if (!daftarHasil.ok) return { ok: false, pesan: daftarHasil.pesan };
      const namaBerkas = unduhExcelLaporan(daftarHasil.data, peminta, filterRingkas, tipe);
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
      return { ok: false, pesan: 'Gagal membuat berkas ekspor Excel observasi.' };
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
      return { ok: false, pesan: 'Gagal membuat berkas Excel rekapitulasi.' };
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
      return { ok: false, pesan: 'Gagal membuat berkas PDF Berita Acara.' };
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
      return { ok: false, pesan: 'Gagal membuat berkas PDF rekap spasial.' };
    }
  },
};
