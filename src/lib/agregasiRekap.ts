import { hitungIntensitas, klasifikasiTingkat } from './klasifikasi';
import { bulanTahunWita } from './waktuWita';
import type {
  BarisIntensitasKomoditas,
  BarisKerentananWilayah,
  BarisMatriksKabupaten,
  BarisTrenBulanan,
  BarisTrenTriwulanKomoditas,
  FilterLaporan,
  Komoditas,
  KonfigurasiKlasifikasi,
  Laporan,
  RingkasanRekap,
  Wilayah,
} from '../types/domain';

const NAMA_BULAN_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Menyaring daftar laporan terpetakan menggunakan satu kontrak FilterLaporan terpusat
 * agar Dashboard, Peta GIS, Rekapitulasi, dan Ekspor selalu menghitung total yang sama.
 */
export function saringDaftarLaporan(
  semuaLaporan: Laporan[],
  filter: FilterLaporan = {},
  abaikanFilterStatus = false
): Laporan[] {
  return semuaLaporan.filter((l) => {
    if (!abaikanFilterStatus) {
      if (filter.statusList && filter.statusList.length > 0) {
        if (!filter.statusList.includes(l.status)) return false;
      } else {
        // Bawaan: draf dan ditolak tidak masuk agregasi utama kecuali diminta eksplisit
        if (l.status === 'draf' || l.status === 'ditolak') return false;
      }
    } else if (l.status === 'draf') {
      return false;
    }

    if (filter.tahun && l.tahun !== filter.tahun) return false;

    if (filter.modePeriode === 'triwulan' && filter.triwulan) {
      if (l.triwulan !== filter.triwulan) return false;
    } else if (filter.modePeriode === 'semester' && filter.semester) {
      if (l.semester !== filter.semester) return false;
    } else {
      if (filter.triwulan && l.triwulan !== filter.triwulan) return false;
      if (filter.semester && l.semester !== filter.semester) return false;
    }

    if (filter.kabupatenId && l.kabupatenId !== filter.kabupatenId) return false;
    if (filter.kecamatanId && l.kecamatanId !== filter.kecamatanId) return false;
    if (filter.desaId && l.desaId !== filter.desaId) return false;
    if (filter.uptdId && l.uptdId !== filter.uptdId) return false;

    if (filter.komoditasIds && filter.komoditasIds.length > 0) {
      if (!filter.komoditasIds.includes(l.komoditasId)) return false;
    }

    if (filter.tingkatList && filter.tingkatList.length > 0) {
      if (!filter.tingkatList.includes(l.tingkat)) return false;
    }

    if (filter.kataKunci && filter.kataKunci.trim() !== '') {
      const q = filter.kataKunci.trim().toLowerCase();
      const cocok =
        l.kode.toLowerCase().includes(q) ||
        l.namaDesa.toLowerCase().includes(q) ||
        l.namaKecamatan.toLowerCase().includes(q) ||
        l.namaKabupaten.toLowerCase().includes(q) ||
        l.namaKomoditas.toLowerCase().includes(q) ||
        l.namaOptLokal.toLowerCase().includes(q) ||
        l.namaOptIlmiah.toLowerCase().includes(q) ||
        l.namaPetugas.toLowerCase().includes(q);
      if (!cocok) return false;
    }

    return true;
  });
}

