// ============================================================================
// SIPUT-KALTIM: MASTER DATA ADMINISTRATIF KALIMANTAN TIMUR
// Berisi 10 Kabupaten/Kota, 105 Kecamatan, dan 1.012+ Kampung/Desa/Kelurahan
// Resmi sesuai Kemendagri & BPS Kalimantan Timur
// ============================================================================

export interface MasterWilayahEntry {
  kode: string;
  nama: string;
  tipe: 'kabupaten' | 'kecamatan' | 'desa';
  parentKode?: string;
  latPusat?: number;
  lngPusat?: number;
}

export const MASTER_KABUPATEN: MasterWilayahEntry[] = [
  { kode: 'kab-paser', nama: 'Kab. Paser', tipe: 'kabupaten', latPusat: -1.9019, lngPusat: 116.1965 },
  { kode: 'kab-ppu', nama: 'Kab. Penajam Paser Utara', tipe: 'kabupaten', latPusat: -1.3005, lngPusat: 116.7164 },
  { kode: 'kab-kubar', nama: 'Kab. Kutai Barat', tipe: 'kabupaten', latPusat: -0.2367, lngPusat: 115.7764 },
  { kode: 'kab-kukar', nama: 'Kab. Kutai Kartanegara', tipe: 'kabupaten', latPusat: -0.4402, lngPusat: 116.9814 },
  { kode: 'kab-kutim', nama: 'Kab. Kutai Timur', tipe: 'kabupaten', latPusat: 0.8531, lngPusat: 117.5906 },
  { kode: 'kab-berau', nama: 'Kab. Berau', tipe: 'kabupaten', latPusat: 2.1502, lngPusat: 117.4945 },
  { kode: 'kab-mahulu', nama: 'Kab. Mahakam Ulu', tipe: 'kabupaten', latPusat: 0.5256, lngPusat: 115.2289 },
  { kode: 'kota-balikpapan', nama: 'Kota Balikpapan', tipe: 'kabupaten', latPusat: -1.1502, lngPusat: 116.8689 },
  { kode: 'kota-samarinda', nama: 'Kota Samarinda', tipe: 'kabupaten', latPusat: -0.4518, lngPusat: 117.1856 },
  { kode: 'kota-bontang', nama: 'Kota Bontang', tipe: 'kabupaten', latPusat: 0.1336, lngPusat: 117.4752 },
];

export const MASTER_KECAMATAN: MasterWilayahEntry[] = [
  {
    "kode": "kec-paser-tanahgrogot",
    "nama": "Tanah Grogot",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-kuaro",
    "nama": "Kuaro",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-longikis",
    "nama": "Long Ikis",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-longkali",
    "nama": "Long Kali",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-pasirbelengkong",
    "nama": "Pasir Belengkong",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-batusopang",
    "nama": "Batu Sopang",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-batuengau",
    "nama": "Batu Engau",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-muarasamu",
    "nama": "Muara Samu",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-muarakomam",
    "nama": "Muara Komam",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-paser-tanjungharapan",
    "nama": "Tanjung Harapan",
    "tipe": "kecamatan",
    "parentKode": "kab-paser"
  },
  {
    "kode": "kec-ppu-penajam",
    "nama": "Penajam",
    "tipe": "kecamatan",
    "parentKode": "kab-ppu"
  },
  {
    "kode": "kec-ppu-waru",
    "nama": "Waru",
    "tipe": "kecamatan",
    "parentKode": "kab-ppu"
  },
  {
    "kode": "kec-ppu-babulu",
    "nama": "Babulu",
    "tipe": "kecamatan",
    "parentKode": "kab-ppu"
  },
  {
    "kode": "kec-ppu-sepaku",
    "nama": "Sepaku",
    "tipe": "kecamatan",
    "parentKode": "kab-ppu"
  },
  {
    "kode": "kec-kukar-tenggarong",
    "nama": "Tenggarong",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-tenggarongseberang",
    "nama": "Tenggarong Seberang",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-loajanan",
    "nama": "Loa Janan",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-loakulu",
    "nama": "Loa Kulu",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-muarabadak",
    "nama": "Muara Badak",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-marangkayu",
    "nama": "Marang Kayu",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-samboja",
    "nama": "Samboja",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-sambojabarat",
    "nama": "Samboja Barat",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-muarajawa",
    "nama": "Muara Jawa",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-sangasanga",
    "nama": "Sanga-Sanga",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-anggana",
    "nama": "Anggana",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-sebulu",
    "nama": "Sebulu",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-kotabangun",
    "nama": "Kota Bangun",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-kotabangundarat",
    "nama": "Kota Bangun Darat",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-kenohan",
    "nama": "Kenohan",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-kembangjanggut",
    "nama": "Kembang Janggut",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-tabang",
    "nama": "Tabang",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-muaramuntai",
    "nama": "Muara Muntai",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-muarawis",
    "nama": "Muara Wis",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kukar-muarakaman",
    "nama": "Muara Kaman",
    "tipe": "kecamatan",
    "parentKode": "kab-kukar"
  },
  {
    "kode": "kec-kubar-barongtongkok",
    "nama": "Barong Tongkok",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-melak",
    "nama": "Melak",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-sekolaqdarat",
    "nama": "Sekolaq Darat",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-linggangbigung",
    "nama": "Linggang Bigung",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-damai",
    "nama": "Damai",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-nyuatan",
    "nama": "Nyuatan",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-muaralawa",
    "nama": "Muara Lawa",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-muarapahu",
    "nama": "Muara Pahu",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-jempang",
    "nama": "Jempang",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-bongan",
    "nama": "Bongan",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-siluqngurai",
    "nama": "Siluq Ngurai",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-bentianbesar",
    "nama": "Bentian Besar",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-penyinggahan",
    "nama": "Penyinggahan",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-mookmanaar",
    "nama": "Mook Manaar Bulatn",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-tering",
    "nama": "Tering",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kubar-manorbulatn",
    "nama": "Manor Bulatn",
    "tipe": "kecamatan",
    "parentKode": "kab-kubar"
  },
  {
    "kode": "kec-kutim-sangattautara",
    "nama": "Sangatta Utara",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-sangattaselatan",
    "nama": "Sangatta Selatan",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-bengalon",
    "nama": "Bengalon",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-telukpandan",
    "nama": "Teluk Pandan",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-rantaupulung",
    "nama": "Rantau Pulung",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-muarawahau",
    "nama": "Muara Wahau",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-kongbeng",
    "nama": "Kongbeng",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-telen",
    "nama": "Telen",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-batuampar",
    "nama": "Batu Ampar",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-muarabengkal",
    "nama": "Muara Bengkal",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-muaraancalong",
    "nama": "Muara Ancalong",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-longmesangat",
    "nama": "Long Mesangat",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-busang",
    "nama": "Busang",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-kaubun",
    "nama": "Kaubun",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-kaliorang",
    "nama": "Kaliorang",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-karangan",
    "nama": "Karangan",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-sandaran",
    "nama": "Sandaran",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-kutim-sangkulirang",
    "nama": "Sangkulirang",
    "tipe": "kecamatan",
    "parentKode": "kab-kutim"
  },
  {
    "kode": "kec-berau-tanjungredeb",
    "nama": "Tanjung Redeb",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-sambaliung",
    "nama": "Sambaliung",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-gunungtabur",
    "nama": "Gunung Tabur",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-telukbayur",
    "nama": "Teluk Bayur",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-segah",
    "nama": "Segah",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-kelay",
    "nama": "Kelay",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-talisayan",
    "nama": "Talisayan",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-tabalar",
    "nama": "Tabalar",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-biatan",
    "nama": "Biatan",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-batuputih",
    "nama": "Batu Putih",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-bidukbiduk",
    "nama": "Biduk-Biduk",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-pulauderawan",
    "nama": "Pulau Derawan",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-berau-maratua",
    "nama": "Maratua",
    "tipe": "kecamatan",
    "parentKode": "kab-berau"
  },
  {
    "kode": "kec-mahulu-longbagun",
    "nama": "Long Bagun",
    "tipe": "kecamatan",
    "parentKode": "kab-mahulu"
  },
  {
    "kode": "kec-mahulu-longhubung",
    "nama": "Long Hubung",
    "tipe": "kecamatan",
    "parentKode": "kab-mahulu"
  },
  {
    "kode": "kec-mahulu-laham",
    "nama": "Laham",
    "tipe": "kecamatan",
    "parentKode": "kab-mahulu"
  },
  {
    "kode": "kec-mahulu-longpahangai",
    "nama": "Long Pahangai",
    "tipe": "kecamatan",
    "parentKode": "kab-mahulu"
  },
  {
    "kode": "kec-mahulu-longapari",
    "nama": "Long Apari",
    "tipe": "kecamatan",
    "parentKode": "kab-mahulu"
  },
  {
    "kode": "kec-bpp-balikpapankota",
    "nama": "Balikpapan Kota",
    "tipe": "kecamatan",
    "parentKode": "kota-balikpapan"
  },
  {
    "kode": "kec-bpp-balikpapanselatan",
    "nama": "Balikpapan Selatan",
    "tipe": "kecamatan",
    "parentKode": "kota-balikpapan"
  },
  {
    "kode": "kec-bpp-balikpapantengah",
    "nama": "Balikpapan Tengah",
    "tipe": "kecamatan",
    "parentKode": "kota-balikpapan"
  },
  {
    "kode": "kec-bpp-balikpapanutara",
    "nama": "Balikpapan Utara",
    "tipe": "kecamatan",
    "parentKode": "kota-balikpapan"
  },
  {
    "kode": "kec-bpp-balikpapanbarat",
    "nama": "Balikpapan Barat",
    "tipe": "kecamatan",
    "parentKode": "kota-balikpapan"
  },
  {
    "kode": "kec-bpp-balikpapantimur",
    "nama": "Balikpapan Timur",
    "tipe": "kecamatan",
    "parentKode": "kota-balikpapan"
  },
  {
    "kode": "kec-smd-samarindakota",
    "nama": "Samarinda Kota",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-samarindaulu",
    "nama": "Samarinda Ulu",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-samarindailir",
    "nama": "Samarinda Ilir",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-samarindaseberang",
    "nama": "Samarinda Seberang",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-sungaikunjang",
    "nama": "Sungai Kunjang",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-sungaipinang",
    "nama": "Sungai Pinang",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-palaran",
    "nama": "Palaran",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-samarindautara",
    "nama": "Samarinda Utara",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-sambutan",
    "nama": "Sambutan",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-smd-loajananilir",
    "nama": "Loa Janan Ilir",
    "tipe": "kecamatan",
    "parentKode": "kota-samarinda"
  },
  {
    "kode": "kec-btg-bontangutara",
    "nama": "Bontang Utara",
    "tipe": "kecamatan",
    "parentKode": "kota-bontang"
  },
  {
    "kode": "kec-btg-bontangselatan",
    "nama": "Bontang Selatan",
    "tipe": "kecamatan",
    "parentKode": "kota-bontang"
  },
  {
    "kode": "kec-btg-bontangbarat",
    "nama": "Bontang Barat",
    "tipe": "kecamatan",
    "parentKode": "kota-bontang"
  }
];

