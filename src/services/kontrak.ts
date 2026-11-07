import type {
  BarisIntensitasKomoditas,
  BarisKerentananWilayah,
  BarisMatriksKabupaten,
  BarisTrenBulanan,
  BarisTrenTriwulanKomoditas,
  FilterLaporan,
  Halaman,
  Hasil,
  JenisOpt,
  Komoditas,
  KonfigurasiSistem,
  Laporan,
  LaporanInput,
  LaporanRiwayat,
  LogEkspor,
  NotifikasiItem,
  Opt,
  Peran,
  PerubahanLaporan,
  ProfilPengguna,
  RingkasanRekap,
  Uptd,
  Wilayah,
} from '../types/domain';

/**
 * Kontrak Repository Lapisan Data (SCHEMA.md §9).
 * Seluruh komponen UI wajib memanggil antarmuka ini dan dilarang mengimpor mocks/ secara langsung.
 * Saat Fase 2 disetujui pengguna, implementasi diganti ke Supabase tanpa mengubah komponen UI.
 */

export interface LaporanRepository {
  daftar(
    filter: FilterLaporan,
    halaman?: Halaman,
    peminta?: ProfilPengguna
  ): Promise<Hasil<Laporan[]>>;
  detail(id: string, peminta?: ProfilPengguna): Promise<Hasil<Laporan>>;
  simpanDraf(input: LaporanInput, peminta: ProfilPengguna): Promise<Hasil<Laporan>>;
  publikasikan(input: LaporanInput, peminta: ProfilPengguna): Promise<Hasil<Laporan>>;
  ubahLaporanTerverifikasi(
    id: string,
    input: LaporanInput,
    peminta: ProfilPengguna,
    catatanPerubahan: string
  ): Promise<Hasil<Laporan>>;
  verifikasi(
    id: string,
    keputusan: 'terverifikasi' | 'ditolak',
    peminta: ProfilPengguna,
    catatan?: string
  ): Promise<Hasil<Laporan>>;
  riwayat(laporanId: string): Promise<Hasil<LaporanRiwayat[]>>;
  langganan(filter: FilterLaporan, cb: (e: PerubahanLaporan) => void): () => void;
}

export interface WilayahRepository {
  daftarKabupaten(): Promise<Hasil<Wilayah[]>>;
  daftarKecamatan(kabupatenId?: string): Promise<Hasil<Wilayah[]>>;
  daftarDesa(kecamatanId?: string): Promise<Hasil<Wilayah[]>>;
  semuaWilayah(): Promise<Hasil<Wilayah[]>>;
  daftarUptd(): Promise<Hasil<Uptd[]>>;
}

export interface KomoditasOptRepository {
  daftarKomoditas(): Promise<Hasil<Komoditas[]>>;
  daftarOpt(komoditasId?: string): Promise<Hasil<Opt[]>>;
  tambahOptSimulasi(
    input: {
      komoditasId: string;
      namaLokal: string;
      namaIlmiah: string;
      jenis: JenisOpt;
      gejala: string;
      rekomendasi: string;
    },
    peminta: ProfilPengguna
  ): Promise<Hasil<Opt>>;
  langganan(cb: () => void): () => void;
}

export interface RekapRepository {
  ringkasan(filter: FilterLaporan): Promise<Hasil<RingkasanRekap>>;
  trenBulanan(tahun: number, filter?: FilterLaporan): Promise<Hasil<BarisTrenBulanan[]>>;
  intensitasPerKomoditas(filter: FilterLaporan): Promise<Hasil<BarisIntensitasKomoditas[]>>;
  kerentananWilayah(filter: FilterLaporan): Promise<Hasil<BarisKerentananWilayah[]>>;
  matriksKabupaten(filter: FilterLaporan): Promise<Hasil<BarisMatriksKabupaten[]>>;
  trenTriwulanKomoditas(
    tahun: number,
    filter?: FilterLaporan
  ): Promise<Hasil<BarisTrenTriwulanKomoditas[]>>;
}

export interface LogEksporRepository {
  daftar(): Promise<Hasil<LogEkspor[]>>;
  catat(entri: Omit<LogEkspor, 'id' | 'dibuatPada'>): Promise<Hasil<LogEkspor>>;
  langganan(cb: () => void): () => void;
}

export interface NotifikasiRepository {
  daftar(userId?: string): Promise<Hasil<NotifikasiItem[]>>;
  tandaiDibaca(id: string): Promise<Hasil<void>>;
  tandaiSemuaDibaca(): Promise<Hasil<void>>;
  langganan(cb: () => void): () => void;
}

export interface AuthService {
  statusKonfigurasi(): { lengkap: boolean };
  pulihkanSesiAktif(): Promise<Hasil<ProfilPengguna | null>>;
  masukDenganEmailSandi(email: string, kataSandi: string): Promise<Hasil<ProfilPengguna>>;
  masukSebagaiSimulasi?(peran?: Peran): Promise<Hasil<ProfilPengguna>>;
  keluarSistem(): Promise<Hasil<void>>;
  langgananSesiAuth(cb: (profil: ProfilPengguna | null) => void): () => void;
}

export interface PenggunaRepository {
  daftar(peminta?: ProfilPengguna): Promise<Hasil<ProfilPengguna[]>>;
  tambahSimulasi(
    input: {
      email?: string;
      nama: string;
      nip: string;
      jabatan: string;
      peran: Peran;
      wilayahId: string | null;
      wkpp: string;
    },
    peminta: ProfilPengguna
  ): Promise<Hasil<ProfilPengguna>>;
  ubahStatusAktif(
    id: string,
    aktif: boolean,
    peminta: ProfilPengguna
  ): Promise<Hasil<ProfilPengguna>>;
  langganan(cb: () => void): () => void;
}

export interface KonfigurasiRepository {
  ambil(): Promise<Hasil<KonfigurasiSistem>>;
  perbarui(konfigurasi: KonfigurasiSistem, peminta: ProfilPengguna): Promise<Hasil<KonfigurasiSistem>>;
}

export interface EksporService {
  eksporObservasiExcel(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string,
    tipe?: 'observasi' | 'geodata'
  ): Promise<Hasil<LogEkspor>>;
  eksporRekapExcel(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string
  ): Promise<Hasil<LogEkspor>>;
  eksporBeritaAcaraPdf(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string,
    judulDokumen?: string
  ): Promise<Hasil<LogEkspor>>;
  eksporPetaSpasialPdf(
    filter: FilterLaporan,
    peminta: ProfilPengguna,
    filterRingkas: string
  ): Promise<Hasil<LogEkspor>>;
}
