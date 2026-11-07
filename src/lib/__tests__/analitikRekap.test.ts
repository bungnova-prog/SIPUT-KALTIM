import { describe, expect, it } from 'vitest';
import {
  buatFilterPembanding,
  hitungKonsolidasiMatriks,
  hitungPersenPerubahan,
  susunProporsiSeranganKomoditas,
} from '../analitikRekap';
import type { BarisMatriksKabupaten } from '../../types/domain';

describe('analitikRekap (Fase 1d)', () => {
  it('menghitung total konsolidasi provinsi secara akurat dari matriks kabupaten', () => {
    const baris: BarisMatriksKabupaten[] = [
      {
        no: 1,
        kabupatenId: 'kab-kukar',
        namaKabupaten: 'Kab. Kutai Kartanegara',
        daftarKecamatan: 'Loa Janan, Tenggarong',
        komoditasUtama: 'Lada',
        optDominanLokal: 'BPB',
        optDominanIlmiah: 'Phytophthora capsici',
        luasAmatan: 100,
        luasRingan: 20,
        persenRingan: 20,
        luasBerat: 10,
        persenBerat: 10,
        totalSerangan: 30,
        luasTerkendali: 15,
      },
      {
        no: 2,
        kabupatenId: 'kab-kutim',
        namaKabupaten: 'Kab. Kutai Timur',
        daftarKecamatan: 'Sangatta Utara',
        komoditasUtama: 'Kelapa Sawit',
        optDominanLokal: 'Ganoderma',
        optDominanIlmiah: 'Ganoderma boninense',
        luasAmatan: 100,
        luasRingan: 10,
        persenRingan: 10,
        luasBerat: 30,
        persenBerat: 30,
        totalSerangan: 40,
        luasTerkendali: 25,
      },
    ];

    const konsolidasi = hitungKonsolidasiMatriks(baris);
    expect(konsolidasi.luasAmatan).toBe(200);
    expect(konsolidasi.luasRingan).toBe(30);
    expect(konsolidasi.persenRingan).toBe(15);
    expect(konsolidasi.luasBerat).toBe(40);
    expect(konsolidasi.persenBerat).toBe(20);
    expect(konsolidasi.totalSerangan).toBe(70);
    expect(konsolidasi.luasTerkendali).toBe(40);
    expect(konsolidasi.jumlahKabupatenTerdampak).toBe(2);
  });

  it('menyusun proporsi persen serangan berat vs ringan hingga berjumlah 100%', () => {
    const proporsi = susunProporsiSeranganKomoditas([
      {
        komoditasId: 'kom-lada',
        namaKomoditas: 'Lada',
        luasRinganSedang: 30,
        luasBerat: 10,
        luasTotal: 40,
        optUtama: 'BPB',
      },
    ]);
    expect(proporsi[0].persenBerat).toBe(25);
    expect(proporsi[0].persenRinganSedang).toBe(75);
  });

  it('menentukan filter periode pembanding dan arah perubahan persen', () => {
    const pembandingTw1 = buatFilterPembanding({
      modePeriode: 'triwulan',
      tahun: 2026,
      triwulan: 1,
    });
    expect(pembandingTw1.tahun).toBe(2025);
    expect(pembandingTw1.triwulan).toBe(4);

    const deltaNaik = hitungPersenPerubahan(125, 100);
    expect(deltaNaik).toEqual({ persen: 25, arah: 'naik' });

    const deltaTurun = hitungPersenPerubahan(80, 100);
    expect(deltaTurun).toEqual({ persen: 20, arah: 'turun' });
  });
});