export function hitungRingkasanRekapDariLaporan(
  semuaLaporan: Laporan[],
  filter: FilterLaporan
): RingkasanRekap {
  const daftar = saringDaftarLaporan(semuaLaporan, filter, false);
  const lintasStatus = saringDaftarLaporan(semuaLaporan, filter, true);

  let totalLuasAmatan = 0;
  let totalLuasRingan = 0;
  let totalLuasBerat = 0;
  let totalLuasTerkendali = 0;
  let jumlahTitikKritis = 0;
  let jumlahTitikWaspada = 0;
  let jumlahTitikRingan = 0;
  let laporanMenunggu = 0;
  let laporanTerverifikasi = 0;

  const kabSet = new Set<string>();
  const luasPerKomoditas = new Map<string, number>();
  const luasPerOpt = new Map<string, number>();

  for (const l of daftar) {
    totalLuasAmatan += l.luasAmatan;
    totalLuasRingan += l.luasRingan;
    totalLuasBerat += l.luasBerat;
    totalLuasTerkendali += l.luasTerkendali;

    if (l.tingkat === 'berat') jumlahTitikKritis += 1;
    else if (l.tingkat === 'sedang') jumlahTitikWaspada += 1;
    else jumlahTitikRingan += 1;

    if (l.status === 'menunggu') laporanMenunggu += 1;
    if (l.status === 'terverifikasi') laporanTerverifikasi += 1;

    const serang = l.luasRingan + l.luasBerat;
    if (serang > 0 && l.kabupatenId) kabSet.add(l.kabupatenId);

    luasPerKomoditas.set(
      l.namaKomoditas,
      (luasPerKomoditas.get(l.namaKomoditas) ?? 0) + serang
    );
    luasPerOpt.set(l.namaOptLokal, (luasPerOpt.get(l.namaOptLokal) ?? 0) + serang);
  }

  let komoditasUtama = '-';
  let maksKom = -1;
  luasPerKomoditas.forEach((luas, nama) => {
    if (luas > maksKom) {
      maksKom = luas;
      komoditasUtama = nama;
    }
  });

  let optDominan = '-';
  let maksOpt = -1;
  luasPerOpt.forEach((luas, nama) => {
    if (luas > maksOpt) {
      maksOpt = luas;
      optDominan = nama;
    }
  });

  const pembulatan = (n: number) => Math.round(n * 100) / 100;
  const statusListEksplisit =
    filter.statusList && filter.statusList.length > 0 ? filter.statusList : null;
  const laporanDitolak =
    statusListEksplisit && !statusListEksplisit.includes('ditolak')
      ? 0
      : lintasStatus.filter((l) => l.status === 'ditolak').length;

  return {
    totalLaporan: daftar.length,
    laporanMenunggu,
    laporanTerverifikasi,
    laporanDitolak,
    totalLuasAmatan: pembulatan(totalLuasAmatan),
    totalLuasTerdampak: pembulatan(totalLuasRingan + totalLuasBerat),
    totalLuasBerat: pembulatan(totalLuasBerat),
    totalLuasRinganSedang: pembulatan(totalLuasRingan),
    totalLuasTerkendali: pembulatan(totalLuasTerkendali),
    jumlahTitikKritis,
    jumlahTitikWaspada,
    jumlahTitikRingan,
    jumlahKabupatenTerdampak: kabSet.size,
    komoditasUtama,
    optDominan,
  };
}

export function hitungTrenBulananDariLaporan(
  semuaLaporan: Laporan[],
  tahun: number,
  filter: FilterLaporan = {}
): BarisTrenBulanan[] {
  const filterTahunan: FilterLaporan = {
    ...filter,
    modePeriode: 'tahunan',
    tahun,
    triwulan: undefined,
    semester: undefined,
  };
  const daftar = saringDaftarLaporan(semuaLaporan, filterTahunan);

  const petaBulan = new Map<number, { total: number; berat: number }>();
  for (let i = 0; i < 12; i += 1) {
    petaBulan.set(i, { total: 0, berat: 0 });
  }

  let bulanTerakhirTerisi = -1;
  for (const l of daftar) {
    const wita = bulanTahunWita(l.dibuatPada);
    const indeks =
      wita && wita.tahun === tahun
        ? wita.bulanIndex
        : Math.min(11, Math.max(0, (l.triwulan - 1) * 3 + 1));
    const entri = petaBulan.get(indeks) ?? { total: 0, berat: 0 };
    entri.total += l.luasRingan + l.luasBerat;
    entri.berat += l.luasBerat;
    petaBulan.set(indeks, entri);
    if (indeks > bulanTerakhirTerisi) bulanTerakhirTerisi = indeks;
  }

  return NAMA_BULAN_ID.map((bulan, idx) => {
    const nilai = petaBulan.get(idx) ?? { total: 0, berat: 0 };
    return {
      bulan,
      indeksBulan: idx + 1,
      luasTotal: Math.round(nilai.total * 100) / 100,
      luasBerat: Math.round(nilai.berat * 100) / 100,
      aktif: bulanTerakhirTerisi >= 0 && idx === bulanTerakhirTerisi,
    };
  });
}

