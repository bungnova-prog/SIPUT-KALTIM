import { describe, expect, it } from 'vitest';
import {
  hitungMatriksKabupatenDariLaporan,
  hitungRingkasanRekapDariLaporan,
  saringDaftarLaporan,
} from '../../lib/agregasiRekap';
import {
  authService,
  konfigurasiRepository,
  penggunaRepository,
} from '../supabaseRepositories';
import type { Laporan, ProfilPengguna, Wilayah } from '../../types/domain';

const profilAdmin: ProfilPengguna = {
  id: '00000000-0000-4000-8000-000000000001',
  nama: 'Admin Provinsi',
  nip: '198001012005011001',
  jabatan: 'Koordinator Proteksi',
  peran: 'admin',
  wilayahId: null,
  namaWilayah: 'Provinsi Kalimantan Timur',
  wkpp: 'Provinsi Kalimantan Timur',
  aktif: true,
};

const profilPetugas: ProfilPengguna = {
  id: '00000000-0000-4000-8000-000000000002',
  nama: 'Petugas POPT',
  nip: '199001012015011002',
  jabatan: 'POPT Ahli Pertama',
  peran: 'petugas',
  wilayahId: 'kab-1',
  namaWilayah: 'Kab. Kutai Kartanegara',
  wkpp: 'WKPP Loa Janan',
  aktif: true,
};

const wilayahContoh: Wilayah[] = [
  { id: 'kab-1', tipe: 'kabupaten', nama: 'Kab. Kutai Kartanegara', parentId: null, uptdId: 'uptd-1' },
  { id: 'kec-1', tipe: 'kecamatan', nama: 'Loa Janan', parentId: 'kab-1', uptdId: 'uptd-1' },
  { id: 'desa-1', tipe: 'desa', nama: 'Batuah', parentId: 'kec-1', uptdId: 'uptd-1' },
];

const laporanContoh: Laporan[] = [
  {
    id: 'lap-1',
    kode: 'KUKA-2026-0100',
    petugasId: profilPetugas.id,
    namaPetugas: profilPetugas.nama,
    nipPetugas: profilPetugas.nip,
    desaId: 'desa-1',
    namaDesa: 'Batuah',
    kecamatanId: 'kec-1',
    namaKecamatan: 'Loa Janan',
    kabupatenId: 'kab-1',
    namaKabupaten: 'Kab. Kutai Kartanegara',
    uptdId: 'uptd-1',
    namaBlok: 'Blok A',
    lat: -0.7124,
    lng: 117.0411,
    komoditasId: 'kom-1',
    namaKomoditas: 'Lada',
    optId: 'opt-1',
    namaOptLokal: 'Busuk Pangkal Batang Lada',
    namaOptIlmiah: 'Phytophthora capsici',
    jenisOpt: 'penyakit',
    faseTanaman: 'tm',
    tahun: 2026,
    triwulan: 4,
    semester: 2,
    luasAmatan: 20,
    luasRingan: 4,
    luasBerat: 8,
    luasTerkendali: 3,
    intensitasPersen: 60,
    tingkat: 'berat',
    status: 'terverifikasi',
    rekomendasiKultur: 'Sanitasi drainase',
    rekomendasiHayati: 'Trichoderma sp.',
    rekomendasiKimiawi: 'Eradikasi selektif',
    catatanVerifikasi: null,
    dibuatPada: '2026-11-05T06:00:00Z',
    diverifikasiOleh: profilAdmin.id,
    diverifikasiPada: '2026-11-05T08:00:00Z',
    fotos: [],
  },
];

describe('kontrak Fase 2 supabaseRepositories & agregasiRekap', () => {
  it('menolak konfigurasi ambang oleh non-admin atau nilai terbalik sebelum memanggil jaringan', async () => {
    const tolakPeran = await konfigurasiRepository.perbarui(
      {
        klasifikasi: { ambangSedangMin: 25, ambangBeratMin: 50 },
        peringatanForm: { ambangPeringatan: 15, ambangEksplosif: 30 },
      },
      profilPetugas
    );
    expect(tolakPeran.ok).toBe(false);

    const tolakAmbang = await konfigurasiRepository.perbarui(
      {
        klasifikasi: { ambangSedangMin: 60, ambangBeratMin: 40 },
        peringatanForm: { ambangPeringatan: 15, ambangEksplosif: 30 },
      },
      profilAdmin
    );
    expect(tolakAmbang.ok).toBe(false);
  });

  it('memvalidasi peran Admin dan format email sebelum memanggil Edge Function undang-pengguna', async () => {
    const bukanAdmin = await penggunaRepository.tambahSimulasi(
      {
        email: 'petugas@disbun.kaltimprov.go.id',
        nama: 'Budi',
        nip: '',
        jabatan: 'POPT',
        peran: 'petugas',
        wilayahId: 'kab-1',
        wkpp: 'Loa Janan',
      },
      profilPetugas
    );
    expect(bukanAdmin.ok).toBe(false);

    const emailKosong = await penggunaRepository.tambahSimulasi(
      {
        email: 'bukan-email',
        nama: 'Budi',
        nip: '',
        jabatan: 'POPT',
        peran: 'petugas',
        wilayahId: 'kab-1',
        wkpp: 'Loa Janan',
      },
      profilAdmin
    );
    expect(emailKosong.ok).toBe(false);
  });

  it('menghitung agregasi ringkasan dan matriks kabupaten secara konsisten dari satu sumber', () => {
    const tersaring = saringDaftarLaporan(laporanContoh, { tahun: 2026, triwulan: 4 });
    expect(tersaring).toHaveLength(1);

    const ringkasan = hitungRingkasanRekapDariLaporan(laporanContoh, {
      tahun: 2026,
      triwulan: 4,
    });
    expect(ringkasan.totalLuasTerdampak).toBe(12);
    expect(ringkasan.jumlahTitikKritis).toBe(1);

    const matriks = hitungMatriksKabupatenDariLaporan(laporanContoh, wilayahContoh, {
      tahun: 2026,
      triwulan: 4,
    });
    expect(matriks[0]?.totalSerangan).toBe(12);
    expect(matriks[0]?.komoditasUtama).toBe('Lada');
  });

  it('menangani keluarSistem dengan aman meskipun lingkungan tanpa sesi aktif', async () => {
    const hasil = await authService.keluarSistem();
    expect(hasil.ok).toBe(true);
  });
});
