import { describe, expect, it } from 'vitest';
import { transisiStatusLaporan } from '../alurLaporan';

describe('alur transisi status laporan', () => {
  it('mengizinkan draf baru dan draf -> draf', () => {
    expect(transisiStatusLaporan({ statusSaatIni: null, aksi: 'simpan_draf' })).toEqual({
      diizinkan: true,
      statusBaru: 'draf',
    });
    expect(transisiStatusLaporan({ statusSaatIni: 'draf', aksi: 'simpan_draf' }).diizinkan).toBe(true);
  });

  it('menolak perubahan terverifikasi menjadi draf atau menunggu', () => {
    expect(transisiStatusLaporan({ statusSaatIni: 'terverifikasi', aksi: 'simpan_draf' }).diizinkan).toBe(false);
    expect(transisiStatusLaporan({ statusSaatIni: 'terverifikasi', aksi: 'publikasikan' }).diizinkan).toBe(false);
  });

  it('hanya mengizinkan verifikasi dari menunggu, kecuali terverifikasi -> ditolak', () => {
    expect(
      transisiStatusLaporan({ statusSaatIni: 'menunggu', aksi: 'verifikasi', keputusan: 'terverifikasi' })
    ).toEqual({ diizinkan: true, statusBaru: 'terverifikasi' });
    expect(
      transisiStatusLaporan({ statusSaatIni: 'draf', aksi: 'verifikasi', keputusan: 'terverifikasi' }).diizinkan
    ).toBe(false);
    expect(
      transisiStatusLaporan({ statusSaatIni: 'terverifikasi', aksi: 'verifikasi', keputusan: 'ditolak' })
    ).toEqual({ diizinkan: true, statusBaru: 'ditolak' });
  });
});
