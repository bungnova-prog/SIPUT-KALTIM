import { describe, expect, it } from 'vitest';
import {
  buatTautanNavigasiKoordinat,
  kelompokkanPenandaLaporan,
  labelZonaTematik,
  proyeksikanKeKanvasGis,
  ringkasUptdAktif,
  simbolTingkatSerangan,
} from '../petaGis';
import type { Laporan, Uptd } from '../../types/domain';

function buatContohLaporan(
  id: string,
  lat: number,
  lng: number,
  tingkat: Laporan['tingkat'],
  intensitasPersen: number
): Laporan {
  return {
    id,
    kode: `SIM-KKR-2026-00${id}`,
    petugasId: 'usr-popt-01',
    namaPetugas: 'Rina Wulandari, S.P.',
    nipPetugas: '199204112019032001',
    desaId: 'desa-batuah',
    namaDesa: 'Batuah',
    kecamatanId: 'kec-loajanan',
    namaKecamatan: 'Loa Janan',
    kabupatenId: 'kab-kukar',
    namaKabupaten: 'Kab. Kutai Kartanegara',
    uptdId: 'uptd-kukar',
    namaBlok: 'Blok A',
    lat,
    lng,
    komoditasId: 'kom-lada',
    namaKomoditas: 'Lada',
    optId: 'opt-bpblada',
    namaOptLokal: 'Busuk Pangkal Batang',
    namaOptIlmiah: 'Phytophthora capsici',
    jenisOpt: 'penyakit',
    faseTanaman: 'tm',
    tahun: 2026,
    triwulan: 4,
    semester: 2,
    luasAmatan: 20,
    luasRingan: 4,
    luasBerat: 6,
    luasTerkendali: 5,
    intensitasPersen,
    tingkat,
    status: 'menunggu',
    rekomendasiKultur: 'Sanitasi drainase',
    rekomendasiHayati: 'Trichoderma sp.',
    rekomendasiKimiawi: 'Eradikasi selektif',
    catatanVerifikasi: null,
    dibuatPada: '2026-11-05T06:00:00.000Z',
    diverifikasiOleh: null,
    diverifikasiPada: null,
    fotos: [],
  };
}

describe('petaGis (Fase 1c)', () => {
  it('menggabungkan titik berdekatan menjadi klaster pada zoom rendah dan memisahkannya pada zoom dekat', () => {
    const daftar = [
      buatContohLaporan('1', -0.7124, 117.0411, 'ringan', 12),
      buatContohLaporan('2', -0.7155, 117.0442, 'berat', 58),
      buatContohLaporan('3', 2.1512, 117.4923, 'sedang', 32),
    ];

    const klasterZoomJauh = kelompokkanPenandaLaporan(daftar, 6);
    expect(klasterZoomJauh.length).toBe(2);

    const klasterGabungan = klasterZoomJauh.find((k) => k.jumlah === 2);
    expect(klasterGabungan).toBeDefined();
    expect(klasterGabungan?.tingkatDominan).toBe('berat');
    expect(klasterGabungan?.laporanUtama.id).toBe('2');

    const penandaZoomDekat = kelompokkanPenandaLaporan(daftar, 12);
    expect(penandaZoomDekat.length).toBe(3);
    expect(penandaZoomDekat.every((p) => p.jumlah === 1)).toBe(true);
  });

  it('menyediakan simbol aksesibilitas dan label zona berbeda untuk setiap tingkat keparahan', () => {
    expect(simbolTingkatSerangan('berat')).not.toBe(simbolTingkatSerangan('sedang'));
    expect(simbolTingkatSerangan('sedang')).not.toBe(simbolTingkatSerangan('ringan'));
    expect(labelZonaTematik('berat')).toContain('MERAH');
    expect(labelZonaTematik('sedang')).toContain('KUNING');
    expect(labelZonaTematik('ringan')).toContain('HIJAU');
  });

  it('memproyeksikan titik pusat Kaltim ke tengah bidang kanvas pada zoom awal', () => {
    const pusatLat = (-2.6 + 2.5) / 2;
    const pusatLng = (113.8 + 119.1) / 2;
    const hasil = proyeksikanKeKanvasGis(pusatLat, pusatLng, pusatLat, pusatLng, 6);
    expect(hasil.terlihat).toBe(true);
    expect(hasil.xPersen).toBeCloseTo(50, 1);
    expect(hasil.yPersen).toBeCloseTo(50, 1);
  });

  it('meringkas pengamat aktif UPTD sesuai filter kabupaten atau konsolidasi provinsi', () => {
    const daftarUptd: Uptd[] = [
      { id: 'u1', nama: 'UPTD Kukar', kabupatenId: 'kab-kukar', jumlahPengamatAktif: 14 },
      { id: 'u2', nama: 'UPTD Berau', kabupatenId: 'kab-berau', jumlahPengamatAktif: 9 },
    ];
    expect(ringkasUptdAktif(daftarUptd, 'kab-kukar').jumlahPengamat).toBe(14);
    expect(ringkasUptdAktif(daftarUptd).jumlahPengamat).toBe(23);
    expect(buatTautanNavigasiKoordinat(-0.7124, 117.0411)).toContain('-0.71240%2C117.04110');
  });
});
