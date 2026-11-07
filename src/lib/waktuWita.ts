const ZONA_WAKTU_WITA = 'Asia/Makassar';

/**
 * Mengambil indeks bulan (0-11) dan tahun dari tanggal pada zona waktu WITA.
 * Dipakai agar tren/rekap konsisten dengan format tampilan WITA.
 */
export function bulanTahunWita(input: string | Date): { bulanIndex: number; tahun: number } | null {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return null;

  const bagian = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_WAKTU_WITA,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);

  const tahunTeks = bagian.find((b) => b.type === 'year')?.value;
  const bulanTeks = bagian.find((b) => b.type === 'month')?.value;
  if (!tahunTeks || !bulanTeks) return null;

  return {
    tahun: Number.parseInt(tahunTeks, 10),
    bulanIndex: Number.parseInt(bulanTeks, 10) - 1,
  };
}
