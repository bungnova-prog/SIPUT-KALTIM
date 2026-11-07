import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ambilProfilDefaultPeran,
  bersihkanSesiSimulasi,
  komoditasOptRepository,
  konfigurasiRepository,
  laporanRepository,
  muatDrafLokalForm,
  penggunaRepository,
  rekapRepository,
} from '../mockRepositories';
import type { LaporanInput, ProfilPengguna } from '../../types/domain';

function profil(peran: 'admin' | 'operator' | 'petugas'): ProfilPengguna {
  return ambilProfilDefaultPeran(peran);
}

function inputDariLaporan(id: string): Promise<LaporanInput> {
  return laporanRepository.detail(id).then((hasil) => {
    if (!hasil.ok) throw new Error(hasil.pesan);
    const l = hasil.data;
    return {
      id: l.id,
      petugasId: l.petugasId,
      desaId: l.desaId,
      namaBlok: l.namaBlok,
      lat: l.lat,
      lng: l.lng,
      komoditasId: l.komoditasId,
      optId: l.optId,
      faseTanaman: l.faseTanaman,
      tahun: l.tahun,
      triwulan: l.triwulan,
      semester: l.semester,
      luasAmatan: l.luasAmatan,
      luasRingan: l.luasRingan,
      luasBerat: l.luasBerat,
      luasTerkendali: l.luasTerkendali,
      rekomendasiKultur: l.rekomendasiKultur,
      rekomendasiHayati: l.rekomendasiHayati,
      rekomendasiKimiawi: l.rekomendasiKimiawi,
      fotos: [],
    };
  });
}

beforeEach(() => {
  bersihkanSesiSimulasi();
});