export const MASTER_DESA: MasterWilayahEntry[] = [
  {
    "kode": "desa-6401010009",
    "nama": "Desa Samurangau",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010010",
    "nama": "Desa Busui",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010011",
    "nama": "Desa Batu Kajang",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010012",
    "nama": "Desa Legai",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010013",
    "nama": "Desa Sungai Terik",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010014",
    "nama": "Desa Kasungai",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010015",
    "nama": "Desa Rantau Buta",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010016",
    "nama": "Desa Rantau Layung",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401010017",
    "nama": "Desa Songka",
    "tipe": "desa",
    "parentKode": "kec-paser-batusopang"
  },
  {
    "kode": "desa-6401011001",
    "nama": "Desa Tanjung Pinang",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011002",
    "nama": "Desa Rantau Atas",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011003",
    "nama": "Desa Libur Dinding",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011004",
    "nama": "Desa Luan/Dilibinti",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011005",
    "nama": "Desa Suweto",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011007",
    "nama": "Desa Biu",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011008",
    "nama": "Desa Rantau Bintungan",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401011009",
    "nama": "Desa Muara Andeh",
    "tipe": "desa",
    "parentKode": "kec-paser-muarasamu"
  },
  {
    "kode": "desa-6401021001",
    "nama": "Desa Kerang",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021002",
    "nama": "Desa Tempakan",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021004",
    "nama": "Desa Lomu",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021005",
    "nama": "Desa Segendang",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021006",
    "nama": "Desa Riwang",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021007",
    "nama": "Desa Langgai",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021008",
    "nama": "Desa Petangis",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021009",
    "nama": "Desa Kerang Dayo",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021010",
    "nama": "Desa Saing Prupuk",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021011",
    "nama": "Desa Bai Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021012",
    "nama": "Desa Pengguren Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401021013",
    "nama": "Desa Tebru Paser Damai",
    "tipe": "desa",
    "parentKode": "kec-paser-batuengau"
  },
  {
    "kode": "desa-6401022001",
    "nama": "Desa Tunes Keladen",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401022002",
    "nama": "Desa Tanjung Aru",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401022003",
    "nama": "Desa Labuangkalo",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401022004",
    "nama": "Desa Selengot",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401022005",
    "nama": "Desa Lori",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401022006",
    "nama": "Desa Random",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401022007",
    "nama": "Desa Senipah",
    "tipe": "desa",
    "parentKode": "kec-paser-tanjungharapan"
  },
  {
    "kode": "desa-6401030002",
    "nama": "Desa Bekoso",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030003",
    "nama": "Desa Damit",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030004",
    "nama": "Desa Sangkuriman",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030005",
    "nama": "Desa Suatang",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030006",
    "nama": "Desa Keresik Bura",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030007",
    "nama": "Desa Pasir Belengkong",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030008",
    "nama": "Desa Seniung Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030009",
    "nama": "Desa Suliliran Baru",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030010",
    "nama": "Desa Suliliran",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030011",
    "nama": "Desa Laburan Baru",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030012",
    "nama": "Desa Laburan",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030013",
    "nama": "Desa Olong Pinang",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030014",
    "nama": "Desa Sunge Batu",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401030015",
    "nama": "Desa Suatang Keteban",
    "tipe": "desa",
    "parentKode": "kec-paser-pasirbelengkong"
  },
  {
    "kode": "desa-6401040001",
    "nama": "Desa Janju",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040002",
    "nama": "Desa Sempulang",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040003",
    "nama": "Desa Tepian Batang",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040004",
    "nama": "Desa Tanah Grogot",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040005",
    "nama": "Desa Tanah Periuk",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040006",
    "nama": "Desa Pepara",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040007",
    "nama": "Desa Sungai Tuak",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040008",
    "nama": "Desa Rantau Panjang",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040009",
    "nama": "Desa Jone",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040010",
    "nama": "Desa Padang Pengrapat",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040011",
    "nama": "Desa Muara Pasir",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040012",
    "nama": "Desa Prepat",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040013",
    "nama": "Desa Pulau Rantau",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040014",
    "nama": "Desa Sungai Langir",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040015",
    "nama": "Desa Tapis",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401040016",
    "nama": "Desa Senaken",
    "tipe": "desa",
    "parentKode": "kec-paser-tanahgrogot"
  },
  {
    "kode": "desa-6401050001",
    "nama": "Desa Lolo",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050002",
    "nama": "Desa Kuaro",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050003",
    "nama": "Desa Pondong Baru",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050004",
    "nama": "Desa Rangan",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050005",
    "nama": "Desa Modang",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050006",
    "nama": "Desa Pasir Mayang",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050007",
    "nama": "Desa Sandeley",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050008",
    "nama": "Desa Kerta Bumi",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050009",
    "nama": "Desa Padang Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050010",
    "nama": "Desa Harapan Baru",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050011",
    "nama": "Desa Kendarom",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050012",
    "nama": "Desa Klempang Sari",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401050013",
    "nama": "Desa Keluang Paser Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-kuaro"
  },
  {
    "kode": "desa-6401060001",
    "nama": "Desa Samuntai",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060002",
    "nama": "Desa Lombok",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060003",
    "nama": "Desa Sawit Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060004",
    "nama": "Desa Pait",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060005",
    "nama": "Desa Tajur",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060006",
    "nama": "Desa Muara Adang",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060007",
    "nama": "Desa Teluk Waru",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060008",
    "nama": "Desa Bukit Seloka",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060009",
    "nama": "Desa Krayan Makmur",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060010",
    "nama": "Desa Krayan Sentosa",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060011",
    "nama": "Desa Krayan Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060012",
    "nama": "Desa Jemparing",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060013",
    "nama": "Desa Kayungo",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060014",
    "nama": "Desa Krayan Bahagia",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060015",
    "nama": "Desa Long Ikis",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060016",
    "nama": "Desa Olung",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060017",
    "nama": "Desa Kayungo Sari",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060018",
    "nama": "Desa Kerta Bhakti",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060019",
    "nama": "Desa Sekurou Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060020",
    "nama": "Desa Long Gelang",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060021",
    "nama": "Desa Tiwei",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060022",
    "nama": "Desa Belimbing",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060023",
    "nama": "Desa Adang Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060024",
    "nama": "Desa Tajer Mulya",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401060026",
    "nama": "Desa Atang Pait",
    "tipe": "desa",
    "parentKode": "kec-paser-longikis"
  },
  {
    "kode": "desa-6401070001",
    "nama": "Desa Muara Langon",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070002",
    "nama": "Desa Muara Komam",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070003",
    "nama": "Desa Batu Butok",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070004",
    "nama": "Desa Uko",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070005",
    "nama": "Desa Muara Kuaro",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070006",
    "nama": "Desa Prayon",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070007",
    "nama": "Desa Binangon",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070008",
    "nama": "Desa Lusan",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070009",
    "nama": "Desa Muara Payang",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070010",
    "nama": "Desa Long Sayo",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070011",
    "nama": "Desa Swan Slutung",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070012",
    "nama": "Desa Sekuan Makmur",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401070013",
    "nama": "Desa Selerong",
    "tipe": "desa",
    "parentKode": "kec-paser-muarakomam"
  },
  {
    "kode": "desa-6401080001",
    "nama": "Desa Muara Telake",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080002",
    "nama": "Desa Sebakung",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080003",
    "nama": "Desa Sebakung Taka",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080004",
    "nama": "Desa Sebakung Makmur",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080005",
    "nama": "Desa Muara Adang Ii",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080006",
    "nama": "Desa Long Kali",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080007",
    "nama": "Desa Bente/Tualan",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080008",
    "nama": "Desa Mendik",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080009",
    "nama": "Desa Mendik Makmur",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080010",
    "nama": "Desa Mendik Bhakti",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080011",
    "nama": "Desa Mendik Karya",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080013",
    "nama": "Desa Muara Pias",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080014",
    "nama": "Desa Muara Toyu",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080015",
    "nama": "Desa Perkuwin",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080016",
    "nama": "Desa Pinang Jatus",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080017",
    "nama": "Desa Muara Lambakan",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080018",
    "nama": "Desa Kepala Telake",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080019",
    "nama": "Desa Maruat",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080020",
    "nama": "Desa Petiku",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080021",
    "nama": "Desa Makmur Jaya",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080022",
    "nama": "Desa Putang",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6401080023",
    "nama": "Desa Gunung Putar",
    "tipe": "desa",
    "parentKode": "kec-paser-longkali"
  },
  {
    "kode": "desa-6402010002",
    "nama": "Kampung Tanjung Soke",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010003",
    "nama": "Kampung Pereng Talik",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010004",
    "nama": "Kampung Deraya",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010006",
    "nama": "Kampung Muara Siram",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010007",
    "nama": "Kampung Siram Makmur",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010008",
    "nama": "Kampung Siram Jaya",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010009",
    "nama": "Kampung Resak",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010010",
    "nama": "Kampung Tanjung Sari",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010011",
    "nama": "Kampung Jambuk Makmur",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010012",
    "nama": "Kampung Bukit Harapan",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010013",
    "nama": "Kampung Jambuk",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010014",
    "nama": "Kampung Muara Gusik",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010015",
    "nama": "Kampung Penawai",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402010016",
    "nama": "Kampung Muara Kedang",
    "tipe": "desa",
    "parentKode": "kec-kubar-bongan"
  },
  {
    "kode": "desa-6402020001",
    "nama": "Kampung Pentat",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020002",
    "nama": "Kampung Bekokong Makmur",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020003",
    "nama": "Kampung Pulai Lanting",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020004",
    "nama": "Kampung Tanjung Jan",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020005",
    "nama": "Kampung Tanjung Isuy",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020006",
    "nama": "Kampung Muara Nayan",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020007",
    "nama": "Kampung Lembonah",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020008",
    "nama": "Kampung Mancong",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020009",
    "nama": "Kampung Perigiq",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020010",
    "nama": "Kampung Tanjung Jone",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020011",
    "nama": "Kampung Muara Ohong",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402020012",
    "nama": "Kampung Muara Tae",
    "tipe": "desa",
    "parentKode": "kec-kubar-jempang"
  },
  {
    "kode": "desa-6402030001",
    "nama": "Kampung Loa Deras",
    "tipe": "desa",
    "parentKode": "kec-kubar-penyinggahan"
  },
  {
    "kode": "desa-6402030002",
    "nama": "Kampung Minta",
    "tipe": "desa",
    "parentKode": "kec-kubar-penyinggahan"
  },
  {
    "kode": "desa-6402030003",
    "nama": "Kampung Penyinggahan Ilir",
    "tipe": "desa",
    "parentKode": "kec-kubar-penyinggahan"
  },
  {
    "kode": "desa-6402030004",
    "nama": "Kampung Tanjung Haur",
    "tipe": "desa",
    "parentKode": "kec-kubar-penyinggahan"
  },
  {
    "kode": "desa-6402030005",
    "nama": "Kampung Penyinggahan Ulu",
    "tipe": "desa",
    "parentKode": "kec-kubar-penyinggahan"
  },
  {
    "kode": "desa-6402030006",
    "nama": "Kampung Bakung",
    "tipe": "desa",
    "parentKode": "kec-kubar-penyinggahan"
  },
  {
    "kode": "desa-6402040016",
    "nama": "Kampung Dasaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040017",
    "nama": "Kampung Jerang Dayak",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040019",
    "nama": "Kampung Jerang Melayu",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040020",
    "nama": "Kampung Tanjung Laong",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040021",
    "nama": "Kampung Teluk Tempudau",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040022",
    "nama": "Kampung Muara Baroh",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040023",
    "nama": "Kampung Sebelang",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040024",
    "nama": "Kampung Tepian Ulaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040025",
    "nama": "Kampung Tanjung Pagar",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040029",
    "nama": "Kampung Gunung Bayan",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402040030",
    "nama": "Kampung Muara Beloan",
    "tipe": "desa",
    "parentKode": "kec-kubar-muarapahu"
  },
  {
    "kode": "desa-6402041001",
    "nama": "Kampung Lendian Liang Nayuk",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041002",
    "nama": "Kampung Kendisiq",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041003",
    "nama": "Kampung Penawang",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041004",
    "nama": "Kampung Rikong",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041005",
    "nama": "Kampung Kiaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041006",
    "nama": "Kampung Tendiq",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041007",
    "nama": "Kampung Kenyanyan",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041009",
    "nama": "Kampung Bentas",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041010",
    "nama": "Kampung Muara Kelawit",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041012",
    "nama": "Kampung Sansang",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041013",
    "nama": "Kampung Kaliq",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041014",
    "nama": "Kampung Tana Mea",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041015",
    "nama": "Kampung Tebisaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402041016",
    "nama": "Kampung Muara Ponaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-siluqngurai"
  },
  {
    "kode": "desa-6402050010",
    "nama": "Kampung Muara Begai",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050011",
    "nama": "Kampung Lotaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050012",
    "nama": "Kampung Payang",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050013",
    "nama": "Kampung Cempedas",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050014",
    "nama": "Kampung Dingin",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050015",
    "nama": "Kampung Muara Lawa",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050016",
    "nama": "Kampung Lambing",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402050017",
    "nama": "Kampung Benggeris",
    "tipe": "desa",
    "parentKode": "kec-kubar-muaralawa"
  },
  {
    "kode": "desa-6402051002",
    "nama": "Kampung Randa Empas",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402051004",
    "nama": "Kampung Sambung",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402051005",
    "nama": "Kampung Jelmu Sibak",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402051006",
    "nama": "Kampung Anan Jaya",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402051007",
    "nama": "Kampung Suakong",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402051008",
    "nama": "Kampung Dilang Puti",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402051009",
    "nama": "Kampung Penarung",
    "tipe": "desa",
    "parentKode": "kec-kubar-bentianbesar"
  },
  {
    "kode": "desa-6402060001",
    "nama": "Kampung Besik",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060002",
    "nama": "Kampung Bermai",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060003",
    "nama": "Kampung Muara Nilik",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060004",
    "nama": "Kampung Mantar",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060005",
    "nama": "Kampung Muara Bomboy",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060006",
    "nama": "Kampung Damai Seberang",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060007",
    "nama": "Kampung Mendika",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060008",
    "nama": "Kampung Damai Kota",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060009",
    "nama": "Kampung Lumpat Dahuq",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060010",
    "nama": "Kampung Muara Tokong",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060011",
    "nama": "Kampung Jengan Danum",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060012",
    "nama": "Kampung Keay",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060013",
    "nama": "Kampung Tepulang",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060015",
    "nama": "Kampung Muara Nyahing",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060016",
    "nama": "Kampung Sempatn",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402060017",
    "nama": "Kampung Kelian",
    "tipe": "desa",
    "parentKode": "kec-kubar-damai"
  },
  {
    "kode": "desa-6402061001",
    "nama": "Kampung Dempar",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061002",
    "nama": "Kampung Sentalar",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061003",
    "nama": "Kampung Jontai",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061004",
    "nama": "Kampung Temula",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061005",
    "nama": "Kampung Terajuk",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061006",
    "nama": "Kampung Sembuan",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061007",
    "nama": "Kampung Lakan Bilem",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061008",
    "nama": "Kampung Intu Lingau",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402061010",
    "nama": "Kampung Awai",
    "tipe": "desa",
    "parentKode": "kec-kubar-nyuatan"
  },
  {
    "kode": "desa-6402070001",
    "nama": "Kampung Engkuni Pasek",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070002",
    "nama": "Kampung Mencimai",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070003",
    "nama": "Kampung Rejo Basuki",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070004",
    "nama": "Kampung Sumber Sari",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070005",
    "nama": "Kampung Barong Tongkok",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070006",
    "nama": "Kampung Pepas Eheng",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070008",
    "nama": "Kampung Juhan Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070009",
    "nama": "Kampung Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070010",
    "nama": "Kampung Juaq Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070011",
    "nama": "Kampung Ombau Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070012",
    "nama": "Kampung Ngenyan Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070013",
    "nama": "Kampung Gemuhan Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070014",
    "nama": "Kampung Geleo Baru",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070015",
    "nama": "Kampung Geleo Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070016",
    "nama": "Kampung Ongko Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070017",
    "nama": "Kampung Pepas Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070024",
    "nama": "Kampung Muara Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070025",
    "nama": "Kampung Sendawar",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070026",
    "nama": "Kampung Balok Asa",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070027",
    "nama": "Kampung Simpang Raya",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402070028",
    "nama": "Kampung Belempung Ulaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-barongtongkok"
  },
  {
    "kode": "desa-6402071001",
    "nama": "Kampung Melapeh Baru",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071002",
    "nama": "Kampung Bigung Baru",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071003",
    "nama": "Kampung Purwodadi",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071004",
    "nama": "Kampung Linggang Bigung",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071005",
    "nama": "Kampung Bangun Sari",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071006",
    "nama": "Kampung Linggang Amer",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071007",
    "nama": "Kampung Linggang Mapan",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071008",
    "nama": "Kampung Linggang Melapeh",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071010",
    "nama": "Kampung Linggang Kebut",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402071011",
    "nama": "Kampung Linggang Mencelew",
    "tipe": "desa",
    "parentKode": "kec-kubar-linggangbigung"
  },
  {
    "kode": "desa-6402080001",
    "nama": "Kampung Empas",
    "tipe": "desa",
    "parentKode": "kec-kubar-melak"
  },
  {
    "kode": "desa-6402080002",
    "nama": "Kampung Empakuq",
    "tipe": "desa",
    "parentKode": "kec-kubar-melak"
  },
  {
    "kode": "desa-6402080003",
    "nama": "Kampung Muara Bunyut",
    "tipe": "desa",
    "parentKode": "kec-kubar-melak"
  },
  {
    "kode": "desa-6402080006",
    "nama": "Kampung Melak Ilir",
    "tipe": "desa",
    "parentKode": "kec-kubar-melak"
  },
  {
    "kode": "desa-6402080014",
    "nama": "Kampung Melak Ulu",
    "tipe": "desa",
    "parentKode": "kec-kubar-melak"
  },
  {
    "kode": "desa-6402080020",
    "nama": "Kampung Muara Benangaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-melak"
  },
  {
    "kode": "desa-6402081001",
    "nama": "Kampung Sumber Rejo",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402081002",
    "nama": "Kampung Sekolaq Darat",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402081003",
    "nama": "Kampung Sri Mulyo",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402081004",
    "nama": "Kampung Sekolaq Joleq",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402081005",
    "nama": "Kampung Sumber Bangun",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402081006",
    "nama": "Kampung Sekolaq Oday",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402081007",
    "nama": "Kampung Sekolaq Muliaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-sekolaqdarat"
  },
  {
    "kode": "desa-6402082001",
    "nama": "Kampung Gadur",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082002",
    "nama": "Kampung Sakaq Tada",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082004",
    "nama": "Kampung Sakaq Lotoq",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082005",
    "nama": "Kampung Karangan",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082006",
    "nama": "Kampung Kelumpang",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082007",
    "nama": "Kampung Merayaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082008",
    "nama": "Kampung Linggang Marimun",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082009",
    "nama": "Kampung Muara Batuq",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082010",
    "nama": "Kampung Gunung Rampah",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082011",
    "nama": "Kampung Rambayan",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082012",
    "nama": "Kampung Muara Jawaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082013",
    "nama": "Kampung Abit",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082014",
    "nama": "Kampung Jengan",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082015",
    "nama": "Kampung Muara Kalaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402082016",
    "nama": "Kampung Tondoh",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090011",
    "nama": "Kampung Anah",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090013",
    "nama": "Kampung Muara Leban",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090014",
    "nama": "Kampung Longiram Seberang",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090015",
    "nama": "Kampung Long Iram Ilir",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090016",
    "nama": "Kampung Long Iram Kota",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090017",
    "nama": "Kampung Long Iram Bayan",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090018",
    "nama": "Kampung Suko Mulyo",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090019",
    "nama": "Kampung Long Daliq",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090020",
    "nama": "Kampung Keliway",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090021",
    "nama": "Kampung Ujoh Halang",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402090022",
    "nama": "Kampung Kalian Luar",
    "tipe": "desa",
    "parentKode": "kec-kubar-manorbulatn"
  },
  {
    "kode": "desa-6402091001",
    "nama": "Kampung Purworejo",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091002",
    "nama": "Kampung Kelubaq",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091003",
    "nama": "Kampung Tering Seberang",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091004",
    "nama": "Kampung Tering Lama",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091005",
    "nama": "Kampung Tering Baru",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091009",
    "nama": "Kampung Muara Mujan",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091010",
    "nama": "Kampung Kalian Dalam",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091011",
    "nama": "Kampung Muyup Ilir",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091012",
    "nama": "Kampung Muyut Aket",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091013",
    "nama": "Kampung Gabung Baru",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091014",
    "nama": "Kampung Banjarejo",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6402091015",
    "nama": "Kampung Tering Lama Ulu",
    "tipe": "desa",
    "parentKode": "kec-kubar-tering"
  },
  {
    "kode": "desa-6403010001",
    "nama": "Desa Sei Merdeka",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010002",
    "nama": "Desa Salok Api Darat",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010003",
    "nama": "Desa Tani Bakti",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010004",
    "nama": "Desa Salok Api Laut",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010005",
    "nama": "Desa Ambarawang Darat",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010006",
    "nama": "Desa Argosari",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010007",
    "nama": "Desa Ambarawang Laut",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010008",
    "nama": "Desa Margomulyo",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010009",
    "nama": "Desa Karya Jaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010010",
    "nama": "Desa Tanjung Harapan",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010011",
    "nama": "Desa Wonotirto",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010012",
    "nama": "Desa Sungai Seluang",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010013",
    "nama": "Desa Bukit Raya",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010014",
    "nama": "Desa Beringin Agung",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010015",
    "nama": "Desa Samboja Kuala",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010016",
    "nama": "Desa Sanipah",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010017",
    "nama": "Desa Handil Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010018",
    "nama": "Desa Muara Sembilang",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010019",
    "nama": "Desa Bukit Merdeka",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010020",
    "nama": "Desa Karya Merdeka",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010021",
    "nama": "Desa Teluk Pemedas",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010022",
    "nama": "Desa Kampung Lama",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403010023",
    "nama": "Desa Handil Baru Darat",
    "tipe": "desa",
    "parentKode": "kec-kukar-samboja"
  },
  {
    "kode": "desa-6403020001",
    "nama": "Desa Teluk Dalam",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020002",
    "nama": "Desa Muara Jawa Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020003",
    "nama": "Desa Muara Jawa Tengah",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020004",
    "nama": "Desa Muara Jawa Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020005",
    "nama": "Desa Dondang",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020006",
    "nama": "Desa Tamapole",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020007",
    "nama": "Desa Muara Kembang",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403020008",
    "nama": "Desa Muara Jawa Pesisir",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarajawa"
  },
  {
    "kode": "desa-6403030001",
    "nama": "Desa Jawa",
    "tipe": "desa",
    "parentKode": "kec-kukar-sangasanga"
  },
  {
    "kode": "desa-6403030002",
    "nama": "Desa Sanga Sanga Dalam",
    "tipe": "desa",
    "parentKode": "kec-kukar-sangasanga"
  },
  {
    "kode": "desa-6403030003",
    "nama": "Desa Pendingin",
    "tipe": "desa",
    "parentKode": "kec-kukar-sangasanga"
  },
  {
    "kode": "desa-6403030004",
    "nama": "Desa Sarijaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-sangasanga"
  },
  {
    "kode": "desa-6403030005",
    "nama": "Desa Sanga Sanga Muara",
    "tipe": "desa",
    "parentKode": "kec-kukar-sangasanga"
  },
  {
    "kode": "desa-6403040001",
    "nama": "Desa Batuah",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040002",
    "nama": "Desa Tani Bakti",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040003",
    "nama": "Desa Purwajaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040004",
    "nama": "Desa Loa Janan Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040005",
    "nama": "Desa Loa Duri Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040006",
    "nama": "Desa Bakungan",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040007",
    "nama": "Desa Loa Duri Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403040008",
    "nama": "Desa Tani Harapan",
    "tipe": "desa",
    "parentKode": "kec-kukar-loajanan"
  },
  {
    "kode": "desa-6403050001",
    "nama": "Desa Jonggon Desa",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050002",
    "nama": "Desa Sungai Payang",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050003",
    "nama": "Desa Jembayan",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050004",
    "nama": "Desa Ponoragan",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050005",
    "nama": "Desa Loh Sumber",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050006",
    "nama": "Desa Loa Kulu Kota",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050007",
    "nama": "Desa Rempanga",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050008",
    "nama": "Desa Jonggon Jaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050009",
    "nama": "Desa Margahayu",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050010",
    "nama": "Desa Lung Anai",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050011",
    "nama": "Desa Jembayan Tengah",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050012",
    "nama": "Desa Jembayan Dalam",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050013",
    "nama": "Desa Sepakat",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050014",
    "nama": "Desa Jongkang",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403050015",
    "nama": "Desa Sumber Sari",
    "tipe": "desa",
    "parentKode": "kec-kukar-loakulu"
  },
  {
    "kode": "desa-6403060001",
    "nama": "Desa Perian",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060002",
    "nama": "Desa Muara Leka",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060003",
    "nama": "Desa Muara Aloh",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060004",
    "nama": "Desa Jantur",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060005",
    "nama": "Desa Batuq",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060006",
    "nama": "Desa Rebaq Rinding",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060007",
    "nama": "Desa Muara Muntai Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060008",
    "nama": "Desa Muara Muntai Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060009",
    "nama": "Desa Kayu Batu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060010",
    "nama": "Desa Jantur Selatan",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060011",
    "nama": "Desa Tanjung Batuq Harapan",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060012",
    "nama": "Desa Pulau Harapan",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403060013",
    "nama": "Desa Jantur Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-muaramuntai"
  },
  {
    "kode": "desa-6403070001",
    "nama": "Desa Lebak Cilong",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403070002",
    "nama": "Desa Lebak Mantan",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403070003",
    "nama": "Desa Muara Wis",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403070004",
    "nama": "Desa Sebemban",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403070005",
    "nama": "Desa Melintang",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403070006",
    "nama": "Desa Enggelam",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403070007",
    "nama": "Desa Muara Enggelam",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarawis"
  },
  {
    "kode": "desa-6403080001",
    "nama": "Desa Kota Bangun Iii",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080002",
    "nama": "Desa Kota Bangun Ii",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080003",
    "nama": "Desa Kota Bangun I",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080004",
    "nama": "Desa Wonosari",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080005",
    "nama": "Desa Kedang Ipil",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080006",
    "nama": "Desa Benua Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080007",
    "nama": "Desa Sedulang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080008",
    "nama": "Desa Sukabumi",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080009",
    "nama": "Desa Sarinadi",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080010",
    "nama": "Desa Sumber Sari",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080011",
    "nama": "Desa Kota Bangun Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080012",
    "nama": "Desa Loleng",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080013",
    "nama": "Desa Liang Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080014",
    "nama": "Desa Kota Bangun Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080015",
    "nama": "Desa Pela",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080016",
    "nama": "Desa Muhuran",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080017",
    "nama": "Desa Kota Bangun Seberang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080018",
    "nama": "Desa Kedang Murung",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080019",
    "nama": "Desa Liang Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080020",
    "nama": "Desa Sebelimbingan",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403080021",
    "nama": "Desa Sangkuliman",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangun"
  },
  {
    "kode": "desa-6403090001",
    "nama": "Desa Jahab",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090002",
    "nama": "Desa Bukit Biru",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090003",
    "nama": "Desa Timbau",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090004",
    "nama": "Desa Melayu",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090005",
    "nama": "Desa Loa Ipuh",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090006",
    "nama": "Desa Maluhu",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090007",
    "nama": "Desa Panji",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090008",
    "nama": "Desa Sukarame",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090009",
    "nama": "Desa Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090010",
    "nama": "Desa Mangkurawang",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090011",
    "nama": "Desa Loa Tebu",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090012",
    "nama": "Desa Rapak Lambur",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090013",
    "nama": "Desa Loa Ipuh Darat",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403090014",
    "nama": "Desa Bendang Raya",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarong"
  },
  {
    "kode": "desa-6403100001",
    "nama": "Desa Selerong",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100002",
    "nama": "Desa Tanjung Harapan",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100003",
    "nama": "Desa Beloro",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100005",
    "nama": "Desa Manunggal Daya",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100006",
    "nama": "Desa Sumber Sari",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100007",
    "nama": "Desa Sebulu Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100008",
    "nama": "Desa Segihan",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100009",
    "nama": "Desa Giri Agung",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100010",
    "nama": "Desa Senoni",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100011",
    "nama": "Desa Sebulu Modern",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100012",
    "nama": "Desa Lekaq Kidau",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100013",
    "nama": "Desa Sanggulan",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403100014",
    "nama": "Desa Mekar Jaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-sebulu"
  },
  {
    "kode": "desa-6403110001",
    "nama": "Desa Loa Lepu",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110002",
    "nama": "Desa Teluk Dalam",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110003",
    "nama": "Desa Perjiwa",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110004",
    "nama": "Desa Loa Raya",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110005",
    "nama": "Desa Loa Ulung",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110006",
    "nama": "Desa Embalut",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110007",
    "nama": "Desa Bukit Raya",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110008",
    "nama": "Desa Manunggal Jaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110009",
    "nama": "Desa Bangun Rejo",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110010",
    "nama": "Desa Kerta Buana",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110011",
    "nama": "Desa Separi",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110012",
    "nama": "Desa Bukit Pariaman",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110013",
    "nama": "Desa Buana Jaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110014",
    "nama": "Desa Mulawarman",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110015",
    "nama": "Desa Loa Pari",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110016",
    "nama": "Desa Sukamaju",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110017",
    "nama": "Desa Tanjung Batu",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403110018",
    "nama": "Desa Karang Tunggal",
    "tipe": "desa",
    "parentKode": "kec-kukar-tenggarongseberang"
  },
  {
    "kode": "desa-6403120001",
    "nama": "Desa Sepatin",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120002",
    "nama": "Desa Muara Pantuan",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120003",
    "nama": "Desa Tani Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120004",
    "nama": "Desa Kutai Lama",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120005",
    "nama": "Desa Anggana",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120006",
    "nama": "Desa Sungai Meriam",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120007",
    "nama": "Desa Sidomulyo",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403120008",
    "nama": "Desa Handil Terusan",
    "tipe": "desa",
    "parentKode": "kec-kukar-anggana"
  },
  {
    "kode": "desa-6403130001",
    "nama": "Desa Seliki",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130002",
    "nama": "Desa Salo Palai",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130003",
    "nama": "Desa Muara Badak Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130004",
    "nama": "Desa Muara Badak Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130005",
    "nama": "Desa Tanjung Limau",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130006",
    "nama": "Desa Tanah Datar",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130007",
    "nama": "Desa Badak Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130008",
    "nama": "Desa Suka Damai",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130009",
    "nama": "Desa Gas Alam Badak Satu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130010",
    "nama": "Desa Batu-Batu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130011",
    "nama": "Desa Badak Mekar",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130012",
    "nama": "Desa Salo Cella",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403130013",
    "nama": "Desa Sungai Bawang",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarabadak"
  },
  {
    "kode": "desa-6403140001",
    "nama": "Desa Perangat Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140002",
    "nama": "Desa Bunga Putih",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140003",
    "nama": "Desa Perangat Selatan",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140004",
    "nama": "Desa Makarti",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140005",
    "nama": "Desa Sebuntal",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140006",
    "nama": "Desa Kersik",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140007",
    "nama": "Desa Santan Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140008",
    "nama": "Desa Santan Tengah",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140009",
    "nama": "Desa Santan Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140010",
    "nama": "Desa Sambera Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403140011",
    "nama": "Desa Semangkok",
    "tipe": "desa",
    "parentKode": "kec-kukar-marangkayu"
  },
  {
    "kode": "desa-6403150001",
    "nama": "Desa Benua Puhun",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150002",
    "nama": "Desa Teratak",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150003",
    "nama": "Desa Bunga Jadi",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150004",
    "nama": "Desa Panca Jaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150005",
    "nama": "Desa Sido Mukti",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150006",
    "nama": "Desa Sabintulung",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150007",
    "nama": "Desa Rantau Hempang",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150009",
    "nama": "Desa Muara Kaman Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150010",
    "nama": "Desa Muara Kaman Ulu",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150011",
    "nama": "Desa Tunjungan",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150012",
    "nama": "Desa Muara Siran",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150013",
    "nama": "Desa Sedulang",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150014",
    "nama": "Desa Menamang Kiri",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150015",
    "nama": "Desa Menamang Kanan",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150016",
    "nama": "Desa Lebaho Ulaq",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150017",
    "nama": "Desa Kupang Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150018",
    "nama": "Desa Puan Cepak",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150019",
    "nama": "Desa Bukit Jering",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150020",
    "nama": "Desa Liang Buaya",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403150021",
    "nama": "Desa Cipari Makmur",
    "tipe": "desa",
    "parentKode": "kec-kukar-muarakaman"
  },
  {
    "kode": "desa-6403160001",
    "nama": "Desa Semayang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160002",
    "nama": "Desa Tubuhan",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160003",
    "nama": "Desa Teluk Muda",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160004",
    "nama": "Desa Tuana Tuha",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160005",
    "nama": "Desa Kahala",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160006",
    "nama": "Desa Teluk Bingkai",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160007",
    "nama": "Desa Lamin Pulut",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160008",
    "nama": "Desa Lamin Telihan",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403160009",
    "nama": "Desa Kahala Ilir",
    "tipe": "desa",
    "parentKode": "kec-kukar-kenohan"
  },
  {
    "kode": "desa-6403170001",
    "nama": "Desa Genting Tanah",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170002",
    "nama": "Desa Loa Sakoh",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170003",
    "nama": "Desa Hambau",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170004",
    "nama": "Desa Kembang Janggut",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170005",
    "nama": "Desa Kelekat",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170006",
    "nama": "Desa Pulau Pinang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170007",
    "nama": "Desa Long Beleh Haloq",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170008",
    "nama": "Desa Long Beleh Modang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170009",
    "nama": "Desa Bukit Layang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170010",
    "nama": "Desa Muai",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403170011",
    "nama": "Desa Perdana",
    "tipe": "desa",
    "parentKode": "kec-kukar-kembangjanggut"
  },
  {
    "kode": "desa-6403180001",
    "nama": "Desa Gunung Sari",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180002",
    "nama": "Desa Long Lalang",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180003",
    "nama": "Desa Muara Ritan",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180004",
    "nama": "Desa Ritan Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180006",
    "nama": "Desa Umaq Dian",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180007",
    "nama": "Desa Muara Pedohon",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180008",
    "nama": "Desa Umaq Tukung",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180009",
    "nama": "Desa Kampung Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180010",
    "nama": "Desa Bila Talang",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180011",
    "nama": "Desa Umaq Bekuai",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180012",
    "nama": "Desa Sidomulyo",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180013",
    "nama": "Desa Muara Tiq",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180014",
    "nama": "Desa Tabang Lama",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180015",
    "nama": "Desa Muara Salung",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180016",
    "nama": "Desa Muara Kebaq",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180017",
    "nama": "Desa Muara Belinau",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180018",
    "nama": "Desa Muara Tuboq",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-6403180019",
    "nama": "Desa Tukung Ritan",
    "tipe": "desa",
    "parentKode": "kec-kukar-tabang"
  },
  {
    "kode": "desa-kbd-kedangipil",
    "nama": "Desa Kedang Ipil",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangundarat"
  },
  {
    "kode": "desa-kbd-benuabaru",
    "nama": "Desa Benua Baru",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangundarat"
  },
  {
    "kode": "desa-kbd-sedulang",
    "nama": "Desa Sedulang",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangundarat"
  },
  {
    "kode": "desa-kbd-sukabumi",
    "nama": "Desa Sukabumi",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangundarat"
  },
  {
    "kode": "desa-kbd-wonosari",
    "nama": "Desa Wonosari",
    "tipe": "desa",
    "parentKode": "kec-kukar-kotabangundarat"
  },
  {
    "kode": "desa-sbb-salokapidarat",
    "nama": "Kelurahan Salok Api Darat",
    "tipe": "desa",
    "parentKode": "kec-kukar-sambojabarat"
  },
  {
    "kode": "desa-sbb-salokapilaut",
    "nama": "Kelurahan Salok Api Laut",
    "tipe": "desa",
    "parentKode": "kec-kukar-sambojabarat"
  },
  {
    "kode": "desa-sbb-karyamerdeka",
    "nama": "Kelurahan Karya Merdeka",
    "tipe": "desa",
    "parentKode": "kec-kukar-sambojabarat"
  },
  {
    "kode": "desa-sbb-sungaimerdeka",
    "nama": "Kelurahan Sungai Merdeka",
    "tipe": "desa",
    "parentKode": "kec-kukar-sambojabarat"
  },
  {
    "kode": "desa-sbb-amborawangdarat",
    "nama": "Kelurahan Amborawang Darat",
    "tipe": "desa",
    "parentKode": "kec-kukar-sambojabarat"
  },
  {
    "kode": "desa-sbb-amborawanglaut",
    "nama": "Kelurahan Amborawang Laut",
    "tipe": "desa",
    "parentKode": "kec-kukar-sambojabarat"
  },
  {
    "kode": "desa-6404010001",
    "nama": "Desa Senyiur",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010002",
    "nama": "Desa Kelinjau Ilir",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010003",
    "nama": "Desa Kelinjau Ulu",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010004",
    "nama": "Desa Long Nah",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010005",
    "nama": "Desa Gemar Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010006",
    "nama": "Desa Long Tesak",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010007",
    "nama": "Desa Long Poq Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404010008",
    "nama": "Desa Muara Dun",
    "tipe": "desa",
    "parentKode": "kec-kutim-muaraancalong"
  },
  {
    "kode": "desa-6404011001",
    "nama": "Desa Long Bentuk",
    "tipe": "desa",
    "parentKode": "kec-kutim-busang"
  },
  {
    "kode": "desa-6404011002",
    "nama": "Desa Long Pejeng",
    "tipe": "desa",
    "parentKode": "kec-kutim-busang"
  },
  {
    "kode": "desa-6404011003",
    "nama": "Desa Mekar Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-busang"
  },
  {
    "kode": "desa-6404011004",
    "nama": "Desa Long Lees",
    "tipe": "desa",
    "parentKode": "kec-kutim-busang"
  },
  {
    "kode": "desa-6404011005",
    "nama": "Desa Long Nyelong",
    "tipe": "desa",
    "parentKode": "kec-kutim-busang"
  },
  {
    "kode": "desa-6404011006",
    "nama": "Desa Rantau Sentosa",
    "tipe": "desa",
    "parentKode": "kec-kutim-busang"
  },
  {
    "kode": "desa-6404012001",
    "nama": "Desa Mukti Utama",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404012002",
    "nama": "Desa Sumber Sari",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404012003",
    "nama": "Desa Segoy Makmur",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404012004",
    "nama": "Desa Sika Makmur",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404012005",
    "nama": "Desa Melan",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404012006",
    "nama": "Desa Tanah Abang",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404012007",
    "nama": "Desa Sumber Agung",
    "tipe": "desa",
    "parentKode": "kec-kutim-longmesangat"
  },
  {
    "kode": "desa-6404020002",
    "nama": "Desa Diaq Lay",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020003",
    "nama": "Desa Dabeq",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020004",
    "nama": "Desa Jak Luay",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020005",
    "nama": "Desa Muara Wahau",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020006",
    "nama": "Desa Nehesliah Bing",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020007",
    "nama": "Desa Karya Bakti",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020008",
    "nama": "Desa Wahau Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020009",
    "nama": "Desa Wana Sari",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404020010",
    "nama": "Desa Long Wehea",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarawahau"
  },
  {
    "kode": "desa-6404021001",
    "nama": "Desa Long Noran",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404021002",
    "nama": "Desa Long Segar",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404021003",
    "nama": "Desa Juk Ayak",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404021004",
    "nama": "Desa Marah Haloq",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404021005",
    "nama": "Desa Lung Melah",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404021006",
    "nama": "Desa Muara Pantun",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404021007",
    "nama": "Desa Rantau Panjang",
    "tipe": "desa",
    "parentKode": "kec-kutim-telen"
  },
  {
    "kode": "desa-6404022001",
    "nama": "Desa Sidomulyo",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404022002",
    "nama": "Desa Sri Pantun",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404022003",
    "nama": "Desa Kongbeng Indah",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404022004",
    "nama": "Desa Suka Maju",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404022005",
    "nama": "Desa Marga Mulia",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404022006",
    "nama": "Desa Makmur Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404022007",
    "nama": "Desa Miau Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-kongbeng"
  },
  {
    "kode": "desa-6404030001",
    "nama": "Desa Senambah",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404030002",
    "nama": "Desa Ngayau",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404030003",
    "nama": "Desa Muara Bengkal Ilir",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404030004",
    "nama": "Desa Muara Bengkal Ulu",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404030005",
    "nama": "Desa Benua Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404030006",
    "nama": "Desa Batu Balai",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404030007",
    "nama": "Desa Mulupan",
    "tipe": "desa",
    "parentKode": "kec-kutim-muarabengkal"
  },
  {
    "kode": "desa-6404031001",
    "nama": "Desa Beno Harapan",
    "tipe": "desa",
    "parentKode": "kec-kutim-batuampar"
  },
  {
    "kode": "desa-6404031002",
    "nama": "Desa Mugi Rahayu",
    "tipe": "desa",
    "parentKode": "kec-kutim-batuampar"
  },
  {
    "kode": "desa-6404031003",
    "nama": "Desa Mawai Indah",
    "tipe": "desa",
    "parentKode": "kec-kutim-batuampar"
  },
  {
    "kode": "desa-6404031004",
    "nama": "Desa Himba Lestari",
    "tipe": "desa",
    "parentKode": "kec-kutim-batuampar"
  },
  {
    "kode": "desa-6404031005",
    "nama": "Desa Batu Timbau",
    "tipe": "desa",
    "parentKode": "kec-kutim-batuampar"
  },
  {
    "kode": "desa-6404031006",
    "nama": "Desa Telaga",
    "tipe": "desa",
    "parentKode": "kec-kutim-batuampar"
  },
  {
    "kode": "desa-6404040012",
    "nama": "Desa Sangatta Utara",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattautara"
  },
  {
    "kode": "desa-6404040016",
    "nama": "Desa Teluk Lingga",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattautara"
  },
  {
    "kode": "desa-6404040017",
    "nama": "Desa Singa Gembara",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattautara"
  },
  {
    "kode": "desa-6404040018",
    "nama": "Desa Swarga Bara",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattautara"
  },
  {
    "kode": "desa-6404041001",
    "nama": "Desa Sepaso",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041002",
    "nama": "Desa Tepian Langsat",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041003",
    "nama": "Desa Tebangan Lembak",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041004",
    "nama": "Desa Keraitan",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041005",
    "nama": "Desa Sekerat",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041006",
    "nama": "Desa Muara Bengalon",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041007",
    "nama": "Desa Sepaso Timur",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041008",
    "nama": "Desa Sepaso Selatan",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041009",
    "nama": "Desa Tepian Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041010",
    "nama": "Desa Tepian Indah",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404041011",
    "nama": "Desa Sepaso Barat",
    "tipe": "desa",
    "parentKode": "kec-kutim-bengalon"
  },
  {
    "kode": "desa-6404042001",
    "nama": "Desa Teluk Pandan",
    "tipe": "desa",
    "parentKode": "kec-kutim-telukpandan"
  },
  {
    "kode": "desa-6404042002",
    "nama": "Desa Suka Damai",
    "tipe": "desa",
    "parentKode": "kec-kutim-telukpandan"
  },
  {
    "kode": "desa-6404042003",
    "nama": "Desa Suka Rahmat",
    "tipe": "desa",
    "parentKode": "kec-kutim-telukpandan"
  },
  {
    "kode": "desa-6404042004",
    "nama": "Desa Danau Redan",
    "tipe": "desa",
    "parentKode": "kec-kutim-telukpandan"
  },
  {
    "kode": "desa-6404042005",
    "nama": "Desa Martadinata",
    "tipe": "desa",
    "parentKode": "kec-kutim-telukpandan"
  },
  {
    "kode": "desa-6404042006",
    "nama": "Desa Kandolo",
    "tipe": "desa",
    "parentKode": "kec-kutim-telukpandan"
  },
  {
    "kode": "desa-6404043001",
    "nama": "Desa Sangkima",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattaselatan"
  },
  {
    "kode": "desa-6404043002",
    "nama": "Desa Sangatta Selatan",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattaselatan"
  },
  {
    "kode": "desa-6404043003",
    "nama": "Desa Singa Geweh",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattaselatan"
  },
  {
    "kode": "desa-6404043004",
    "nama": "Desa Teluk Singkama",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangattaselatan"
  },
  {
    "kode": "desa-6404044001",
    "nama": "Desa Rantau Makmur",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044002",
    "nama": "Desa Mukti Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044003",
    "nama": "Desa Tanjung Labu",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044004",
    "nama": "Desa Kebon Agung",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044005",
    "nama": "Desa Manunggal Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044006",
    "nama": "Desa Tepian Makmur",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044007",
    "nama": "Desa Pulung Sari",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404044008",
    "nama": "Desa Margo Mulyo",
    "tipe": "desa",
    "parentKode": "kec-kutim-rantaupulung"
  },
  {
    "kode": "desa-6404050001",
    "nama": "Desa Kerayaan",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050002",
    "nama": "Desa Benua Baru Ilir",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050003",
    "nama": "Desa Sempayau",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050004",
    "nama": "Desa Tepian Terap",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050005",
    "nama": "Desa Pelawan",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050006",
    "nama": "Desa Mandu Dalam",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050007",
    "nama": "Desa Saka",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050008",
    "nama": "Desa Peridan",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050009",
    "nama": "Desa Tanjung Manis",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050010",
    "nama": "Desa Maloy",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050011",
    "nama": "Desa Benua Baru Ulu",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050012",
    "nama": "Desa Kolek",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050013",
    "nama": "Desa Pulau Miang",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404050015",
    "nama": "Desa Mandu Pantai Sejahtera",
    "tipe": "desa",
    "parentKode": "kec-kutim-sangkulirang"
  },
  {
    "kode": "desa-6404051001",
    "nama": "Desa Kaliorang",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404051002",
    "nama": "Desa Bukit Harapan",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404051003",
    "nama": "Desa Bukit Makmur",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404051004",
    "nama": "Desa Bangun Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404051005",
    "nama": "Desa Citra Manunggal Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404051006",
    "nama": "Desa Bumi Sejahtera",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404051007",
    "nama": "Desa Selangkau",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaliorang"
  },
  {
    "kode": "desa-6404052001",
    "nama": "Desa Susuk Luar",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404052002",
    "nama": "Desa Susuk Dalam",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404052003",
    "nama": "Desa Marukangan",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404052004",
    "nama": "Desa Manubar",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404052005",
    "nama": "Desa Tadoan",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404052006",
    "nama": "Desa Sandaran",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404052007",
    "nama": "Desa Tanjung Mangkalihat",
    "tipe": "desa",
    "parentKode": "kec-kutim-sandaran"
  },
  {
    "kode": "desa-6404053001",
    "nama": "Desa Cipta Graha",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053002",
    "nama": "Desa Bumi Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053003",
    "nama": "Desa Bumi Rapak",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053004",
    "nama": "Desa Bumi Etam",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053005",
    "nama": "Desa Mata Air",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053006",
    "nama": "Desa Bukit Permata",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053007",
    "nama": "Desa Kadungan Jaya",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404053008",
    "nama": "Desa Pengadan Baru",
    "tipe": "desa",
    "parentKode": "kec-kutim-kaubun"
  },
  {
    "kode": "desa-6404054001",
    "nama": "Desa Pengadan",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6404054002",
    "nama": "Desa Baay",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6404054003",
    "nama": "Desa Karangan Dalam",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6404054004",
    "nama": "Desa Batu Lepoq",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6404054005",
    "nama": "Desa Mukti Lestari",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6404054006",
    "nama": "Desa Karangan Hilir",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6404054007",
    "nama": "Desa Karangan Seberang",
    "tipe": "desa",
    "parentKode": "kec-kutim-karangan"
  },
  {
    "kode": "desa-6405010001",
    "nama": "Kampung Merapun",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010002",
    "nama": "Kampung Merabu",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010003",
    "nama": "Kampung Mapulu",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010004",
    "nama": "Kampung Panaan",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010005",
    "nama": "Kampung Merasa",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010006",
    "nama": "Kampung Muara Lesan",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010007",
    "nama": "Kampung Lesan Dayak",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010008",
    "nama": "Kampung Sido Bangen",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010009",
    "nama": "Kampung Long Beliu",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010010",
    "nama": "Kampung Long Duhung",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010011",
    "nama": "Kampung Long Keluh",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010012",
    "nama": "Kampung Long Pelay",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010013",
    "nama": "Kampung Long Lamcin",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405010014",
    "nama": "Kampung Long Sului",
    "tipe": "desa",
    "parentKode": "kec-berau-kelay"
  },
  {
    "kode": "desa-6405020003",
    "nama": "Kampung Campur Sari",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020004",
    "nama": "Kampung Bumi Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020006",
    "nama": "Kampung Tunggal Bumi",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020007",
    "nama": "Kampung Dumaring",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020008",
    "nama": "Kampung Suka Murya",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020009",
    "nama": "Kampung Purna Sari Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020010",
    "nama": "Kampung Sumber Mulia",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020011",
    "nama": "Kampung Eka Sapta",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020012",
    "nama": "Kampung Talisayan",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405020013",
    "nama": "Kampung Capuak",
    "tipe": "desa",
    "parentKode": "kec-berau-talisayan"
  },
  {
    "kode": "desa-6405021004",
    "nama": "Kampung Tabalar Muara",
    "tipe": "desa",
    "parentKode": "kec-berau-tabalar"
  },
  {
    "kode": "desa-6405021005",
    "nama": "Kampung Harapan Maju",
    "tipe": "desa",
    "parentKode": "kec-berau-tabalar"
  },
  {
    "kode": "desa-6405021006",
    "nama": "Kampung Tabalar Ulu",
    "tipe": "desa",
    "parentKode": "kec-berau-tabalar"
  },
  {
    "kode": "desa-6405021007",
    "nama": "Kampung Tubaan",
    "tipe": "desa",
    "parentKode": "kec-berau-tabalar"
  },
  {
    "kode": "desa-6405021009",
    "nama": "Kampung Radak/Buyung-Buyung",
    "tipe": "desa",
    "parentKode": "kec-berau-tabalar"
  },
  {
    "kode": "desa-6405030001",
    "nama": "Kampung Teluk Sumbang",
    "tipe": "desa",
    "parentKode": "kec-berau-bidukbiduk"
  },
  {
    "kode": "desa-6405030002",
    "nama": "Kampung Biduk-Biduk",
    "tipe": "desa",
    "parentKode": "kec-berau-bidukbiduk"
  },
  {
    "kode": "desa-6405030003",
    "nama": "Kampung Pantai Harapan",
    "tipe": "desa",
    "parentKode": "kec-berau-bidukbiduk"
  },
  {
    "kode": "desa-6405030004",
    "nama": "Kampung Tanjung Perepat",
    "tipe": "desa",
    "parentKode": "kec-berau-bidukbiduk"
  },
  {
    "kode": "desa-6405030005",
    "nama": "Kampung Giring-Giring",
    "tipe": "desa",
    "parentKode": "kec-berau-bidukbiduk"
  },
  {
    "kode": "desa-6405030006",
    "nama": "Kampung Teluk Sulaiman",
    "tipe": "desa",
    "parentKode": "kec-berau-bidukbiduk"
  },
  {
    "kode": "desa-6405040001",
    "nama": "Kampung Pegat",
    "tipe": "desa",
    "parentKode": "kec-berau-pulauderawan"
  },
  {
    "kode": "desa-6405040002",
    "nama": "Kampung Teluk Semanting",
    "tipe": "desa",
    "parentKode": "kec-berau-pulauderawan"
  },
  {
    "kode": "desa-6405040003",
    "nama": "Kampung Tanjung Batu",
    "tipe": "desa",
    "parentKode": "kec-berau-pulauderawan"
  },
  {
    "kode": "desa-6405040004",
    "nama": "Kampung Pulau Derawan",
    "tipe": "desa",
    "parentKode": "kec-berau-pulauderawan"
  },
  {
    "kode": "desa-6405040005",
    "nama": "Kampung Kasai",
    "tipe": "desa",
    "parentKode": "kec-berau-pulauderawan"
  },
  {
    "kode": "desa-6405041001",
    "nama": "Kampung Maratua Payung-Payung",
    "tipe": "desa",
    "parentKode": "kec-berau-maratua"
  },
  {
    "kode": "desa-6405041002",
    "nama": "Kampung Maratua Bohesilian",
    "tipe": "desa",
    "parentKode": "kec-berau-maratua"
  },
  {
    "kode": "desa-6405041003",
    "nama": "Kampung Maratua Teluk Alulu",
    "tipe": "desa",
    "parentKode": "kec-berau-maratua"
  },
  {
    "kode": "desa-6405041004",
    "nama": "Kampung Maratua Teluk Harapan",
    "tipe": "desa",
    "parentKode": "kec-berau-maratua"
  },
  {
    "kode": "desa-6405050001",
    "nama": "Kampung Long Lanuk",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050002",
    "nama": "Kampung Tumbit Dayak",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050004",
    "nama": "Kampung Inaran",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050005",
    "nama": "Kampung Pegat Bukur",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050006",
    "nama": "Kampung Rantau Panjang",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050007",
    "nama": "Kampung Sambaliung",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050008",
    "nama": "Kampung Bebanir",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050009",
    "nama": "Kampung Gurimbang",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050010",
    "nama": "Kampung Tanjung Perangat",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050011",
    "nama": "Kampung Sukan Tengah",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050012",
    "nama": "Kampung Suaran",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050013",
    "nama": "Kampung Pesayan",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050014",
    "nama": "Kampung Pilanjau",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405050015",
    "nama": "Kampung Bena Baru",
    "tipe": "desa",
    "parentKode": "kec-berau-sambaliung"
  },
  {
    "kode": "desa-6405060003",
    "nama": "Kampung Sungai Bedungun",
    "tipe": "desa",
    "parentKode": "kec-berau-tanjungredeb"
  },
  {
    "kode": "desa-6405060004",
    "nama": "Kampung Tanjung Redeb",
    "tipe": "desa",
    "parentKode": "kec-berau-tanjungredeb"
  },
  {
    "kode": "desa-6405060005",
    "nama": "Kampung Bugis",
    "tipe": "desa",
    "parentKode": "kec-berau-tanjungredeb"
  },
  {
    "kode": "desa-6405060006",
    "nama": "Kampung Gunung Panjang",
    "tipe": "desa",
    "parentKode": "kec-berau-tanjungredeb"
  },
  {
    "kode": "desa-6405060007",
    "nama": "Kampung Karang Ambun",
    "tipe": "desa",
    "parentKode": "kec-berau-tanjungredeb"
  },
  {
    "kode": "desa-6405060008",
    "nama": "Kampung Gayam",
    "tipe": "desa",
    "parentKode": "kec-berau-tanjungredeb"
  },
  {
    "kode": "desa-6405070004",
    "nama": "Kampung Tasuk",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070005",
    "nama": "Kampung Birang",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070006",
    "nama": "Kampung Gunung Tabur",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070007",
    "nama": "Kampung Maluang",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070008",
    "nama": "Kampung Samburakat",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070009",
    "nama": "Kampung Sambakungan",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070010",
    "nama": "Kampung Melati Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070011",
    "nama": "Kampung Merancang Ulu",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070012",
    "nama": "Kampung Pulau Besing",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070013",
    "nama": "Kampung Merancang Ilir",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405070015",
    "nama": "Kampung Batu-Batu",
    "tipe": "desa",
    "parentKode": "kec-berau-gunungtabur"
  },
  {
    "kode": "desa-6405080001",
    "nama": "Kampung Punan Mahkam",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080002",
    "nama": "Kampung Long Laay",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080003",
    "nama": "Kampung Punan Segah",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080004",
    "nama": "Kampung Long Ayap",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080005",
    "nama": "Kampung Long Ayan",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080006",
    "nama": "Kampung Punan Malinau",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080007",
    "nama": "Kampung Gunung Sari",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080008",
    "nama": "Kampung Harapan Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080009",
    "nama": "Kampung Bukit Makmur",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080010",
    "nama": "Kampung Pandan Sari",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080011",
    "nama": "Kampung Tepian Buah",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080012",
    "nama": "Kampung Siduung Indah",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405080013",
    "nama": "Kampung Batu Rajang",
    "tipe": "desa",
    "parentKode": "kec-berau-segah"
  },
  {
    "kode": "desa-6405090001",
    "nama": "Kampung Teluk Bayur",
    "tipe": "desa",
    "parentKode": "kec-berau-telukbayur"
  },
  {
    "kode": "desa-6405090002",
    "nama": "Kampung Rinding",
    "tipe": "desa",
    "parentKode": "kec-berau-telukbayur"
  },
  {
    "kode": "desa-6405090003",
    "nama": "Kampung Labanan Makarti",
    "tipe": "desa",
    "parentKode": "kec-berau-telukbayur"
  },
  {
    "kode": "desa-6405090004",
    "nama": "Kampung Labanan Makmur",
    "tipe": "desa",
    "parentKode": "kec-berau-telukbayur"
  },
  {
    "kode": "desa-6405090005",
    "nama": "Kampung Labanan Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-telukbayur"
  },
  {
    "kode": "desa-6405090006",
    "nama": "Kampung Tumbit Melayu",
    "tipe": "desa",
    "parentKode": "kec-berau-telukbayur"
  },
  {
    "kode": "desa-6405100001",
    "nama": "Kampung Kayu Indah",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405100002",
    "nama": "Kampung Sumber Agung",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405100003",
    "nama": "Kampung Tembudan",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405100004",
    "nama": "Kampung Batu Putih",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405100005",
    "nama": "Kampung Lobang Kelatak",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405100006",
    "nama": "Kampung Ampen Medang",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405100007",
    "nama": "Kampung Bali Kukup",
    "tipe": "desa",
    "parentKode": "kec-berau-batuputih"
  },
  {
    "kode": "desa-6405110001",
    "nama": "Kampung Biatan Bapinang",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110002",
    "nama": "Kampung Biatan Baru",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110003",
    "nama": "Kampung Bukit Makmur Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110004",
    "nama": "Kampung Manunggal Jaya",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110005",
    "nama": "Kampung Biatan Lempake",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110006",
    "nama": "Kampung Biatan Ulu",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110007",
    "nama": "Kampung Karangan",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6405110008",
    "nama": "Kampung Biatan Ilir",
    "tipe": "desa",
    "parentKode": "kec-berau-biatan"
  },
  {
    "kode": "desa-6409010001",
    "nama": "Desa Gunung Makmur",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010002",
    "nama": "Desa Gunung Intan",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010003",
    "nama": "Desa Sumber Sari",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010004",
    "nama": "Desa Sri Raharja",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010005",
    "nama": "Desa Rawa Mulia",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010006",
    "nama": "Desa Sebakung Jaya",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010007",
    "nama": "Desa Babulu Laut",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010008",
    "nama": "Desa Babulu Darat",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010009",
    "nama": "Desa Labangka",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010010",
    "nama": "Desa Rintik",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010011",
    "nama": "Desa Gunung Mulia",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409010012",
    "nama": "Desa Labangka Barat",
    "tipe": "desa",
    "parentKode": "kec-ppu-babulu"
  },
  {
    "kode": "desa-6409020001",
    "nama": "Desa Api Api",
    "tipe": "desa",
    "parentKode": "kec-ppu-waru"
  },
  {
    "kode": "desa-6409020003",
    "nama": "Desa Waru",
    "tipe": "desa",
    "parentKode": "kec-ppu-waru"
  },
  {
    "kode": "desa-6409020004",
    "nama": "Desa Bangun Mulya",
    "tipe": "desa",
    "parentKode": "kec-ppu-waru"
  },
  {
    "kode": "desa-6409030001",
    "nama": "Desa Tanjung Tengah",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030002",
    "nama": "Desa Saloloang",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030004",
    "nama": "Desa Giri Mukti",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030005",
    "nama": "Desa Lawe Lawe",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030006",
    "nama": "Desa Pejala",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030007",
    "nama": "Desa Kampung Baru",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030009",
    "nama": "Desa Sungai Parit",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030010",
    "nama": "Desa Nipah Nipah",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030011",
    "nama": "Desa Nenang",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030013",
    "nama": "Desa Penajam",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030014",
    "nama": "Desa Bulu Minung",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030015",
    "nama": "Desa Sotek",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030016",
    "nama": "Desa Sepan",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030017",
    "nama": "Desa Riko",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030018",
    "nama": "Desa Pantai Lango",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030019",
    "nama": "Desa Gersik",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030020",
    "nama": "Desa Jenebora",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030021",
    "nama": "Desa Bukit Subur",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030022",
    "nama": "Desa Sidorejo",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409030023",
    "nama": "Desa Giripurwa",
    "tipe": "desa",
    "parentKode": "kec-ppu-penajam"
  },
  {
    "kode": "desa-6409040001",
    "nama": "Desa Maridan",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040002",
    "nama": "Desa Mentawir",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040003",
    "nama": "Desa Pemaluan",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040004",
    "nama": "Desa Bumi Harapan",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040005",
    "nama": "Desa Wonosari",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040006",
    "nama": "Desa Semoi Dua",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040007",
    "nama": "Desa Argo Mulyo",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040008",
    "nama": "Desa Suko Mulyo",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040009",
    "nama": "Desa Tengin Baru",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040010",
    "nama": "Desa Sukaraja",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040011",
    "nama": "Desa Bukit Raya",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040012",
    "nama": "Desa Sepaku",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040013",
    "nama": "Desa Karang Jinawi",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040014",
    "nama": "Desa Telemow",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6409040015",
    "nama": "Desa Binuang",
    "tipe": "desa",
    "parentKode": "kec-ppu-sepaku"
  },
  {
    "kode": "desa-6411010001",
    "nama": "Kampung Nyaribungan",
    "tipe": "desa",
    "parentKode": "kec-mahulu-laham"
  },
  {
    "kode": "desa-6411010002",
    "nama": "Kampung Long Gelawang",
    "tipe": "desa",
    "parentKode": "kec-mahulu-laham"
  },
  {
    "kode": "desa-6411010003",
    "nama": "Kampung Danum Paroi",
    "tipe": "desa",
    "parentKode": "kec-mahulu-laham"
  },
  {
    "kode": "desa-6411010004",
    "nama": "Kampung Muara Ratah",
    "tipe": "desa",
    "parentKode": "kec-mahulu-laham"
  },
  {
    "kode": "desa-6411010005",
    "nama": "Kampung Laham",
    "tipe": "desa",
    "parentKode": "kec-mahulu-laham"
  },
  {
    "kode": "desa-6411020001",
    "nama": "Kampung Lutan",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020002",
    "nama": "Kampung Memahak Teboq",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020003",
    "nama": "Kampung Sirau",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020004",
    "nama": "Kampung Mata Libaq",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020005",
    "nama": "Kampung Datah Bilang Ilir",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020006",
    "nama": "Kampung Datah Bilang Ulu",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020007",
    "nama": "Kampung Datah Bilang Baru",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020008",
    "nama": "Kampung Long Hubung",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020009",
    "nama": "Kampung Wana Pariq",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020010",
    "nama": "Kampung Tri Pariq Makmur",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411020011",
    "nama": "Kampung Long Hubung Ulu",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longhubung"
  },
  {
    "kode": "desa-6411030001",
    "nama": "Kampung Long Hurai",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030002",
    "nama": "Kampung Rukun Damai",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030003",
    "nama": "Kampung Long Merah",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030004",
    "nama": "Kampung Mamahak Ilir",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030005",
    "nama": "Kampung Mamahak Ulu",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030006",
    "nama": "Kampung Long Melaham",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030007",
    "nama": "Kampung Ujoh Bilang",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030008",
    "nama": "Kampung Batu Majang",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030009",
    "nama": "Kampung Batoq Kelo",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030010",
    "nama": "Kampung Long Bagun Ulu",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411030011",
    "nama": "Kampung Long Bagun Ilir",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longbagun"
  },
  {
    "kode": "desa-6411040001",
    "nama": "Kampung Delang Kerohong",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040002",
    "nama": "Kampung Long Lunuk Baru",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040003",
    "nama": "Kampung Long Lunuk",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040004",
    "nama": "Kampung Naha Aruq",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040005",
    "nama": "Kampung Long Pahangai Dua",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040006",
    "nama": "Kampung Long Tuyoq",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040007",
    "nama": "Kampung Liu Mulang",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040008",
    "nama": "Kampung Long Pahangai Satu",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040009",
    "nama": "Kampung Datah Naha",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040010",
    "nama": "Kampung Long Isun",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040011",
    "nama": "Kampung Lirung Ubing",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040012",
    "nama": "Kampung Long Pakaq",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411040013",
    "nama": "Kampung Long Pakaq Baru",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longpahangai"
  },
  {
    "kode": "desa-6411050001",
    "nama": "Kampung Naha Tifab",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050002",
    "nama": "Kampung Noha Silat",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050003",
    "nama": "Kampung Long Penaneh Dua",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050004",
    "nama": "Kampung Tiong Ohang",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050005",
    "nama": "Kampung Naha Buan",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050007",
    "nama": "Kampung Long Penaneh Satu",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050008",
    "nama": "Kampung Long Penaneh Tiga",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050009",
    "nama": "Kampung Long Keriok",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6411050010",
    "nama": "Kampung Long Apari",
    "tipe": "desa",
    "parentKode": "kec-mahulu-longapari"
  },
  {
    "kode": "desa-6471010006",
    "nama": "Kelurahan Gunung Bahagia",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471010007",
    "nama": "Kelurahan Sepinggan",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471010008",
    "nama": "Kelurahan Damai Baru",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471010009",
    "nama": "Kelurahan Damai Bahagia",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471010010",
    "nama": "Kelurahan Sungai Nangka",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471010011",
    "nama": "Kelurahan Sepinggan Raya",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471010012",
    "nama": "Kelurahan Sepinggan Baru",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanselatan"
  },
  {
    "kode": "desa-6471011001",
    "nama": "Kelurahan Prapatan",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapankota"
  },
  {
    "kode": "desa-6471011002",
    "nama": "Kelurahan Telaga Sari",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapankota"
  },
  {
    "kode": "desa-6471011003",
    "nama": "Kelurahan Klandasan Ulu",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapankota"
  },
  {
    "kode": "desa-6471011004",
    "nama": "Kelurahan Klandasan Ilir",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapankota"
  },
  {
    "kode": "desa-6471011005",
    "nama": "Kelurahan Damai",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapankota"
  },
  {
    "kode": "desa-6471020001",
    "nama": "Kelurahan Manggar",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantimur"
  },
  {
    "kode": "desa-6471020002",
    "nama": "Kelurahan Manggar Baru",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantimur"
  },
  {
    "kode": "desa-6471020003",
    "nama": "Kelurahan Lemaru",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantimur"
  },
  {
    "kode": "desa-6471020004",
    "nama": "Kelurahan Teritip",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantimur"
  },
  {
    "kode": "desa-6471030001",
    "nama": "Kelurahan Muara Rapak",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanutara"
  },
  {
    "kode": "desa-6471030002",
    "nama": "Kelurahan Gunung Samarinda",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanutara"
  },
  {
    "kode": "desa-6471030003",
    "nama": "Kelurahan Batu Ampar",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanutara"
  },
  {
    "kode": "desa-6471030004",
    "nama": "Kelurahan Karang Joang",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanutara"
  },
  {
    "kode": "desa-6471030005",
    "nama": "Kelurahan Gunung Samarinda Baru",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanutara"
  },
  {
    "kode": "desa-6471030006",
    "nama": "Kelurahan Graha Indah",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanutara"
  },
  {
    "kode": "desa-6471040001",
    "nama": "Kelurahan Gunung Sari Ilir",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantengah"
  },
  {
    "kode": "desa-6471040002",
    "nama": "Kelurahan Gunung Sari Ulu",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantengah"
  },
  {
    "kode": "desa-6471040003",
    "nama": "Kelurahan Mekar Sari",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantengah"
  },
  {
    "kode": "desa-6471040004",
    "nama": "Kelurahan Karang Rejo",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantengah"
  },
  {
    "kode": "desa-6471040005",
    "nama": "Kelurahan Sumber Rejo",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantengah"
  },
  {
    "kode": "desa-6471040006",
    "nama": "Kelurahan Karang Jati",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapantengah"
  },
  {
    "kode": "desa-6471050001",
    "nama": "Kelurahan Baru Tengah",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanbarat"
  },
  {
    "kode": "desa-6471050002",
    "nama": "Kelurahan Marga Sari",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanbarat"
  },
  {
    "kode": "desa-6471050003",
    "nama": "Kelurahan Baru Ilir",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanbarat"
  },
  {
    "kode": "desa-6471050004",
    "nama": "Kelurahan Margo Mulyo",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanbarat"
  },
  {
    "kode": "desa-6471050005",
    "nama": "Kelurahan Baru Ulu",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanbarat"
  },
  {
    "kode": "desa-6471050006",
    "nama": "Kelurahan Kariangau",
    "tipe": "desa",
    "parentKode": "kec-bpp-balikpapanbarat"
  },
  {
    "kode": "desa-6472010001",
    "nama": "Kelurahan Simpang Pasir",
    "tipe": "desa",
    "parentKode": "kec-smd-palaran"
  },
  {
    "kode": "desa-6472010002",
    "nama": "Kelurahan Handil Bakti",
    "tipe": "desa",
    "parentKode": "kec-smd-palaran"
  },
  {
    "kode": "desa-6472010003",
    "nama": "Kelurahan Bantuas",
    "tipe": "desa",
    "parentKode": "kec-smd-palaran"
  },
  {
    "kode": "desa-6472010004",
    "nama": "Kelurahan Bukuan",
    "tipe": "desa",
    "parentKode": "kec-smd-palaran"
  },
  {
    "kode": "desa-6472010005",
    "nama": "Kelurahan Rawa Makmur",
    "tipe": "desa",
    "parentKode": "kec-smd-palaran"
  },
  {
    "kode": "desa-6472020006",
    "nama": "Kelurahan Selili",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindailir"
  },
  {
    "kode": "desa-6472020007",
    "nama": "Kelurahan Sungai Dama",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindailir"
  },
  {
    "kode": "desa-6472020008",
    "nama": "Kelurahan Sidodamai",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindailir"
  },
  {
    "kode": "desa-6472020009",
    "nama": "Kelurahan Sidomulyo",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindailir"
  },
  {
    "kode": "desa-6472020014",
    "nama": "Kelurahan Pelita",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindailir"
  },
  {
    "kode": "desa-6472021001",
    "nama": "Kelurahan Bugis",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindakota"
  },
  {
    "kode": "desa-6472021002",
    "nama": "Kelurahan Pasar Pagi",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindakota"
  },
  {
    "kode": "desa-6472021003",
    "nama": "Kelurahan Pelabuhan",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindakota"
  },
  {
    "kode": "desa-6472021004",
    "nama": "Kelurahan Sungai Pinang Luar",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindakota"
  },
  {
    "kode": "desa-6472021005",
    "nama": "Kelurahan Karang Mumus",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindakota"
  },
  {
    "kode": "desa-6472022001",
    "nama": "Kelurahan Pulau Atas",
    "tipe": "desa",
    "parentKode": "kec-smd-sambutan"
  },
  {
    "kode": "desa-6472022002",
    "nama": "Kelurahan Sindang Sari",
    "tipe": "desa",
    "parentKode": "kec-smd-sambutan"
  },
  {
    "kode": "desa-6472022003",
    "nama": "Kelurahan Makroman",
    "tipe": "desa",
    "parentKode": "kec-smd-sambutan"
  },
  {
    "kode": "desa-6472022004",
    "nama": "Kelurahan Sambutan",
    "tipe": "desa",
    "parentKode": "kec-smd-sambutan"
  },
  {
    "kode": "desa-6472022005",
    "nama": "Kelurahan Sungai Kapih",
    "tipe": "desa",
    "parentKode": "kec-smd-sambutan"
  },
  {
    "kode": "desa-6472030001",
    "nama": "Kelurahan Mesjid",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaseberang"
  },
  {
    "kode": "desa-6472030002",
    "nama": "Kelurahan Baqa",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaseberang"
  },
  {
    "kode": "desa-6472030005",
    "nama": "Kelurahan Sungai Keledang",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaseberang"
  },
  {
    "kode": "desa-6472030006",
    "nama": "Kelurahan Mangkupalas",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaseberang"
  },
  {
    "kode": "desa-6472030007",
    "nama": "Kelurahan Tenun Samarinda",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaseberang"
  },
  {
    "kode": "desa-6472030008",
    "nama": "Kelurahan Gunung Panjang",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaseberang"
  },
  {
    "kode": "desa-6472031001",
    "nama": "Kelurahan Sengkotek",
    "tipe": "desa",
    "parentKode": "kec-smd-loajananilir"
  },
  {
    "kode": "desa-6472031002",
    "nama": "Kelurahan Simpang Tiga",
    "tipe": "desa",
    "parentKode": "kec-smd-loajananilir"
  },
  {
    "kode": "desa-6472031003",
    "nama": "Kelurahan Tani Aman",
    "tipe": "desa",
    "parentKode": "kec-smd-loajananilir"
  },
  {
    "kode": "desa-6472031004",
    "nama": "Kelurahan Harapan Baru",
    "tipe": "desa",
    "parentKode": "kec-smd-loajananilir"
  },
  {
    "kode": "desa-6472031005",
    "nama": "Kelurahan Rapak Dalam",
    "tipe": "desa",
    "parentKode": "kec-smd-loajananilir"
  },
  {
    "kode": "desa-6472040001",
    "nama": "Kelurahan Loa Buah",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472040002",
    "nama": "Kelurahan Loa Bakung",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472040003",
    "nama": "Kelurahan Karang Asam Ulu",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472040004",
    "nama": "Kelurahan Teluk Lerong Ulu",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472040005",
    "nama": "Kelurahan Lok Bahu",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472040006",
    "nama": "Kelurahan Karang Asam Ilir",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472040007",
    "nama": "Kelurahan Karang Anyar",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaikunjang"
  },
  {
    "kode": "desa-6472050001",
    "nama": "Kelurahan Teluk Lerong Ilir",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050002",
    "nama": "Kelurahan Jawa",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050004",
    "nama": "Kelurahan Dadi Mulya",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050005",
    "nama": "Kelurahan Sidodadi",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050006",
    "nama": "Kelurahan Gunung Kelua",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050007",
    "nama": "Kelurahan Air Hitam",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050008",
    "nama": "Kelurahan Air Putih",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472050009",
    "nama": "Kelurahan Bukit Pinang",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindaulu"
  },
  {
    "kode": "desa-6472060004",
    "nama": "Kelurahan Lempake",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060005",
    "nama": "Kelurahan Sempaja Selatan",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060006",
    "nama": "Kelurahan Sungai Siring",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060010",
    "nama": "Kelurahan Tanah Merah",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060011",
    "nama": "Kelurahan Sempaja Utara",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060012",
    "nama": "Kelurahan Sempaja Timur",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060013",
    "nama": "Kelurahan Sempaja Barat",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472060014",
    "nama": "Kelurahan Budaya Pampang",
    "tipe": "desa",
    "parentKode": "kec-smd-samarindautara"
  },
  {
    "kode": "desa-6472061001",
    "nama": "Kelurahan Temindung Permai",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaipinang"
  },
  {
    "kode": "desa-6472061002",
    "nama": "Kelurahan Bandara",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaipinang"
  },
  {
    "kode": "desa-6472061003",
    "nama": "Kelurahan Sungai Pinang Dalam",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaipinang"
  },
  {
    "kode": "desa-6472061004",
    "nama": "Kelurahan Mugirejo",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaipinang"
  },
  {
    "kode": "desa-6472061005",
    "nama": "Kelurahan Gunung Lingai",
    "tipe": "desa",
    "parentKode": "kec-smd-sungaipinang"
  },
  {
    "kode": "desa-6474010001",
    "nama": "Kelurahan Bontang Lestari",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangselatan"
  },
  {
    "kode": "desa-6474010002",
    "nama": "Kelurahan Satimpo",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangselatan"
  },
  {
    "kode": "desa-6474010003",
    "nama": "Kelurahan Berebas Pantai",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangselatan"
  },
  {
    "kode": "desa-6474010004",
    "nama": "Kelurahan Berebas Tengah",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangselatan"
  },
  {
    "kode": "desa-6474010005",
    "nama": "Kelurahan Tanjung Laut",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangselatan"
  },
  {
    "kode": "desa-6474010006",
    "nama": "Kelurahan Tanjung Laut Indah",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangselatan"
  },
  {
    "kode": "desa-6474020001",
    "nama": "Kelurahan Bontang Kuala",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangutara"
  },
  {
    "kode": "desa-6474020002",
    "nama": "Kelurahan Bontang Baru",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangutara"
  },
  {
    "kode": "desa-6474020003",
    "nama": "Kelurahan Api-Api",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangutara"
  },
  {
    "kode": "desa-6474020004",
    "nama": "Kelurahan Gunung Lai",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangutara"
  },
  {
    "kode": "desa-6474020005",
    "nama": "Kelurahan Lok Tuan",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangutara"
  },
  {
    "kode": "desa-6474030001",
    "nama": "Kelurahan Kanaan",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangbarat"
  },
  {
    "kode": "desa-6474030002",
    "nama": "Kelurahan Gunung Telihan",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangbarat"
  },
  {
    "kode": "desa-6474030003",
    "nama": "Kelurahan Belimbing",
    "tipe": "desa",
    "parentKode": "kec-btg-bontangbarat"
  }
];

