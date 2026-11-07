export type Peran = 'admin' | 'operator' | 'petugas';
export type TipeWilayah = 'kabupaten' | 'kecamatan' | 'desa';
export type JenisOpt = 'hama' | 'penyakit';
export type TingkatSerangan = 'ringan' | 'sedang' | 'berat';
export type StatusLaporan = 'draf' | 'menunggu' | 'terverifikasi' | 'ditolak';
export type FaseTanaman = 'tbm' | 'tm' | 'ttm_tr';
export type TipeNotifikasi =
  | 'laporan_baru'
  | 'peringatan_eksplosif'
  | 'menunggu_validasi'
  | 'info';

export type Hasil<T> =
  | { ok: true; data: T; total?: number }
  | { ok: false; pesan: string };

export interface Halaman {
  nomor: number;
  ukuran: number;
}

export interface KonfigurasiKlasifikasi {
  ambangSedangMin: number;
  ambangBeratMin: number;
}

export interface KonfigurasiPeringatanForm {
  ambangPeringatan: number;
  ambangEksplosif: number;
}

export interface KonfigurasiSistem {
  klasifikasi: KonfigurasiKlasifikasi;
  peringatanForm: KonfigurasiPeringatanForm;
}

export interface ProfilPengguna {
  id: string;
  nama: string;
  nip: string | null;
  jabatan: string;
  peran: Peran;
  wilayahId: string | null;
  namaWilayah: string;
  wkpp: string;
  aktif: boolean;
}

export interface Wilayah {
  id: string;
  tipe: TipeWilayah;
  nama: string;
  parentId: string | null;
  uptdId: string | null;
  latPusat?: number;
  lngPusat?: number;
}

export interface Uptd {
  id: string;
  nama: string;
  kabupatenId: string;
  jumlahPengamatAktif: number;
}

export interface Komoditas {
  id: string;
  nama: string;
  aktif: boolean;
  kodeIkon:
    | 'lada'
    | 'sawit'
    | 'kakao'
    | 'karet'
    | 'aren'
    | 'kelapa_dalam'
    | 'kopi';
}

export interface Opt {
  id: string;
  komoditasId: string;
  namaKomoditas: string;
  namaLokal: string;
  namaIlmiah: string;
  jenis: JenisOpt;
  gejala: string;
  rekomendasi: string;
}

export interface LaporanFoto {
  id: string;
  laporanId: string;
  namaBerkas: string;
  pratinjauUrl: string;
  geotagLat: number;
  geotagLng: number;
  urutan: 1 | 2 | 3;
}

export interface Laporan {
  id: string;
  kode: string;
  petugasId: string;
  namaPetugas: string;
  nipPetugas: string | null;
  desaId: string;
  namaDesa: string;
  kecamatanId: string;
  namaKecamatan: string;
  kabupatenId: string;
  namaKabupaten: string;
  uptdId: string | null;
  namaBlok: string;
  lat: number;
  lng: number;
  komoditasId: string;
  namaKomoditas: string;
  optId: string;
  namaOptLokal: string;
  namaOptIlmiah: string;
  jenisOpt: JenisOpt;
  faseTanaman: FaseTanaman;
  tahun: number;
  triwulan: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  luasAmatan: number;
  luasRingan: number;
  luasBerat: number;
  luasTerkendali: number;
  intensitasPersen: number;
  tingkat: TingkatSerangan;
  status: StatusLaporan;
  rekomendasiKultur: string;
  rekomendasiHayati: string;
  rekomendasiKimiawi: string;
  catatanVerifikasi: string | null;
  dibuatPada: string;
  diverifikasiOleh: string | null;
  diverifikasiPada: string | null;
  fotos: LaporanFoto[];
}

export interface FotoInput {
  namaBerkas: string;
  pratinjauUrl: string;
  geotagLat: number;
  geotagLng: number;
  urutan: 1 | 2 | 3;
}