describe('perbaikan repository laporan simulasi', () => {
  it('menolak mengembalikan laporan terverifikasi menjadi draf', async () => {
    const input = await inputDariLaporan('lap-002');
    const hasil = await laporanRepository.simpanDraf(input, profil('operator'));
    expect(hasil.ok).toBe(false);
    const detail = await laporanRepository.detail('lap-002');
    expect(detail.ok && detail.data.status).toBe('terverifikasi');
  });

  it('menolak publikasi ulang laporan terverifikasi oleh operator/admin', async () => {
    const input = await inputDariLaporan('lap-002');
    const hasil = await laporanRepository.publikasikan(input, profil('operator'));
    expect(hasil.ok).toBe(false);
  });

  it('menolak verifikasi langsung dari draf', async () => {
    const hasil = await laporanRepository.verifikasi('lap-020', 'terverifikasi', profil('admin'));
    expect(hasil.ok).toBe(false);
  });

  it('mengizinkan publikasi draf lalu verifikasi dari menunggu', async () => {
    const input = await inputDariLaporan('lap-020');
    const pub = await laporanRepository.publikasikan(input, profil('petugas'));
    expect(pub.ok).toBe(true);
    const ver = await laporanRepository.verifikasi('lap-020', 'terverifikasi', profil('admin'));
    expect(ver.ok).toBe(true);
    expect(ver.ok && ver.data.status).toBe('terverifikasi');
  });

  it('menghitung tren bulanan WITA dan tidak menandai aktif saat tahun kosong', async () => {
    const kosong = await rekapRepository.trenBulanan(2025);
    expect(kosong.ok).toBe(true);
    expect(kosong.ok && kosong.data.some((b) => b.aktif)).toBe(false);
  });

  it('menolak konfigurasi ambang tidak valid', async () => {
    const hasil = await konfigurasiRepository.perbarui(
      {
        klasifikasi: { ambangSedangMin: 25, ambangBeratMin: 50 },
        peringatanForm: { ambangPeringatan: 90, ambangEksplosif: 10 },
      },
      profil('admin')
    );
    expect(hasil.ok).toBe(false);
  });

  it('menolak OPT dengan komoditas tidak valid', async () => {
    const hasil = await komoditasOptRepository.tambahOptSimulasi(
      {
        komoditasId: 'kom-tidak-ada',
        namaLokal: 'Uji',
        namaIlmiah: 'Uji test',
        jenis: 'hama',
        gejala: '-',
        rekomendasi: '-',
      },
      profil('admin')
    );
    expect(hasil.ok).toBe(false);
  });

  it('membuat NIP simulasi unik saat duplikat diminta', async () => {
    const hasil = await penggunaRepository.tambahSimulasi(
      {
        nama: 'Uji Duplikat',
        nip: 'SIM-UPTD-0102',
        jabatan: 'Penguji',
        peran: 'operator',
        wilayahId: 'kab-kutim',
        wkpp: 'WKPP Uji',
      },
      profil('admin')
    );
    expect(hasil.ok).toBe(true);
    expect(hasil.ok && hasil.data.nip).not.toBe('SIM-UPTD-0102');
  });

  it('menghormati statusList eksplisit pada metrik laporan ditolak', async () => {
    const hasil = await rekapRepository.ringkasan({ statusList: ['menunggu', 'terverifikasi'] });
    expect(hasil.ok).toBe(true);
    expect(hasil.ok && hasil.data.laporanDitolak).toBe(0);
  });

  it('memberitahu pelanggan saat laporan menunggu ditolak sehingga keluar dari filter aktif', async () => {
    const cb = vi.fn();
    const berhenti = laporanRepository.langganan({ tahun: 2026, triwulan: 4 }, cb);
    const hasil = await laporanRepository.verifikasi(
      'lap-001',
      'ditolak',
      profil('admin'),
      'Koordinat blok perlu diverifikasi ulang'
    );
    berhenti();
    expect(hasil.ok).toBe(true);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('menolak petugas mengubah draf atau mempublikasikan laporan milik petugas lain di kabupaten sama', async () => {
    const tambahPetugas = await penggunaRepository.tambahSimulasi(
      {
        nama: 'Petugas Kedua Kukar',
        nip: 'SIM-POPT-2999',
        jabatan: 'Petugas POPT',
        peran: 'petugas',
        wilayahId: 'kab-kukar',
        wkpp: 'WKPP Kukar 2',
      },
      profil('admin')
    );
    expect(tambahPetugas.ok).toBe(true);
    if (!tambahPetugas.ok) return;

    const inputDrafOrangLain = await inputDariLaporan('lap-020');
    const cobaDraf = await laporanRepository.simpanDraf(inputDrafOrangLain, tambahPetugas.data);
    expect(cobaDraf.ok).toBe(false);

    const cobaPublikasi = await laporanRepository.publikasikan(
      inputDrafOrangLain,
      tambahPetugas.data
    );
    expect(cobaPublikasi.ok).toBe(false);
  });

  it('menyamarkan NIP dan membatasi daftar pengguna langsung di tingkat repository sesuai peran', async () => {
    const petugas = profil('petugas');
    const daftarPengguna = await penggunaRepository.daftar(petugas);
    expect(daftarPengguna.ok).toBe(true);
    expect(daftarPengguna.ok && daftarPengguna.data).toHaveLength(1);
    expect(daftarPengguna.ok && daftarPengguna.data[0]?.id).toBe(petugas.id);

    const daftarLaporan = await laporanRepository.daftar({}, undefined, petugas);
    expect(daftarLaporan.ok).toBe(true);
    if (!daftarLaporan.ok) return;
    const laporanPetugasLain = daftarLaporan.data.find((l) => l.petugasId !== petugas.id);
    expect(laporanPetugasLain?.nipPetugas).toContain('••••');
  });

  it('mengembalikan komoditasUtama "-" bila tidak ada laporan pada filter', async () => {
    const hasil = await rekapRepository.ringkasan({ tahun: 1999 });
    expect(hasil.ok).toBe(true);
    expect(hasil.ok && hasil.data.totalLaporan).toBe(0);
    expect(hasil.ok && hasil.data.komoditasUtama).toBe('-');
  });

  it('menghapus draf lokal yang sudah melewati batas kedaluwarsa 24 jam', () => {
    const penyimpanan = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => penyimpanan.get(k) ?? null,
        setItem: (k: string, v: string) => penyimpanan.set(k, v),
        removeItem: (k: string) => penyimpanan.delete(k),
      },
    });
    const kedaluwarsa = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    penyimpanan.set(
      'siput_kaltim_draf_form_simulasi_v1',
      JSON.stringify({
        disimpanPada: kedaluwarsa,
        nilai: {
          desaId: 'desa-batuah',
          namaBlok: 'Blok Uji',
          komoditasId: 'kom-lada',
          optId: 'opt-bpblada',
          faseTanaman: 'tm',
          lat: -0.71,
          lng: 117.04,
          tahun: 2026,
          triwulan: 4,
          semester: 2,
          luasAmatan: 10,
          luasRingan: 2,
          luasBerat: 1,
          luasTerkendali: 3,
          rekomendasiKultur: '',
          rekomendasiHayati: '',
          rekomendasiKimiawi: '',
        },
      })
    );
    expect(muatDrafLokalForm()).toBeNull();
    expect(penyimpanan.has('siput_kaltim_draf_form_simulasi_v1')).toBe(false);
    vi.unstubAllGlobals();
  });
});
