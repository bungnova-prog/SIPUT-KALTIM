import { describe, expect, it } from 'vitest';
import {
  cariKomoditasPalingRentan,
  cariPuncakBulanan,
  proyeksiKoordinatPetaMini,
  susunNomorHalaman,
  susunSorotanPeringatan,
} from '../analitikDashboard';
import { laporanRepository, rekapRepository } from '../../services/mockRepositories';

describe('analitikDashboard (Fase 1a)', () => {
  it('menemukan puncak serangan bulanan dan bulan aktif secara akurat', async () => {
    const hasil = await rekapRepository.trenBulanan(2026);
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;

    const puncak = cariPuncakBulanan(hasil.data);
    expect(puncak.adaData).toBe(true);
    expect(puncak.luasTotal).toBeGreaterThan(0);
    expect(puncak.bulanAktif).toBe('Nov');
  });

  it('mengembalikan adaData=false bila seluruh bulan bernilai 0', async () => {
    const kosong = await rekapRepository.trenBulanan(1999);
    expect(kosong.ok).toBe(true);
    if (!kosong.ok) return;

    const puncak = cariPuncakBulanan(kosong.data);
    expect(puncak.adaData).toBe(false);
    expect(puncak.bulanAktif).toBeNull();
  });

  it('menentukan komoditas paling rentan dari matriks intensitas komoditas', async () => {
    const hasil = await rekapRepository.intensitasPerKomoditas({
      modePeriode: 'triwulan',
      tahun: 2026,
      triwulan: 4,
    });
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;

    const rentan = cariKomoditasPalingRentan(hasil.data);
    expect(rentan).not.toBeNull();
    expect(rentan?.luasTotal).toBeGreaterThan(0);
  });

  it('menyusun sorotan peringatan kritis, waspada, dan rekomendasi dari daftar laporan', async () => {
    const daftar = await laporanRepository.daftar({
      modePeriode: 'triwulan',
      tahun: 2026,
      triwulan: 4,
    });
    expect(daftar.ok).toBe(true);
    if (!daftar.ok) return;

    const sorotan = susunSorotanPeringatan(daftar.data);
    expect(sorotan.jumlahKritis).toBeGreaterThan(0);
    expect(sorotan.kritis?.tingkat).toBe('berat');
    expect(sorotan.rekomendasiUtama.length).toBeGreaterThan(5);
  });

  it('memproyeksikan koordinat WGS84 ke rentang aman peta mini (8%..92%) dan menyusun paginasi elipsis', () => {
    const samarinda = proyeksiKoordinatPetaMini(-0.5022, 117.1536);
    expect(samarinda.xPersen).toBeGreaterThanOrEqual(8);
    expect(samarinda.xPersen).toBeLessThanOrEqual(92);
    expect(samarinda.yPersen).toBeGreaterThanOrEqual(8);
    expect(samarinda.yPersen).toBeLessThanOrEqual(92);

    expect(susunNomorHalaman(1, 75)).toEqual([1, 2, 'elipsis', 75]);
    expect(susunNomorHalaman(10, 75)).toEqual([1, 'elipsis', 9, 10, 11, 'elipsis', 75]);
    expect(susunNomorHalaman(2, 4)).toEqual([1, 2, 3, 4]);
  });
});
