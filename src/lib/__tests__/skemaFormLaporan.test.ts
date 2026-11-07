import { describe, expect, it } from 'vitest';
import { validasiKoordinatKaltim } from '../klasifikasi';
import {
  koordinatDariTitikPetaPratinjau,
  labelKondisiKebun,
  skemaFormLaporan,
  type NilaiFormLaporan,
} from '../skemaFormLaporan';

const contohValid: NilaiFormLaporan = {
  tahun: 2026,
  triwulan: 4,
  semester: 2,
  kabupatenId: 'kab-kukar',
  kecamatanId: 'kec-loajanan',
  desaId: 'desa-batuah',
  namaBlok: 'Poktan Harapan Jaya Blok A1',
  lat: -0.7124,
  lng: 117.0411,
  komoditasId: 'kom-lada',
  optId: 'opt-bpblada',
  faseTanaman: 'tm',
  luasAmatan: 100,
  luasRingan: 15,
  luasBerat: 5,
  luasTerkendali: 40,
  rekomendasiKultur: 'Sanitasi kebun dan drainase.',
  rekomendasiHayati: 'Aplikasi Trichoderma sp.',
  rekomendasiKimiawi: 'Pengapuran lubang tanam.',
};

describe('skemaFormLaporan (Fase 1b)', () => {
  it('menerima isian laporan pengamatan yang valid', () => {
    const hasil = skemaFormLaporan.safeParse(contohValid);
    expect(hasil.success).toBe(true);
  });

  it('menolak bila luas pengamatan bernilai 0', () => {
    const hasil = skemaFormLaporan.safeParse({
      ...contohValid,
      luasAmatan: 0,
      luasRingan: 0,
      luasBerat: 0,
      luasTerkendali: 0,
    });
    expect(hasil.success).toBe(false);
  });

  it('menolak bila jumlah luas ringan + berat + terkendali melebihi luas pengamatan', () => {
    const hasil = skemaFormLaporan.safeParse({
      ...contohValid,
      luasAmatan: 50,
      luasRingan: 20,
      luasBerat: 20,
      luasTerkendali: 15,
    });
    expect(hasil.success).toBe(false);
  });

  it('menolak kombinasi Triwulan dan Semester yang tidak konsisten', () => {
    const hasil = skemaFormLaporan.safeParse({
      ...contohValid,
      triwulan: 2,
      semester: 2,
    });
    expect(hasil.success).toBe(false);
  });

  it('menolak koordinat di luar batas wilayah Kalimantan Timur', () => {
    const hasil = skemaFormLaporan.safeParse({
      ...contohValid,
      lat: -6.2,
      lng: 106.8,
    });
    expect(hasil.success).toBe(false);
  });

  it('menentukan label kondisi kebun sesuai intensitas serangan', () => {
    expect(labelKondisiKebun(0, 0)).toContain('Menunggu');
    expect(labelKondisiKebun(0, 50)).toBe('Kondisi Kebun: Sehat');
    expect(labelKondisiKebun(18.8, 100)).toBe('Kondisi Kebun: Ringan / Terkendali');
    expect(labelKondisiKebun(35, 100)).toBe('Kondisi Kebun: Waspada Serangan Sedang');
    expect(labelKondisiKebun(60, 100)).toBe('Kondisi Kebun: Darurat Eksplosif');
  });

  it('memetakan klik peta pratinjau menjadi koordinat WGS84 yang valid di Kaltim', () => {
    const tengah = koordinatDariTitikPetaPratinjau(0.5, 0.5);
    expect(validasiKoordinatKaltim(tengah.lat, tengah.lng).valid).toBe(true);

    const tepiEkstrem = koordinatDariTitikPetaPratinjau(-1, 2);
    expect(validasiKoordinatKaltim(tepiEkstrem.lat, tepiEkstrem.lng).valid).toBe(true);
  });
});
