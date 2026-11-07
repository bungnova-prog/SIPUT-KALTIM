import { BATAS_KOORDINAT_KALTIM_SEMENTARA } from './konfigurasi';
import type { Laporan, TingkatSerangan, Uptd } from '../types/domain';

export type LapisanDasarPeta = 'satelit' | 'tematik' | 'topografi';

export interface KlasterPenandaPeta {
  id: string;
  lat: number;
  lng: number;
  jumlah: number;
  tingkatDominan: TingkatSerangan;
  totalLuasSerangan: number;
  intensitasMaks: number;
  laporanUtama: Laporan;
  daftarLaporan: Laporan[];
}

const SKOR_TINGKAT: Record<TingkatSerangan, number> = {
  ringan: 1,
  sedang: 2,
  berat: 3,
};

export function simbolTingkatSerangan(tingkat: TingkatSerangan): string {
  if (tingkat === 'berat') return '!';
  if (tingkat === 'sedang') return '▲';
  return '✓';
}

export function labelZonaTematik(tingkat: TingkatSerangan): string {
  if (tingkat === 'berat') return 'ZONA MERAH: EKSPLOSIF';
  if (tingkat === 'sedang') return 'ZONA KUNING: WASPADA';
  return 'ZONA HIJAU: TERKENDALI';
}

/**
 * Mengelompokkan (clustering) daftar laporan geospasial berdasarkan tingkat zoom peta (AGENTS.md §7).
 * - Pada zoom >= 11: setiap laporan tampil sebagai penanda tunggal (tanpa penggabungan).
 * - Pada zoom < 11: laporan yang berdekatan dalam sel grid digabung menjadi satu klaster,
 *   dengan tingkat ancaman mengikuti keparahan tertinggi di dalam klaster.
 */
export function kelompokkanPenandaLaporan(
  daftar: Laporan[],
  zoom: number
): KlasterPenandaPeta[] {
  if (daftar.length === 0) return [];

  const zoomAman = Math.min(16, Math.max(5, Math.round(zoom)));

  // Pada zoom detail (>= 11), tampilkan masing-masing penanda secara individual
  if (zoomAman >= 11) {
    return daftar.map((lap) => ({
      id: `titik-${lap.id}`,
      lat: lap.lat,
      lng: lap.lng,
      jumlah: 1,
      tingkatDominan: lap.tingkat,
      totalLuasSerangan: Math.round((lap.luasRingan + lap.luasBerat) * 100) / 100,
      intensitasMaks: lap.intensitasPersen,
      laporanUtama: lap,
      daftarLaporan: [lap],
    }));
  }

  // Ukuran sel derajat mengecil dua kali lipat setiap kenaikan 1 tingkat zoom
  // zoom 6 -> ~0.90 derajat, zoom 7 -> ~0.45, zoom 8 -> ~0.225, zoom 9 -> ~0.1125, zoom 10 -> ~0.056
  const ukuranSelDerajat = 0.9 / Math.pow(2, zoomAman - 6);

  const petaSel = new Map<string, Laporan[]>();
  for (const lap of daftar) {
    const indeksLat = Math.floor((lap.lat - BATAS_KOORDINAT_KALTIM_SEMENTARA.latMin) / ukuranSelDerajat);
    const indeksLng = Math.floor((lap.lng - BATAS_KOORDINAT_KALTIM_SEMENTARA.lngMin) / ukuranSelDerajat);
    const kunci = `${indeksLat}:${indeksLng}`;
    const grup = petaSel.get(kunci);
    if (grup) {
      grup.push(lap);
    } else {
      petaSel.set(kunci, [lap]);
    }
  }

  const hasil: KlasterPenandaPeta[] = [];
  for (const [kunci, anggota] of petaSel.entries()) {
    const terurut = [...anggota].sort((a, b) => {
      const selisihSkor = SKOR_TINGKAT[b.tingkat] - SKOR_TINGKAT[a.tingkat];
      if (selisihSkor !== 0) return selisihSkor;
      return b.intensitasPersen - a.intensitasPersen;
    });

    const utama = terurut[0];
    let jumlahLat = 0;
    let jumlahLng = 0;
    let totalSerangan = 0;
    let maksIntensitas = 0;

    for (const item of anggota) {
      jumlahLat += item.lat;
      jumlahLng += item.lng;
      totalSerangan += item.luasRingan + item.luasBerat;
      if (item.intensitasPersen > maksIntensitas) {
        maksIntensitas = item.intensitasPersen;
      }
    }

    hasil.push({
      id: anggota.length === 1 ? `titik-${utama.id}` : `klaster-${kunci}-${anggota.length}`,
      lat: Math.round((jumlahLat / anggota.length) * 100000) / 100000,
      lng: Math.round((jumlahLng / anggota.length) * 100000) / 100000,
      jumlah: anggota.length,
      tingkatDominan: utama.tingkat,
      totalLuasSerangan: Math.round(totalSerangan * 100) / 100,
      intensitasMaks: maksIntensitas,
      laporanUtama: utama,
      daftarLaporan: terurut,
    });
  }

  // Urutkan agar penanda kritis digambar paling atas (z-order terakhir di SVG/DOM)
  return hasil.sort(
    (a, b) => SKOR_TINGKAT[a.tingkatDominan] - SKOR_TINGKAT[b.tingkatDominan]
  );
}

