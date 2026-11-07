import type { LaporanInput } from '../types/domain';

const KUNCI_DRAF_LOKAL = 'siput_kaltim_draf_form_v1';
const BATAS_USIA_DRAF_LOKAL_MS = 24 * 60 * 60 * 1000;

/**
 * Penyimpanan draf lokal formulir pada peramban (tanpa foto sensitif — SECURITY.md §6).
 */
export interface DrafLokalForm {
  disimpanPada: string;
  nilai: Omit<LaporanInput, 'fotos' | 'petugasId'> & {
    kabupatenId?: string;
    kecamatanId?: string;
  };
}

function storageTersedia(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function simpanDrafLokalForm(nilai: DrafLokalForm['nilai']): void {
  try {
    const storage = storageTersedia();
    if (!storage) return;
    const payload: DrafLokalForm = {
      disimpanPada: new Date().toISOString(),
      nilai,
    };
    storage.setItem(KUNCI_DRAF_LOKAL, JSON.stringify(payload));
  } catch {
    // Abaikan bila mode privat peramban memblokir localStorage
  }
}

function angkaValidDraft(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function drafLokalValid(x: unknown): x is DrafLokalForm {
  if (!x || typeof x !== 'object') return false;
  const d = x as { disimpanPada?: unknown; nilai?: unknown };
  if (typeof d.disimpanPada !== 'string' || !d.nilai || typeof d.nilai !== 'object') return false;
  const v = d.nilai as Record<string, unknown>;
  const teks = ['desaId', 'namaBlok', 'komoditasId', 'optId', 'faseTanaman'];
  if (!teks.every((k) => typeof v[k] === 'string')) return false;
  const angka = [
    'lat',
    'lng',
    'tahun',
    'triwulan',
    'semester',
    'luasAmatan',
    'luasRingan',
    'luasBerat',
    'luasTerkendali',
  ];
  if (!angka.every((k) => angkaValidDraft(v[k]))) return false;
  if (![1, 2, 3, 4].includes(v.triwulan as number)) return false;
  if (![1, 2].includes(v.semester as number)) return false;
  return true;
}

export function muatDrafLokalForm(): DrafLokalForm | null {
  try {
    const storage = storageTersedia();
    if (!storage) return null;
    const mentah = storage.getItem(KUNCI_DRAF_LOKAL);
    if (!mentah) return null;
    const parsed = JSON.parse(mentah) as unknown;
    if (!drafLokalValid(parsed)) {
      storage.removeItem(KUNCI_DRAF_LOKAL);
      return null;
    }
    const waktuSimpan = Date.parse(parsed.disimpanPada);
    if (Number.isNaN(waktuSimpan) || Date.now() - waktuSimpan > BATAS_USIA_DRAF_LOKAL_MS) {
      storage.removeItem(KUNCI_DRAF_LOKAL);
      return null;
    }
    return parsed;
  } catch {
    try {
      storageTersedia()?.removeItem(KUNCI_DRAF_LOKAL);
    } catch {
      // Abaikan
    }
    return null;
  }
}

export function hapusDrafLokalForm(): void {
  try {
    const storage = storageTersedia();
    if (!storage) return;
    storage.removeItem(KUNCI_DRAF_LOKAL);
    storage.removeItem('siput_kaltim_draf_form_simulasi_v1');
  } catch {
    // Abaikan
  }
}