export function hitungIntensitasKomoditasDariLaporan(
  semuaLaporan: Laporan[],
  daftarKomoditas: Komoditas[],
  filter: FilterLaporan
): BarisIntensitasKomoditas[] {
  const daftar = saringDaftarLaporan(semuaLaporan, filter);
  const baris: BarisIntensitasKomoditas[] = daftarKomoditas.map((kom) => {
    const milik = daftar.filter((l) => l.komoditasId === kom.id);
    let ringan = 0;
    let berat = 0;
    const hitungOpt = new Map<string, number>();

    for (const m of milik) {
      ringan += m.luasRingan;
      berat += m.luasBerat;
      hitungOpt.set(
        m.namaOptLokal,
        (hitungOpt.get(m.namaOptLokal) ?? 0) + m.luasRingan + m.luasBerat
      );
    }

    let optUtama = '-';
    let maks = -1;
    hitungOpt.forEach((v, k) => {
      if (v > maks) {
        maks = v;
        optUtama = k;
      }
    });

    return {
      komoditasId: kom.id,
      namaKomoditas: kom.nama,
      luasRinganSedang: Math.round(ringan * 100) / 100,
      luasBerat: Math.round(berat * 100) / 100,
      luasTotal: Math.round((ringan + berat) * 100) / 100,
      optUtama,
    };
  });

  baris.sort((a, b) => b.luasTotal - a.luasTotal);
  return baris;
}

export function hitungKerentananWilayahDariLaporan(
  semuaLaporan: Laporan[],
  semuaWilayah: Wilayah[],
  konfigurasiKlasifikasi: KonfigurasiKlasifikasi,
  filter: FilterLaporan
): BarisKerentananWilayah[] {
  const daftar = saringDaftarLaporan(semuaLaporan, filter);
  const kabupatenList = semuaWilayah.filter((w) => w.tipe === 'kabupaten');

  const baris: BarisKerentananWilayah[] = [];
  for (const kab of kabupatenList) {
    const milik = daftar.filter((l) => l.kabupatenId === kab.id);
    if (milik.length === 0) continue;

    let luasAmatan = 0;
    let luasSerangan = 0;
    let luasBerat = 0;
    let terparah = milik[0];

    for (const m of milik) {
      const serang = m.luasRingan + m.luasBerat;
      luasAmatan += m.luasAmatan;
      luasSerangan += serang;
      luasBerat += m.luasBerat;
      if (m.intensitasPersen > terparah.intensitasPersen) {
        terparah = m;
      }
    }

    const intensitasRata = hitungIntensitas(
      luasSerangan - luasBerat,
      luasBerat,
      luasAmatan
    );
    const tingkatAncaman = klasifikasiTingkat(
      Math.max(intensitasRata, terparah.intensitasPersen),
      konfigurasiKlasifikasi
    );

    baris.push({
      kabupatenId: kab.id,
      namaKabupaten: kab.nama,
      kecamatanTerparah: terparah.namaKecamatan,
      komoditasUtama: terparah.namaKomoditas,
      namaOptLokal: terparah.namaOptLokal,
      namaOptIlmiah: terparah.namaOptIlmiah,
      luasSerangan: Math.round(luasSerangan * 100) / 100,
      luasBerat: Math.round(luasBerat * 100) / 100,
      intensitasRata,
      tingkatAncaman,
      tindakanLapangan:
        terparah.rekomendasiKultur ||
        terparah.rekomendasiHayati ||
        'Pemantauan intensif berkala',
    });
  }

  baris.sort((a, b) => b.luasSerangan - a.luasSerangan);
  return baris;
}

