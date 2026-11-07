import { z } from 'zod';
import {
  validasiKoordinatKaltim,
  validasiLuas,
  validasiPeriode,
} from './klasifikasi';
import { BATAS_KOORDINAT_KALTIM_SEMENTARA } from './konfigurasi';

export const skemaFormLaporan = z
  .object({
    id: z.string().optional(),
    tahun: z
      .number({ invalid_type_error: 'Tahun anggaran wajib berupa angka.' })
      .int('Tahun anggaran harus bilangan bulat.')
      .min(2020, 'Tahun anggaran minimal 2020.')
      .max(2100, 'Tahun anggaran maksimal 2100.'),
    triwulan: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
    ]),
    semester: z.union([z.literal(1), z.literal(2)]),
    kabupatenId: z.string().min(1, 'Kabupaten/Kota wajib dipilih.'),
    kecamatanId: z.string().min(1, 'Kecamatan wajib dipilih.'),
    desaId: z.string().min(1, 'Desa/Kelurahan wajib dipilih.'),
    namaBlok: z
      .string()
      .trim()
      .min(3, 'Nama Blok / Kelompok Tani wajib diisi minimal 3 karakter.')
      .max(120, 'Nama Blok / Kelompok Tani maksimal 120 karakter.'),
    lat: z.number({
      invalid_type_error: 'Lintang wajib berupa angka desimal WGS84.',
    }),
    lng: z.number({
      invalid_type_error: 'Bujur wajib berupa angka desimal WGS84.',
    }),
    komoditasId: z.string().min(1, 'Komoditas perkebunan wajib dipilih.'),
    optId: z.string().min(1, 'Jenis Hama/OPT wajib dipilih.'),
    faseTanaman: z.enum(['tbm', 'tm', 'ttm_tr'], {
      errorMap: () => ({ message: 'Fase tanaman wajib dipilih.' }),
    }),
    luasAmatan: z
      .number({ invalid_type_error: 'Luas pengamatan wajib berupa angka.' })
      .gt(0, 'Luas pengamatan wajib lebih besar dari 0 Ha.'),
    luasRingan: z
      .number({ invalid_type_error: 'Luas ringan wajib berupa angka.' })
      .min(0, 'Luas serangan ringan tidak boleh negatif.'),
    luasBerat: z
      .number({ invalid_type_error: 'Luas berat wajib berupa angka.' })
      .min(0, 'Luas serangan berat tidak boleh negatif.'),
    luasTerkendali: z
      .number({ invalid_type_error: 'Luas terkendali wajib berupa angka.' })
      .min(0, 'Luas terkendali tidak boleh negatif.'),
    rekomendasiKultur: z
      .string()
      .max(500, 'Rekomendasi kultur teknis maksimal 500 karakter.'),
    rekomendasiHayati: z
      .string()
      .max(500, 'Rekomendasi pengendalian hayati maksimal 500 karakter.'),
    rekomendasiKimiawi: z
      .string()
      .max(500, 'Rekomendasi kimiawi/eradikasi maksimal 500 karakter.'),
  })
  .superRefine((data, ctx) => {
    if (!validasiPeriode(data.triwulan, data.semester)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['semester'],
        message:
          'Kombinasi Triwulan dan Semester tidak konsisten (TW I–II = Semester 1; TW III–IV = Semester 2).',
      });
    }

    const cekKoord = validasiKoordinatKaltim(data.lat, data.lng);
    if (!cekKoord.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lat'],
        message:
          cekKoord.pesan ??
          'Koordinat harus berada di dalam wilayah Provinsi Kalimantan Timur.',
      });
    }

    const cekLuas = validasiLuas(
      data.luasAmatan,
      data.luasRingan,
      data.luasBerat,
      data.luasTerkendali
    );
    if (!cekLuas.valid) {
      for (const pesan of cekLuas.galat) {
        if (
          pesan.includes('melebihi luas pengamatan') ||
          pesan.includes('negatif')
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['luasBerat'],
            message: pesan,
          });
        }
      }
    }
  });

export type NilaiFormLaporan = z.infer<typeof skemaFormLaporan>;

export function labelKondisiKebun(intensitasPersen: number, luasAmatan: number): string {
  if (luasAmatan <= 0) return 'Kondisi Kebun: Menunggu Data Amatan';
  if (intensitasPersen > 50) return 'Kondisi Kebun: Darurat Eksplosif';
  if (intensitasPersen >= 25) return 'Kondisi Kebun: Waspada Serangan Sedang';
  if (intensitasPersen > 0) return 'Kondisi Kebun: Ringan / Terkendali';
  return 'Kondisi Kebun: Sehat';
}

/**
 * Memetakan klik pada bidang peta pratinjau (rasio 0..1 dari kiri-atas)
 * kembali menjadi koordinat WGS84 di dalam kotak batas Kalimantan Timur.
 */
export function koordinatDariTitikPetaPratinjau(
  rasioKlikX: number,
  rasioKlikY: number
): { lat: number; lng: number } {
  const { latMin, latMax, lngMin, lngMax } = BATAS_KOORDINAT_KALTIM_SEMENTARA;
  const jepit = (v: number) => Math.min(0.92, Math.max(0.08, Number.isFinite(v) ? v : 0.5));

  const xNorm = (jepit(rasioKlikX) - 0.08) / 0.84;
  const yNorm = (jepit(rasioKlikY) - 0.08) / 0.84;

  const lngMentah = lngMin + xNorm * (lngMax - lngMin);
  const latMentah = latMax - yNorm * (latMax - latMin);

  const bulatkan4 = (n: number) => Math.round(n * 10000) / 10000;
  return {
    lat: Math.min(latMax, Math.max(latMin, bulatkan4(latMentah))),
    lng: Math.min(lngMax, Math.max(lngMin, bulatkan4(lngMentah))),
  };
}

/**
 * Mengompresi dan menyalin citra melalui elemen <canvas> di sisi klien (SECURITY.md §7):
 * - Memperkecil dimensi maksimal ke 1280px agar ringan di memori
 * - Menghapus metadata EXIF mentah dari berkas asli secara otomatis saat render ulang JPEG
 */
export function kompresFotoKlien(
  berkas: File,
  dimensiMaks = 1280,
  kualitas = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlSementara = URL.createObjectURL(berkas);
    const img = new Image();

    img.onload = () => {
      try {
        let lebar = img.naturalWidth || img.width;
        let tinggi = img.naturalHeight || img.height;

        if (lebar > dimensiMaks || tinggi > dimensiMaks) {
          const rasio = Math.min(dimensiMaks / lebar, dimensiMaks / tinggi);
          lebar = Math.max(1, Math.round(lebar * rasio));
          tinggi = Math.max(1, Math.round(tinggi * rasio));
        }

        const kanvas = document.createElement('canvas');
        kanvas.width = lebar;
        kanvas.height = tinggi;
        const ctx = kanvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(urlSementara);
          reject(new Error('Konteks kanvas peramban tidak tersedia.'));
          return;
        }
        ctx.drawImage(img, 0, 0, lebar, tinggi);
        const hasilDataUrl = kanvas.toDataURL('image/jpeg', kualitas);
        URL.revokeObjectURL(urlSementara);
        resolve(hasilDataUrl);
      } catch (err) {
        URL.revokeObjectURL(urlSementara);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(urlSementara);
      reject(new Error('Gagal membaca berkas gambar. Pastikan berkas tidak rusak.'));
    };

    img.src = urlSementara;
  });
}
