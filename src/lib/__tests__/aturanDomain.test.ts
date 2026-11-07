import { describe, expect, it } from 'vitest';
import {
  evaluasiPeringatanForm,
  hitungIntensitas,
  klasifikasiTingkat,
  periodeBawaanSistem,
  validasiKoordinatKaltim,
  validasiLuas,
  validasiPeriode,
} from '../klasifikasi';
import { formatAngka, formatLuas, tampilkanNipSesuaiPeran } from '../format';
import { netralkanSelExcel, validasiBerkasFoto } from '../sanitasi';
import { KOMODITAS_BAKU } from '../konfigurasi';
import { buatFotoSvgSimulasi } from '../../mocks/dataSimulasi';

describe('Aturan Domain SIPUT-KALTIM (AGENTS.md §8)', () => {
  it('menghitung intensitas serangan secara akurat dan mengembalikan 0 bila luas pengamatan 0', () => {
    expect(hitungIntensitas(10, 5, 0)).toBe(0);
    expect(hitungIntensitas(15, 10, 100)).toBe(25);
    expect(hitungIntensitas(12.5, 6.3, 100)).toBe(18.8);
  });

  it('mengklasifikasikan tingkat serangan sesuai ambang 25/50 termasuk batas atas dan bawah', () => {
    expect(klasifikasiTingkat(0)).toBe('ringan');
    expect(klasifikasiTingkat(18.8)).toBe('ringan');
    expect(klasifikasiTingkat(24.99)).toBe('ringan');
    expect(klasifikasiTingkat(25)).toBe('sedang');
    expect(klasifikasiTingkat(50)).toBe('sedang');
    expect(klasifikasiTingkat(50.01)).toBe('berat');
  });

  it('memisahkan evaluasi ambang peringatan form (>15% dan >30%) dari klasifikasi GIS', () => {
    expect(evaluasiPeringatanForm(15)).toBe('normal');
    expect(evaluasiPeringatanForm(15.1)).toBe('pemberitahuan');
    expect(evaluasiPeringatanForm(30)).toBe('pemberitahuan');
    expect(evaluasiPeringatanForm(30.1)).toBe('eksplosif');
  });

  it('memvalidasi luas pengamatan > 0, nilai non-negatif, dan jumlah rincian <= luas pengamatan', () => {
    expect(validasiLuas(0, 0, 0, 0).valid).toBe(false);
    expect(validasiLuas(100, -1, 10, 10).valid).toBe(false);
    expect(validasiLuas(50, 20, 20, 15).valid).toBe(false);
    expect(validasiLuas(50, 20, 15, 15).valid).toBe(true);
  });

  it('memvalidasi konsistensi Triwulan dan Semester serta menghitung bawaan sistem WITA', () => {
    expect(validasiPeriode(1, 1)).toBe(true);
    expect(validasiPeriode(2, 1)).toBe(true);
    expect(validasiPeriode(2, 2)).toBe(false);
    expect(validasiPeriode(3, 2)).toBe(true);
    expect(validasiPeriode(4, 1)).toBe(false);

    const bawaan = periodeBawaanSistem(new Date('2026-11-05T07:00:00Z'));
    expect(bawaan).toEqual({ tahun: 2026, triwulan: 4, semester: 2 });
  });

  it('memvalidasi koordinat WGS84 berada dalam kotak batas Kalimantan Timur', () => {
    // Samarinda (-0.5022, 117.1536) valid
    expect(validasiKoordinatKaltim(-0.5022, 117.1536).valid).toBe(true);
    // Jakarta (-6.2, 106.8) ditolak
    expect(validasiKoordinatKaltim(-6.2, 106.8).valid).toBe(false);
  });

  it('mempertahankan 7 komoditas baku terpisah dan format angka Indonesia', () => {
    expect(KOMODITAS_BAKU).toHaveLength(7);
    expect(formatLuas(3840.5)).toBe('3.840,50 Ha');
    expect(formatAngka(12500)).toBe('12.500');
  });

  it('menetralkan injeksi rumus Excel dan memvalidasi unggahan foto serta privasi NIP', () => {
    expect(netralkanSelExcel('=SUM(A1:A5)')).toBe("'=SUM(A1:A5)");
    expect(netralkanSelExcel('  =SUM(A1:A5)')).toBe("'  =SUM(A1:A5)");
    expect(netralkanSelExcel('\n+cmd|calc')).toBe("'\n+cmd|calc");
    expect(netralkanSelExcel('+cmd|calc')).toBe("'+cmd|calc");
    expect(netralkanSelExcel('-10+20')).toBe("'-10+20");
    expect(netralkanSelExcel('@IMPORT')).toBe("'@IMPORT");
    expect(netralkanSelExcel('Desa Loa Janan')).toBe('Desa Loa Janan');

    const urlSvg = buatFotoSvgSimulasi('Uji <script>"bahaya"</script>', -0.5, 117.1, '#0B4A22');
    const decodedSvg = decodeURIComponent(urlSvg.replace('data:image/svg+xml;utf8,', ''));
    expect(decodedSvg).not.toContain('<script>');
    expect(decodedSvg).toContain('&lt;script&gt;');

    expect(validasiBerkasFoto('foto.jpg', 'image/jpeg', 1024 * 500, 0).valid).toBe(true);
    expect(validasiBerkasFoto('skrip.svg', 'image/svg+xml', 1024, 0).valid).toBe(false);
    expect(validasiBerkasFoto('besar.png', 'image/png', 9 * 1024 * 1024, 0).valid).toBe(false);
    expect(validasiBerkasFoto('keempat.jpg', 'image/jpeg', 1024, 3).valid).toBe(false);

    const nipAsli = '19900101 202001 1 001';
    expect(
      tampilkanNipSesuaiPeran(nipAsli, 'petugas-2', 'kab-kukar', {
        id: 'petugas-1',
        nama: 'Petugas Simulasi A',
        nip: '19910202 202101 1 002',
        jabatan: 'POPT Ahli Pertama',
        peran: 'petugas',
        wilayahId: 'kab-kukar',
        namaWilayah: 'Kab. Kutai Kartanegara',
        wkpp: 'WKPP Loa Janan',
        aktif: true,
      })
    ).toContain('••••');
  });
});