export interface LaporanInput {
  id?: string;
  petugasId: string;
  desaId: string;
  namaBlok: string;
  lat: number;
  lng: number;
  komoditasId: string;
  optId: string;
  faseTanaman: FaseTanaman;
  tahun: number;
  triwulan: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  luasAmatan: number;
  luasRingan: number;
  luasBerat: number;
  luasTerkendali: number;
  rekomendasiKultur: string;
  rekomendasiHayati: string;
  rekomendasiKimiawi: string;
  fotos: FotoInput[];
}

export interface FilterLaporan {
  modePeriode?: 'realtime' | 'triwulan' | 'semester' | 'tahunan';
  tahun?: number;
  triwulan?: 1 | 2 | 3 | 4;
  semester?: 1 | 2;
  kabupatenId?: string;
  kecamatanId?: string;
  desaId?: string;
  uptdId?: string;
  komoditasIds?: string[];
  tingkatList?: TingkatSerangan[];
  statusList?: StatusLaporan[];
  kataKunci?: string;
}

export interface PerubahanLaporan {
  jenis: 'tambah' | 'ubah' | 'verifikasi' | 'reset';
  laporanId?: string;
}

export interface LogEkspor {
  id: string;
  userId: string;
  namaPengguna: string;
  peranPengguna: Peran;
  namaBerkas: string;
  format: 'xlsx' | 'pdf';
  tipeDokumen: 'rekap' | 'geodata' | 'berita_acara' | 'observasi';
  filterRingkas: string;
  filterJson: FilterLaporan;
  dibuatPada: string;
}

export interface NotifikasiItem {
  id: string;
  userId: string;
  judul: string;
  isi: string;
  tipe: TipeNotifikasi;
  dibaca: boolean;
  dibuatPada: string;
  laporanId?: string;
}

export interface LaporanRiwayat {
  id: string;
  laporanId: string;
  diubahOleh: string;
  namaPengubah: string;
  diubahPada: string;
  catatan: string;
}

export interface RingkasanRekap {
  totalLaporan: number;
  laporanMenunggu: number;
  laporanTerverifikasi: number;
  laporanDitolak: number;
  totalLuasAmatan: number;
  totalLuasTerdampak: number;
  totalLuasBerat: number;
  totalLuasRinganSedang: number;
  totalLuasTerkendali: number;
  jumlahTitikKritis: number;
  jumlahTitikWaspada: number;
  jumlahTitikRingan: number;
  jumlahKabupatenTerdampak: number;
  komoditasUtama: string;
  optDominan: string;
}

export interface BarisTrenBulanan {
  bulan: string;
  indeksBulan: number;
  luasTotal: number;
  luasBerat: number;
  aktif: boolean;
}

export interface BarisIntensitasKomoditas {
  komoditasId: string;
  namaKomoditas: string;
  luasRinganSedang: number;
  luasBerat: number;
  luasTotal: number;
  optUtama: string;
}

export interface BarisKerentananWilayah {
  kabupatenId: string;
  namaKabupaten: string;
  kecamatanTerparah: string;
  komoditasUtama: string;
  namaOptLokal: string;
  namaOptIlmiah: string;
  luasSerangan: number;
  luasBerat: number;
  intensitasRata: number;
  tingkatAncaman: TingkatSerangan;
  tindakanLapangan: string;
}

export interface BarisMatriksKabupaten {
  no: number;
  kabupatenId: string;
  namaKabupaten: string;
  daftarKecamatan: string;
  komoditasUtama: string;
  optDominanLokal: string;
  optDominanIlmiah: string;
  luasAmatan: number;
  luasRingan: number;
  persenRingan: number;
  luasBerat: number;
  persenBerat: number;
  totalSerangan: number;
  luasTerkendali: number;
}

export interface BarisTrenTriwulanKomoditas {
  triwulanLabel: string;
  [namaKomoditas: string]: string | number;
}
