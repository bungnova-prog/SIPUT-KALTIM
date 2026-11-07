import type { ProfilPengguna } from '../types/domain';

const ZONA_WAKTU_KALTIM = 'Asia/Makassar';

export function formatAngka(
  nilai: number,
  desimalMin = 0,
  desimalMaks = 2
): string {
  const aman = Number.isFinite(nilai) ? nilai : 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: desimalMin,
    maximumFractionDigits: desimalMaks,
  }).format(aman);
}

export function formatLuas(nilai: number, desimalMin = 2): string {
  return `${formatAngka(nilai, desimalMin, 2)} Ha`;
}

export function formatPersen(nilai: number, desimal = 1): string {
  return `${formatAngka(nilai, desimal, desimal)}%`;
}

export function formatKoordinat(lat: number, lng: number): string {
  const arahLat = lat >= 0 ? 'LU' : 'LS';
  const arahLng = lng >= 0 ? 'BT' : 'BB';
  return `${formatAngka(Math.abs(lat), 4, 5)}° ${arahLat}, ${formatAngka(Math.abs(lng), 4, 5)}° ${arahLng}`;
}

/**
 * Contoh keluaran: "5 Nov 2026"
 */
export function formatTanggalPendek(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: ZONA_WAKTU_KALTIM,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Contoh keluaran: "Kamis, 05 Nov 2026"
 */
export function formatTanggalPanjang(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '-';
  const bagian = new Intl.DateTimeFormat('id-ID', {
    timeZone: ZONA_WAKTU_KALTIM,
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(d);

  const hari = bagian.find((b) => b.type === 'weekday')?.value ?? '';
  const tanggal = bagian.find((b) => b.type === 'day')?.value ?? '';
  const bulan = bagian.find((b) => b.type === 'month')?.value ?? '';
  const tahun = bagian.find((b) => b.type === 'year')?.value ?? '';
  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
}

/**
 * Contoh keluaran: "14:14:09 WITA"
 */
export function formatWaktuWita(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '--:--:-- WITA';
  const waktu = new Intl.DateTimeFormat('id-ID', {
    timeZone: ZONA_WAKTU_KALTIM,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(d)
    .replace(/\./g, ':');
  return `${waktu} WITA`;
}

export function formatTanggalWaktu(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '-';
  const waktu = new Intl.DateTimeFormat('id-ID', {
    timeZone: ZONA_WAKTU_KALTIM,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(d)
    .replace(/\./g, ':');
  return `${formatTanggalPendek(d)} · ${waktu} WITA`;
}

/**
 * Menegakkan privasi NIP sesuai peran (SECURITY.md §9):
 * - Admin: melihat NIP simulasi penuh
 * - Operator: melihat NIP penuh untuk petugas di wilayah kabupaten kerjanya
 * - Petugas: hanya melihat NIP miliknya sendiri; NIP petugas lain disamarkan
 */
export function tampilkanNipSesuaiPeran(
  nipTarget: string | null,
  petugasIdTarget: string,
  kabupatenIdTarget: string | null,
  peminta: ProfilPengguna
): string {
  if (!nipTarget) return 'NIP Simulasi —';
  if (peminta.peran === 'admin') return nipTarget;
  if (
    peminta.peran === 'operator' &&
    peminta.wilayahId &&
    kabupatenIdTarget === peminta.wilayahId
  ) {
    return nipTarget;
  }
  if (peminta.peran === 'petugas' && peminta.id === petugasIdTarget) {
    return nipTarget;
  }
  const bersih = nipTarget.replace(/\s+/g, '');
  if (bersih.length <= 6) return '******';
  return `${bersih.slice(0, 6)}••••••••••••`;
}