export function normalisasiNamaWilayah(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/^(desa|kelurahan|kampung|kecamatan|kabupaten|kab\.|kota)\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Mencari kecamatan master berdasarkan kode atau variasi nama.
 */
export function cariKecamatanMaster(kunci: string): MasterWilayahEntry | undefined {
  const normKunci = normalisasiNamaWilayah(kunci);
  return MASTER_KECAMATAN.find(
    (k) =>
      k.kode === kunci ||
      normalisasiNamaWilayah(k.kode) === normKunci ||
      normalisasiNamaWilayah(k.nama) === normKunci
  );
}

/**
 * Mengambil seluruh daftar Kampung / Desa / Kelurahan untuk kecamatan tertentu.
 */
export function ambilMasterDesaPerKecamatan(kecamatanKunci: string): MasterWilayahEntry[] {
  const normKunci = normalisasiNamaWilayah(kecamatanKunci);
  const kec = MASTER_KECAMATAN.find(
    (k) =>
      k.kode === kecamatanKunci ||
      normalisasiNamaWilayah(k.kode) === normKunci ||
      normalisasiNamaWilayah(k.nama) === normKunci
  );
  if (!kec) {
    return MASTER_DESA.filter(
      (d) => d.parentKode === kecamatanKunci || normalisasiNamaWilayah(d.parentKode ?? '') === normKunci
    );
  }
  return MASTER_DESA.filter((d) => d.parentKode === kec.kode);
}
