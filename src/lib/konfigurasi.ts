import type {
  KonfigurasiKlasifikasi,
  KonfigurasiPeringatanForm,
} from '../types/domain';

/**
 * Konfigurasi ambang klasifikasi tingkat serangan GIS (PRD §14 no. 1, AGENTS.md §8).
 * Disimpan terpisah dari ambang peringatan formulir.
 * Ringan < 25%; Sedang 25%–50% (inklusif); Berat > 50%.
 */
export const KONFIGURASI_KLASIFIKASI_BAWAAN: KonfigurasiKlasifikasi = {
  ambangSedangMin: 25,
  ambangBeratMin: 50,
};

/**
 * Konfigurasi ambang peringatan dini pada Formulir Input Laporan (AGENTS.md §8).
 * Terpisah dari klasifikasi GIS karena keputusan pemilik belum final (PRD §14 no. 1).
 * > 15% = pemberitahuan waspada; > 30% = peringatan laporan eksplosif.
 */
export const KONFIGURASI_PERINGATAN_FORM_BAWAAN: KonfigurasiPeringatanForm = {
  ambangPeringatan: 15,
  ambangEksplosif: 30,
};

/**
 * Kotak batas kasar sementara wilayah Provinsi Kalimantan Timur (WGS 84 / EPSG:4326).
 * Catatan sementara Fase 1 (AGENTS.md §8): akan diganti poligon resmi pada rilis berikutnya.
 */
export const BATAS_KOORDINAT_KALTIM_SEMENTARA = {
  latMin: -2.6,
  latMax: 2.5,
  lngMin: 113.8,
  lngMax: 119.1,
} as const;

export const BATAS_UNGGAH_FOTO = {
  maksFotoPerLaporan: 3,
  maksUkuranByte: 8 * 1024 * 1024, // 8 MB
  mimeDiizinkan: ['image/jpeg', 'image/png'] as const,
  ekstensiDiizinkan: ['.jpg', '.jpeg', '.png'] as const,
} as const;

/**
 * Tujuh nama komoditas baku yang tidak boleh digabungkan (AGENTS.md §8 & §11 no. 4).
 */
export const KOMODITAS_BAKU = [
  'Lada',
  'Kelapa Sawit',
  'Kakao',
  'Karet',
  'Aren',
  'Kelapa Dalam',
  'Kopi',
] as const;