export interface KoordinatLayarKanvas {
  xPersen: number;
  yPersen: number;
  terlihat: boolean;
}

/**
 * Memproyeksikan titik WGS84 (lat, lng) ke koordinat persentase layar kanvas GIS Kaltim
 * dengan memperhitungkan pusat pandang (centerLat, centerLng) dan tingkat zoom (6..13).
 */
export function proyeksikanKeKanvasGis(
  lat: number,
  lng: number,
  pusatLat: number,
  pusatLng: number,
  zoom: number
): KoordinatLayarKanvas {
  const { latMin, latMax, lngMin, lngMax } = BATAS_KOORDINAT_KALTIM_SEMENTARA;
  const rentangDasarLat = latMax - latMin; // 5.1 derajat pada zoom 6
  const rentangDasarLng = lngMax - lngMin; // 5.3 derajat pada zoom 6

  const faktorZoom = Math.pow(1.48, Math.max(0, zoom - 6));
  const setengahRentangLat = rentangDasarLat / faktorZoom / 2;
  const setengahRentangLng = rentangDasarLng / faktorZoom / 2;

  const xNorm = (lng - (pusatLng - setengahRentangLng)) / (setengahRentangLng * 2);
  const yNorm = 1 - (lat - (pusatLat - setengahRentangLat)) / (setengahRentangLat * 2);

  const xPersen = Math.round(xNorm * 1000) / 10;
  const yPersen = Math.round(yNorm * 1000) / 10;

  return {
    xPersen,
    yPersen,
    terlihat: xPersen >= -4 && xPersen <= 104 && yPersen >= -4 && yPersen <= 104,
  };
}

/**
 * Menghasilkan ringkasan UPTD berdasarkan filter kabupaten aktif (DESIGN.md §4.2).
 */
export function ringkasUptdAktif(
  daftarUptd: Uptd[],
  kabupatenId?: string
): { namaUnit: string; jumlahPengamat: number } {
  if (kabupatenId) {
    const cocok = daftarUptd.find((u) => u.kabupatenId === kabupatenId);
    if (cocok) {
      return {
        namaUnit: cocok.nama,
        jumlahPengamat: cocok.jumlahPengamatAktif,
      };
    }
  }
  const totalPengamat = daftarUptd.reduce((akum, item) => akum + item.jumlahPengamatAktif, 0);
  return {
    namaUnit: 'Konsolidasi UPTD Proteksi Provinsi Kaltim (10 Kab/Kota)',
    jumlahPengamat: totalPengamat,
  };
}

/**
 * Menyusun tautan navigasi arah eksternal yang aman untuk koordinat WGS84.
 */
export function buatTautanNavigasiKoordinat(lat: number, lng: number): string {
  const latAman = Number.isFinite(lat) ? lat.toFixed(5) : '0';
  const lngAman = Number.isFinite(lng) ? lng.toFixed(5) : '0';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latAman},${lngAman}`)}`;
}
