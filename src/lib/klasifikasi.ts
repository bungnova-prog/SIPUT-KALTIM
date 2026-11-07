import type {
  KonfigurasiKlasifikasi,
  KonfigurasiPeringatanForm,
  TingkatSerangan,
} from '../types/domain';
import {
  BATAS_KOORDINAT_KALTIM_SEMENTARA,
  KONFIGURASI_KLASIFIKASI_BAWAAN,
  KONFIGURASI_PERINGATAN_FORM_BAWAAN,
} from './konfigurasi';

export type StatusPeringatanForm = 'normal' | 'pemberitahuan' | 'eksplosif';

/**
 * Menghitung intensitas serangan (%) = (luas ringan + luas berat) / luas pengamatan * 100.
 * Bila luas pengamatan <= 0, mengembalikan 0 (AGENTS.md §8).
 */
export function hitungIntensitas(
  luasRingan: number,
  luasBerat: number,
  luasAmatan: number
): number {
  if (!Number.isFinite(luasAmatan) || luasAmatan <= 0) {
    return 0;
  }
  const ringan = Number.isFinite(luasRingan) ? Math.max(0, luasRingan) : 0;
  const berat = Number.isFinite(luasBerat) ? Math.max(0, luasBerat) : 0;
  const persen = ((ringan + berat) / luasAmatan) * 100;
  return Math.round(persen * 100) / 100;
}

/**
 * Klasifikasi tingkat serangan berdasarkan konfigurasi ambang terpusat:
 * Ringan < ambangSedangMin (25%);
 * Sedang ambangSedangMin..ambangBeratMin (25%–50%, batas bawah & atas termasuk);
 * Berat > ambangBeratMin (50%).
 */
export function klasifikasiTingkat(
  intensitasPersen: number,
  konfigurasi: KonfigurasiKlasifikasi = KONFIGURASI_KLASIFIKASI_BAWAAN
): TingkatSerangan {
  if (intensitasPersen > konfigurasi.ambangBeratMin) {
    return 'berat';
  }
  if (intensitasPersen >= konfigurasi.ambangSedangMin) {
    return 'sedang';
  }
  return 'ringan';
}

/**
 * Mengevaluasi ambang peringatan form secara terpisah dari klasifikasi tingkat.
 */
export function evaluasiPeringatanForm(
  intensitasPersen: number,
  konfigurasi: KonfigurasiPeringatanForm = KONFIGURASI_PERINGATAN_FORM_BAWAAN
): StatusPeringatanForm {
  if (intensitasPersen > konfigurasi.ambangEksplosif) {
    return 'eksplosif';
  }
  if (intensitasPersen > konfigurasi.ambangPeringatan) {
    return 'pemberitahuan';
  }
  return 'normal';
}

export interface HasilValidasiLuas {
  valid: boolean;
  galat: string[];
}

/**
 * Memvalidasi aturan luas pengamatan dan rincian serangan (AGENTS.md §8):
 * - luasAmatan > 0 (form menolak simpan bila 0)
 * - semua nilai >= 0
 * - luasRingan + luasBerat + luasTerkendali <= luasAmatan
 */
export function validasiLuas(
  luasAmatan: number,
  luasRingan: number,
  luasBerat: number,
  luasTerkendali: number
): HasilValidasiLuas {
  const galat: string[] = [];

  if (
    !Number.isFinite(luasAmatan) ||
    !Number.isFinite(luasRingan) ||
    !Number.isFinite(luasBerat) ||
    !Number.isFinite(luasTerkendali)
  ) {
    return { valid: false, galat: ['Seluruh isian luas wajib berupa angka yang valid.'] };
  }

  if (luasAmatan <= 0) {
    galat.push('Luas pengamatan wajib lebih besar dari 0 Ha.');
  }
  if (luasRingan < 0 || luasBerat < 0 || luasTerkendali < 0) {
    galat.push('Luas serangan ringan, berat, dan terkendali tidak boleh bernilai negatif.');
  }

  const totalRincian =
    Math.round((luasRingan + luasBerat + luasTerkendali) * 10000) / 10000;
  if (luasAmatan > 0 && totalRincian > luasAmatan + 0.0001) {
    galat.push(
      'Jumlah luas ringan + berat + terkendali tidak boleh melebihi luas pengamatan.'
    );
  }

  return { valid: galat.length === 0, galat };
}

export function semesterDariTriwulan(triwulan: 1 | 2 | 3 | 4): 1 | 2 {
  return triwulan <= 2 ? 1 : 2;
}

/**
 * Memastikan kombinasi Triwulan dan Semester konsisten:
 * TW I–II = Semester 1; TW III–IV = Semester 2.
 */
export function validasiPeriode(triwulan: number, semester: number): boolean {
  if (triwulan === 1 || triwulan === 2) {
    return semester === 1;
  }
  if (triwulan === 3 || triwulan === 4) {
    return semester === 2;
  }
  return false;
}

/**
 * Mengambil tahun, triwulan, dan semester bawaan berdasarkan tanggal sistem di zona waktu WITA.
 */
export function periodeBawaanSistem(tanggal: Date = new Date()): {
  tahun: number;
  triwulan: 1 | 2 | 3 | 4;
  semester: 1 | 2;
} {
  const bagian = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(tanggal);

  const tahunTeks = bagian.find((b) => b.type === 'year')?.value ?? '2026';
  const bulanTeks = bagian.find((b) => b.type === 'month')?.value ?? '11';

  const tahun = Number.parseInt(tahunTeks, 10);
  const bulan = Number.parseInt(bulanTeks, 10);

  let triwulan: 1 | 2 | 3 | 4 = 4;
  if (bulan >= 1 && bulan <= 3) triwulan = 1;
  else if (bulan >= 4 && bulan <= 6) triwulan = 2;
  else if (bulan >= 7 && bulan <= 9) triwulan = 3;
  else triwulan = 4;

  return {
    tahun,
    triwulan,
    semester: semesterDariTriwulan(triwulan),
  };
}

/**
 * Memvalidasi bahwa koordinat WGS 84 berada di dalam kotak batas sementara Kalimantan Timur.
 */
export function validasiKoordinatKaltim(lat: number, lng: number): {
  valid: boolean;
  pesan?: string;
} {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { valid: false, pesan: 'Koordinat lintang dan bujur wajib berupa angka desimal.' };
  }
  const { latMin, latMax, lngMin, lngMax } = BATAS_KOORDINAT_KALTIM_SEMENTARA;
  if (lat < latMin || lat > latMax || lng < lngMin || lng > lngMax) {
    return {
      valid: false,
      pesan: `Koordinat harus berada di dalam wilayah Kalimantan Timur (Lintang ${latMin} s.d. ${latMax}; Bujur ${lngMin} s.d. ${lngMax}).`,
    };
  }
  return { valid: true };
}
