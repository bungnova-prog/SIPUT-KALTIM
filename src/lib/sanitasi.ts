import { BATAS_UNGGAH_FOTO } from './konfigurasi';

const AWALAN_RUMUS_BERBAHAYA = ['=', '+', '-', '@', '\t', '\r', '\n'];

/**
 * Menetralkan potensi injeksi rumus pada sel ekspor Excel/CSV (SECURITY.md §7).
 * Bila string (atau karakter non-spasi pertamanya) diawali '=', '+', '-', '@', tab, CR, atau LF,
 * diberi awalan kutip tunggal (').
 */
export function netralkanSelExcel(nilai: string | number | null | undefined): string | number {
  if (nilai === null || nilai === undefined) return '';
  if (typeof nilai === 'number') return Number.isFinite(nilai) ? nilai : 0;
  const teks = String(nilai);
  if (teks.length === 0) return '';
  const karakterPertama = teks.charAt(0);
  const karakterNonSpasiPertama = teks.trimStart().charAt(0);
  if (
    AWALAN_RUMUS_BERBAHAYA.includes(karakterPertama) ||
    (karakterNonSpasiPertama.length > 0 &&
      AWALAN_RUMUS_BERBAHAYA.includes(karakterNonSpasiPertama))
  ) {
    return `'${teks}`;
  }
  return teks;
}

export interface HasilValidasiFoto {
  valid: boolean;
  pesan?: string;
}

/**
 * Memvalidasi unggahan foto dokumentasi lapangan (SECURITY.md §7):
 * - Maksimal 3 berkas per laporan
 * - Tipe MIME image/jpeg atau image/png
 * - Ekstensi .jpg, .jpeg, atau .png
 * - Ukuran maksimal 8 MB per berkas
 */
export function validasiBerkasFoto(
  namaBerkas: string,
  mimeType: string,
  ukuranByte: number,
  jumlahSaatIni: number
): HasilValidasiFoto {
  if (jumlahSaatIni >= BATAS_UNGGAH_FOTO.maksFotoPerLaporan) {
    return {
      valid: false,
      pesan: `Maksimal ${BATAS_UNGGAH_FOTO.maksFotoPerLaporan} foto per laporan.`,
    };
  }

  const namaKecil = namaBerkas.trim().toLowerCase();
  const ekstensiValid = BATAS_UNGGAH_FOTO.ekstensiDiizinkan.some((ext) =>
    namaKecil.endsWith(ext)
  );
  const mimeValid = (BATAS_UNGGAH_FOTO.mimeDiizinkan as readonly string[]).includes(
    mimeType.toLowerCase()
  );

  if (!ekstensiValid || !mimeValid) {
    return {
      valid: false,
      pesan: 'Format berkas tidak didukung. Unggah foto berformat JPG atau PNG.',
    };
  }

  if (ukuranByte <= 0) {
    return {
      valid: false,
      pesan: 'Berkas foto kosong atau rusak.',
    };
  }

  if (ukuranByte > BATAS_UNGGAH_FOTO.maksUkuranByte) {
    return {
      valid: false,
      pesan: 'Ukuran berkas melebihi batas maksimal 8 MB per foto.',
    };
  }

  return { valid: true };
}
