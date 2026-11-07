import type {
  BarisIntensitasKomoditas,
  BarisMatriksKabupaten,
  FilterLaporan,
  LogEkspor,
  ProfilPengguna,
} from '../types/domain';
import type { EksporService } from '../services/kontrak';

export interface BarisProporsiKomoditas {
  namaKomoditas: string;
  persenRinganSedang: number;
  persenBerat: number;
  luasRinganSedang: number;
  luasBerat: number;
  luasTotal: number;
}

export interface TotalKonsolidasiMatriks {
  luasAmatan: number;
  luasRingan: number;
  persenRingan: number;
  luasBerat: number;
  persenBerat: number;
  totalSerangan: number;
  luasTerkendali: number;
  jumlahKabupatenTerdampak: number;
}

/**
 * Menghitung baris Total Konsolidasi Provinsi dari daftar baris matriks kabupaten yang tampil
 * sehingga angka bawah tabel selalu konsisten 100% dengan baris di atasnya.
 */
export function hitungKonsolidasiMatriks(
  baris: BarisMatriksKabupaten[]
): TotalKonsolidasiMatriks {
  let luasAmatan = 0;
  let luasRingan = 0;
  let luasBerat = 0;
  let totalSerangan = 0;
  let luasTerkendali = 0;
  let jumlahKabupatenTerdampak = 0;

  for (const item of baris) {
    luasAmatan += item.luasAmatan;
    luasRingan += item.luasRingan;
    luasBerat += item.luasBerat;
    totalSerangan += item.totalSerangan;
    luasTerkendali += item.luasTerkendali;
    if (item.totalSerangan > 0) {
      jumlahKabupatenTerdampak += 1;
    }
  }

  const bulatkan2 = (n: number) => Math.round(n * 100) / 100;
  const persenRingan =
    luasAmatan > 0 ? Math.round((luasRingan / luasAmatan) * 1000) / 10 : 0;
  const persenBerat =
    luasAmatan > 0 ? Math.round((luasBerat / luasAmatan) * 1000) / 10 : 0;

  return {
    luasAmatan: bulatkan2(luasAmatan),
    luasRingan: bulatkan2(luasRingan),
    persenRingan,
    luasBerat: bulatkan2(luasBerat),
    persenBerat,
    totalSerangan: bulatkan2(totalSerangan),
    luasTerkendali: bulatkan2(luasTerkendali),
    jumlahKabupatenTerdampak,
  };
}

/**
 * Menyusun data proporsi persen Serangan Berat vs Ringan/Sedang per komoditas (DESIGN.md §4.4).
 */
export function susunProporsiSeranganKomoditas(
  daftar: BarisIntensitasKomoditas[]
): BarisProporsiKomoditas[] {
  return daftar.map((item) => {
    if (item.luasTotal <= 0) {
      return {
        namaKomoditas: item.namaKomoditas,
        persenRinganSedang: 0,
        persenBerat: 0,
        luasRinganSedang: 0,
        luasBerat: 0,
        luasTotal: 0,
      };
    }
    const persenBerat = Math.round((item.luasBerat / item.luasTotal) * 1000) / 10;
    const persenRinganSedang = Math.max(
      0,
      Math.round((100 - persenBerat) * 10) / 10
    );
    return {
      namaKomoditas: item.namaKomoditas,
      persenRinganSedang,
      persenBerat,
      luasRinganSedang: item.luasRinganSedang,
      luasBerat: item.luasBerat,
      luasTotal: item.luasTotal,
    };
  });
}

/**
 * Menghitung persentase perubahan relatif antara nilai periode berjalan dan periode pembanding.
 */
export function hitungPersenPerubahan(
  nilaiSekarang: number,
  nilaiPembanding: number
): { persen: number; arah: 'naik' | 'turun' | 'stabil' } {
  if (!Number.isFinite(nilaiSekarang) || !Number.isFinite(nilaiPembanding)) {
    return { persen: 0, arah: 'stabil' };
  }
  if (nilaiPembanding <= 0) {
    if (nilaiSekarang > 0) return { persen: 100, arah: 'naik' };
    return { persen: 0, arah: 'stabil' };
  }
  const selisih = ((nilaiSekarang - nilaiPembanding) / nilaiPembanding) * 100;
  const bulat = Math.round(Math.abs(selisih) * 10) / 10;
  if (bulat < 0.1) return { persen: 0, arah: 'stabil' };
  return {
    persen: bulat,
    arah: selisih > 0 ? 'naik' : 'turun',
  };
}

/**
 * Menentukan filter periode pembanding sebelumnya (TW sebelumnya / Semester sebelumnya / Tahun lalu)
 * untuk menghitung persentase perubahan pada 4 kartu ringkasan Rekapitulasi.
 */
export function buatFilterPembanding(filter: FilterLaporan): FilterLaporan {
  const tahun = filter.tahun ?? 2026;
  if (filter.modePeriode === 'triwulan') {
    const tw = filter.triwulan ?? 4;
    if (tw > 1) {
      return { ...filter, triwulan: (tw - 1) as 1 | 2 | 3 | 4 };
    }
    return { ...filter, tahun: tahun - 1, triwulan: 4 };
  }
  if (filter.modePeriode === 'semester') {
    const sem = filter.semester ?? 2;
    if (sem === 2) {
      return { ...filter, semester: 1 };
    }
    return { ...filter, tahun: tahun - 1, semester: 2 };
  }
  return { ...filter, modePeriode: 'tahunan', tahun: tahun - 1 };
}

/**
 * Menjalankan unduh ulang berkas berdasarkan metadata entri LogEkspor yang tersimpan.
 */
export function jalankanUnduhUlangLog(
  entri: LogEkspor,
  layananEkspor: EksporService,
  peminta: ProfilPengguna
) {
  if (entri.format === 'xlsx') {
    if (entri.tipeDokumen === 'rekap') {
      return layananEkspor.eksporRekapExcel(
        entri.filterJson,
        peminta,
        entri.filterRingkas
      );
    }
    return layananEkspor.eksporObservasiExcel(
      entri.filterJson,
      peminta,
      entri.filterRingkas,
      entri.tipeDokumen === 'geodata' ? 'geodata' : 'observasi'
    );
  }

  if (entri.tipeDokumen === 'geodata') {
    return layananEkspor.eksporPetaSpasialPdf(
      entri.filterJson,
      peminta,
      entri.filterRingkas
    );
  }

  return layananEkspor.eksporBeritaAcaraPdf(
    entri.filterJson,
    peminta,
    entri.filterRingkas
  );
}
