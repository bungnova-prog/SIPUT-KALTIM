import { BATAS_KOORDINAT_KALTIM_SEMENTARA } from './konfigurasi';
import type {
  BarisIntensitasKomoditas,
  BarisTrenBulanan,
  Laporan,
} from '../types/domain';

export interface InfoPuncakBulanan {
  adaData: boolean;
  bulan: string;
  luasTotal: number;
  luasBerat: number;
  bulanAktif: string | null;
}

export function cariPuncakBulanan(baris: BarisTrenBulanan[]): InfoPuncakBulanan {
  let puncak: BarisTrenBulanan | null = null;
  let bulanAktif: string | null = null;

  for (const item of baris) {
    if (item.aktif) {
      bulanAktif = item.bulan;
    }
    if (item.luasTotal > 0 && (!puncak || item.luasTotal > puncak.luasTotal)) {
      puncak = item;
    }
  }

  if (!puncak) {
    return {
      adaData: false,
      bulan: '-',
      luasTotal: 0,
      luasBerat: 0,
      bulanAktif,
    };
  }

  return {
    adaData: true,
    bulan: puncak.bulan,
    luasTotal: puncak.luasTotal,
    luasBerat: puncak.luasBerat,
    bulanAktif,
  };
}

export function cariKomoditasPalingRentan(
  baris: BarisIntensitasKomoditas[]
): BarisIntensitasKomoditas | null {
  const terurut = [...baris]
    .filter((b) => b.luasTotal > 0)
    .sort((a, b) => b.luasTotal - a.luasTotal);
  return terurut[0] ?? null;
}

export interface SorotanPeringatanDashboard {
  kritis: Laporan | null;
  jumlahKritis: number;
  waspada: Laporan | null;
  jumlahWaspada: number;
  rekomendasiUtama: string;
  wilayahPrioritas: string;
}

export function susunSorotanPeringatan(daftar: Laporan[]): SorotanPeringatanDashboard {
  const daftarKritis = daftar
    .filter((l) => l.tingkat === 'berat')
    .sort((a, b) => b.intensitasPersen - a.intensitasPersen);

  const daftarWaspada = daftar
    .filter((l) => l.tingkat === 'sedang' || l.jenisOpt === 'penyakit')
    .sort((a, b) => b.intensitasPersen - a.intensitasPersen);

  const kritis = daftarKritis[0] ?? null;
  const waspada =
    daftarWaspada.find((l) => l.id !== kritis?.id) ?? daftarWaspada[0] ?? null;

  const acuan = kritis ?? waspada ?? daftar[0] ?? null;

  return {
    kritis,
    jumlahKritis: daftarKritis.length,
    waspada,
    jumlahWaspada: daftar.filter((l) => l.tingkat === 'sedang').length,
    rekomendasiUtama: acuan
      ? acuan.rekomendasiKultur ||
        acuan.rekomendasiHayati ||
        acuan.rekomendasiKimiawi ||
        'Lakukan pengamatan intensif mingguan dan koordinasi pengendalian terpadu bersama UPTD.'
      : 'Pertahankan pengamatan berkala di seluruh WKPP dan pastikan kesiapan agens hayati.',
    wilayahPrioritas: acuan
      ? `${acuan.namaDesa}, Kec. ${acuan.namaKecamatan} (${acuan.namaKabupaten})`
      : 'Seluruh Wilayah Kalimantan Timur',
  };
}

export interface TitikProyeksiPetaMini {
  xPersen: number;
  yPersen: number;
}

/**
 * Memproyeksikan koordinat WGS84 Kalimantan Timur ke persentase bidang pratinjau (8%..92%)
 * agar penanda tidak terpotong di tepi kotak peta mini.
 */
export function proyeksiKoordinatPetaMini(
  lat: number,
  lng: number
): TitikProyeksiPetaMini {
  const { latMin, latMax, lngMin, lngMax } = BATAS_KOORDINAT_KALTIM_SEMENTARA;
  const rasioX = (lng - lngMin) / (lngMax - lngMin);
  const rasioY = 1 - (lat - latMin) / (latMax - latMin);

  const jepit = (v: number) => Math.min(0.92, Math.max(0.08, Number.isFinite(v) ? v : 0.5));
  return {
    xPersen: Math.round(jepit(rasioX) * 1000) / 10,
    yPersen: Math.round(jepit(rasioY) * 1000) / 10,
  };
}

export type ItemHalaman = number | 'elipsis';

/**
 * Menyusun deret paginasi ringkas seperti `1 2 3 … 75` sesuai DESIGN.md §4.1.
 */
export function susunNomorHalaman(
  halamanAktif: number,
  totalHalaman: number
): ItemHalaman[] {
  if (totalHalaman <= 1) return [1];
  if (totalHalaman <= 6) {
    return Array.from({ length: totalHalaman }, (_, i) => i + 1);
  }

  const hasil: ItemHalaman[] = [1];
  const kiri = Math.max(2, halamanAktif - 1);
  const kanan = Math.min(totalHalaman - 1, halamanAktif + 1);

  if (kiri > 2) {
    hasil.push('elipsis');
  }
  for (let i = kiri; i <= kanan; i += 1) {
    hasil.push(i);
  }
  if (kanan < totalHalaman - 1) {
    hasil.push('elipsis');
  }
  hasil.push(totalHalaman);
  return hasil;
}