export function hitungMatriksKabupatenDariLaporan(
  semuaLaporan: Laporan[],
  semuaWilayah: Wilayah[],
  filter: FilterLaporan
): BarisMatriksKabupaten[] {
  const daftar = saringDaftarLaporan(semuaLaporan, filter);
  const kabupatenList = semuaWilayah.filter((w) => w.tipe === 'kabupaten');

  return kabupatenList.map((kab, idx) => {
    const milik = daftar.filter((l) => l.kabupatenId === kab.id);
    const kecAll = semuaWilayah
      .filter((w) => w.tipe === 'kecamatan' && w.parentId === kab.id)
      .map((k) => k.nama);

    let luasAmatan = 0;
    let luasRingan = 0;
    let luasBerat = 0;
    let luasTerkendali = 0;
    let utama: Laporan | undefined = milik[0];

    for (const m of milik) {
      luasAmatan += m.luasAmatan;
      luasRingan += m.luasRingan;
      luasBerat += m.luasBerat;
      luasTerkendali += m.luasTerkendali;
      if (utama && m.luasRingan + m.luasBerat > utama.luasRingan + utama.luasBerat) {
        utama = m;
      }
    }

    const persenRingan =
      luasAmatan > 0 ? Math.round((luasRingan / luasAmatan) * 1000) / 10 : 0;
    const persenBerat =
      luasAmatan > 0 ? Math.round((luasBerat / luasAmatan) * 1000) / 10 : 0;

    return {
      no: idx + 1,
      kabupatenId: kab.id,
      namaKabupaten: kab.nama,
      daftarKecamatan: kecAll.join(', ') || '-',
      komoditasUtama: utama ? utama.namaKomoditas : 'Belum ada laporan periode ini',
      optDominanLokal: utama ? utama.namaOptLokal : '-',
      optDominanIlmiah: utama ? utama.namaOptIlmiah : '-',
      luasAmatan: Math.round(luasAmatan * 100) / 100,
      luasRingan: Math.round(luasRingan * 100) / 100,
      persenRingan,
      luasBerat: Math.round(luasBerat * 100) / 100,
      persenBerat,
      totalSerangan: Math.round((luasRingan + luasBerat) * 100) / 100,
      luasTerkendali: Math.round(luasTerkendali * 100) / 100,
    };
  });
}

export function hitungTrenTriwulanKomoditasDariLaporan(
  semuaLaporan: Laporan[],
  daftarKomoditas: Komoditas[],
  tahun: number,
  filter: FilterLaporan = {}
): BarisTrenTriwulanKomoditas[] {
  const filterTahunan: FilterLaporan = {
    ...filter,
    modePeriode: 'tahunan',
    tahun,
    triwulan: undefined,
    semester: undefined,
  };
  const daftar = saringDaftarLaporan(semuaLaporan, filterTahunan);

  const triwulanList: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
  const labelRomawi = ['TW I', 'TW II', 'TW III', 'TW IV'];

  return triwulanList.map((tw, i) => {
    const baris: BarisTrenTriwulanKomoditas = {
      triwulanLabel: `${labelRomawi[i]} ${tahun}`,
    };
    for (const kom of daftarKomoditas) {
      const totalKom = daftar
        .filter((l) => l.triwulan === tw && l.komoditasId === kom.id)
        .reduce((acc, cur) => acc + cur.luasRingan + cur.luasBerat, 0);
      baris[kom.nama] = Math.round(totalKom * 100) / 100;
    }
    return baris;
  });
}
