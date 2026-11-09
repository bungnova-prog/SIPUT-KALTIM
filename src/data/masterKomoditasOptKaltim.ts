// ============================================================================
// SIPUT-KALTIM: MASTER DATA RESMI KOMODITAS & OPT PERKEBUNAN KALIMANTAN TIMUR
// Berisi 8 Komoditas Unggulan & 40 Jenis Hama/Penyakit/Gulma (OPT) Utama
// Standar Perlindungan Tanaman Perkebunan Dinas Perkebunan Provinsi Kaltim
// ============================================================================

import type { JenisOpt, Komoditas } from '../types/domain';

export interface MasterKomoditasEntry {
  id: string;
  nama: string;
  kodeIkon: Komoditas['kodeIkon'];
  aktif: boolean;
}

export interface MasterOptEntry {
  id: string;
  komoditasKode: string; // id master komoditas (mis. 'kom-sawit', 'kom-pala')
  namaKomoditas: string;
  namaLokal: string;
  namaIlmiah: string;
  jenis: JenisOpt;
  gejala: string;
  rekomendasi: string;
}

export const MASTER_KOMODITAS: MasterKomoditasEntry[] = [
  { id: 'kom-sawit', nama: 'Kelapa Sawit', kodeIkon: 'sawit', aktif: true },
  { id: 'kom-lada', nama: 'Lada', kodeIkon: 'lada', aktif: true },
  { id: 'kom-kakao', nama: 'Kakao', kodeIkon: 'kakao', aktif: true },
  { id: 'kom-karet', nama: 'Karet', kodeIkon: 'karet', aktif: true },
  { id: 'kom-aren', nama: 'Aren', kodeIkon: 'aren', aktif: true },
  { id: 'kom-kelapa', nama: 'Kelapa Dalam', kodeIkon: 'kelapa_dalam', aktif: true },
  { id: 'kom-kopi', nama: 'Kopi', kodeIkon: 'kopi', aktif: true },
  { id: 'kom-pala', nama: 'Pala', kodeIkon: 'pala', aktif: true },
];

export const MASTER_OPT: MasterOptEntry[] = [
  // ==========================================================================
  // 1. KELAPA SAWIT (kom-sawit)
  // ==========================================================================
  {
    id: 'opt-ganoderma',
    komoditasKode: 'kom-sawit',
    namaKomoditas: 'Kelapa Sawit',
    namaLokal: 'Busuk Pangkal Batang',
    namaIlmiah: 'Ganoderma boninense',
    jenis: 'penyakit',
    gejala: 'Daun tombak tidak membuka lebih dari 3 pelepah, pelepah bawah mengering dan menggantung (sengkleh), muncul basidioma (tubuh buah jamur) di pangkal batang.',
    rekomendasi: 'Pembuatan parit isolasi 1x1 m mengelilingi pokok terserang, aplikasi agens hayati Trichoderma harzianum / T. virens, sanitasi dan pencacahan bonggol terinfeksi.',
  },
  {
    id: 'opt-oryctes',
    komoditasKode: 'kom-sawit',
    namaKomoditas: 'Kelapa Sawit',
    namaLokal: 'Kumbang Tanduk',
    namaIlmiah: 'Oryctes rhinoceros',
    jenis: 'hama',
    gejala: 'Pelepah daun muda yang baru membuka tampak terpotong berbentuk baji / segitiga menyerupai huruf V, terdapat gerekan serat pada titik tumbuh (pupus).',
    rekomendasi: 'Pemasangan perangkap feromon agregat (Feromonas) 1 unit/2 Ha, penaburan jamur entomopatogen Metarhizium anisopliae pada tumpukan tandan kosong/serasah.',
  },
  {
    id: 'opt-ulatapi',
    komoditasKode: 'kom-sawit',
    namaKomoditas: 'Kelapa Sawit',
    namaLokal: 'Ulat Api',
    namaIlmiah: 'Setora nitens',
    jenis: 'hama',
    gejala: 'Helaian anak daun habis dimakan secara masif hingga menyisakan lidi tajuk pelepah bawah dan merambat ke tajuk atas, tajuk pohon tampak meranggas.',
    rekomendasi: 'Penanaman tanaman bermanfaat Turnera subulata dan Antigonon leptopus di pinggir jalan kebun, konservasi predator Sycanus sp., aplikasi Bacillus thuringiensis.',
  },
  {
    id: 'opt-ulatkantung',
    komoditasKode: 'kom-sawit',
    namaKomoditas: 'Kelapa Sawit',
    namaLokal: 'Ulat Kantung',
    namaIlmiah: 'Metisa plana',
    jenis: 'hama',
    gejala: 'Helaian daun berlubang-lubang kecil berkerak abu-abu mengering seperti terbakar, tampak kantung berbentuk kerucut bergantung rapat di permukaan anak daun.',
    rekomendasi: 'Penyemprotan biopestisida Bacillus thuringiensis pada ulat stadia awal, injeksi batang bila tingkat serangan di atas ambang kritis 10 ulat/pelepah.',
  },
  {
    id: 'opt-tikus-sawit',
    komoditasKode: 'kom-sawit',
    namaKomoditas: 'Kelapa Sawit',
    namaLokal: 'Tikus Pohon Sawit',
    namaIlmiah: 'Rattus tiomanicus',
    jenis: 'hama',
    gejala: 'Buah kelapa sawit muda dan masak bergerigi digerek, brondolan berserakan di piringan, bunga jantan dan betina rusak tercabik-cabik.',
    rekomendasi: 'Pemasangan pagupon dan penangkaran burung hantu (Tyto alba) kepadatan 1 pagupon per 20–25 Ha, sanitasi piringan dan penyiangan berkala.',
  },
  {
    id: 'opt-busukdaun-sawit',
    komoditasKode: 'kom-sawit',
    namaKomoditas: 'Kelapa Sawit',
    namaLokal: 'Busuk Daun Antraknosa',
    namaIlmiah: 'Colletotrichum gloeosporioides',
    jenis: 'penyakit',
    gejala: 'Bercak kecokelatan berbatas tegas dengan halo kuning cerah pada anak daun bibit dan tanaman muda, ujung daun mengering dan mengerut.',
    rekomendasi: 'Pengaturan jarak tanam bibit agar sirkulasi udara baik, pengurangan naungan berlebih, aplikasi agens hayati Trichoderma sp. atau fungisida tembaga.',
  },

  // ==========================================================================
  // 2. LADA (kom-lada)
  // ==========================================================================
  {
    id: 'opt-bpblada',
    komoditasKode: 'kom-lada',
    namaKomoditas: 'Lada',
    namaLokal: 'Busuk Pangkal Batang Lada',
    namaIlmiah: 'Phytophthora capsici',
    jenis: 'penyakit',
    gejala: 'Seluruh sulur tanaman layu mendadak dari daun atas hingga bawah, bercak hitam basah berlendir pada leher pangkal akar, daun rontok dalam hitungan hari.',
    rekomendasi: 'Pembuatan saluran drainase kebun yang lancar, pemangkasan sulur cacing dekat tanah, pengolesan bubur Bordeaux dan taburan jamur Trichoderma harzianum.',
  },
  {
    id: 'opt-dasynus',
    komoditasKode: 'kom-lada',
    namaKomoditas: 'Lada',
    namaLokal: 'Kepik Penghisap Buah Lada',
    namaIlmiah: 'Dasynus piperis',
    jenis: 'hama',
    gejala: 'Tusukan nimfa dan imago pada bulir buah muda menyebabkan buah menghitam, hampa tidak berbiji, dan rontok massal sebelum masak petik.',
    rekomendasi: 'Sanitasi tanaman inang liar di sekitar kebun, penyemprotan jamur entomopatogen Beauveria bassiana pada pagi atau sore hari saat kepik aktif.',
  },
  {
    id: 'opt-diconocoris',
    komoditasKode: 'kom-lada',
    namaKomoditas: 'Lada',
    namaLokal: 'Kepik Penghisap Bunga Lada',
    namaIlmiah: 'Diconocoris hewetti',
    jenis: 'hama',
    gejala: 'Bunga lada rontok berjatuhan, tangkai bunga berwarna hitam kering, tandan buah gagal terbentuk (tandan botak).',
    rekomendasi: 'Pengasapan atau penyemprotan insektisida nabati berbahan mimba/daun sirsak pada fase awal keluarnya bunga lada, sanitasi gulma.',
  },
  {
    id: 'opt-lophobaris',
    komoditasKode: 'kom-lada',
    namaKomoditas: 'Lada',
    namaLokal: 'Penggerek Batang Lada',
    namaIlmiah: 'Lophobaris piperis',
    jenis: 'hama',
    gejala: 'Terdapat lubang gerek bulat pada cabang atau buku batang, keluar kotoran gerek menyerupai serbuk gergaji, cabang layu dan mudah patah.',
    rekomendasi: 'Pemangkasan dan pemusnahan cabang terserang, pemanfaatan jamur Metarhizium anisopliae pada saat kumbang meletakkan telur.',
  },
  {
    id: 'opt-penyakitkuninglada',
    komoditasKode: 'kom-lada',
    namaKomoditas: 'Lada',
    namaLokal: 'Penyakit Kuning Lada',
    namaIlmiah: 'Radopholus similis & Fusarium oxysporum',
    jenis: 'penyakit',
    gejala: 'Daun menguning bertahap mulai dari bagian bawah menjalar ke atas, daun kaku mengecil, pertumbuhan terhenti, perakaran membusuk dan rusak berbongkol.',
    rekomendasi: 'Aplikasi bahan organik matang kaya Trichoderma sp., penggunaan agens hayati nematoda Paecilomyces lilacinus, pemupukan kalium berimbang.',
  },

  // ==========================================================================
  // 3. KAKAO (kom-kakao)
  // ==========================================================================
  {
    id: 'opt-pbk',
    komoditasKode: 'kom-kakao',
    namaKomoditas: 'Kakao',
    namaLokal: 'Penggerek Buah Kakao (PBK)',
    namaIlmiah: 'Conopomorpha cramerella',
    jenis: 'hama',
    gejala: 'Buah masak sebelum waktunya dengan warna belang kuning-oranye tidak merata, saat dibelah biji saling melekat, berkerut, dan berbobot sangat ringan.',
    rekomendasi: 'Penerapan PsPSP (Panen sering, Pemangkasan berkala, Sanitasi kulit buah ditimbun tanah 30 cm, Pemupukan berimbang) serta kondomisasi/sarungisasi buah ukuran 8–10 cm.',
  },
  {
    id: 'opt-busukbuahkakao',
    komoditasKode: 'kom-kakao',
    namaKomoditas: 'Kakao',
    namaLokal: 'Busuk Buah Kakao',
    namaIlmiah: 'Phytophthora palmivora',
    jenis: 'penyakit',
    gejala: 'Bercak cokelat kehitaman berbatas tegas bermula dari ujung atau pangkal buah meluas cepat menutupi seluruh buah, buah diselimuti miselium putih jamur.',
    rekomendasi: 'Pemangkasan tajuk kakao dan pohon penaung untuk mengatur aerasi dan kelembapan, pemetikan dan penguburan buah busuk, aplikasi agens hayati Trichoderma.',
  },
  {
    id: 'opt-vsd',
    komoditasKode: 'kom-kakao',
    namaKomoditas: 'Kakao',
    namaLokal: 'Penyakit Kanker Garis / VSD',
    namaIlmiah: 'Ceratobasidium theobromae',
    jenis: 'penyakit',
    gejala: 'Daun kedua atau ketiga dari ujung ranting menguning dengan bintik hijau (green spots), bekas tangkai daun yang gugur memperlihatkan 3 noktah hitam pada berkas vaskular.',
    rekomendasi: 'Pemangkasan sanitasi 30–40 cm di bawah garis jaringan terinfeksi, penyambungan pucuk/rehabilitasi dengan klon tahan (seperti MCC 02, Sulawesi 01).',
  },
  {
    id: 'opt-helopeltis',
    komoditasKode: 'kom-kakao',
    namaKomoditas: 'Kakao',
    namaLokal: 'Kepik Penghisap Buah Kakao',
    namaIlmiah: 'Helopeltis antonii',
    jenis: 'hama',
    gejala: 'Bercak nekrotik bulat cekung berwarna cokelat gelap hingga hitam menyerupai koreng pada kulit buah kakao, buah muda mengering layu (cherelle wilt).',
    rekomendasi: 'Konservasi musuh alami semut hitam (Dolichoderus thoracicus) dan kutu putih, penyemprotan Beauveria bassiana pada buah dan pucuk muda.',
  },
  {
    id: 'opt-penggerekbatang-kakao',
    komoditasKode: 'kom-kakao',
    namaKomoditas: 'Kakao',
    namaLokal: 'Penggerek Batang Merah Kakao',
    namaIlmiah: 'Zeuzera coffeae',
    jenis: 'hama',
    gejala: 'Pucuk dan cabang layu mengering mendadak, terlihat lubang gerek pada kayu yang mengeluarkan kotoran gerek butiran merah kecokelatan.',
    rekomendasi: 'Penyuntikan larutan biopestisida Beauveria bassiana ke dalam lubang gerek aktif lalu lubang ditutup pasak bambu/kayu, pemotongan cabang mati.',
  },

  // ==========================================================================
  // 4. KARET (kom-karet)
  // ==========================================================================
  {
    id: 'opt-gugurdaunkaret',
    komoditasKode: 'kom-karet',
    namaKomoditas: 'Karet',
    namaLokal: 'Gugur Daun Corynespora',
    namaIlmiah: 'Corynespora cassiicola',
    jenis: 'penyakit',
    gejala: 'Bercak nekrotik kehitaman menjalar sepanjang tulang daun membentuk pola sirip tulang ikan (herring bone), daun gugur berulang hingga tajuk gundul.',
    rekomendasi: 'Pemupukan ekstra hara kalium (KCL) pada saat pembentukan daun baru (flushing), penyemprotan fungisida mancozeb selektif di kebun entres dan pembibitan.',
  },
  {
    id: 'opt-jamurakarputih',
    komoditasKode: 'kom-karet',
    namaKomoditas: 'Karet',
    namaLokal: 'Jamur Akar Putih (JAP)',
    namaIlmiah: 'Rigidoporus microporus',
    jenis: 'penyakit',
    gejala: 'Daun tajuk kusam memucat menguning lalu meranggas, akar tunggang dan lateral tertutup anyaman benang jamur putih (rizomorfa) pipih menjalar kuat.',
    rekomendasi: 'Membuka leher akar hingga batas sehat, mengoleskan belerang atau suspensi Trichoderma konidia, penanaman kacangan penutup tanah (LCC Mucuna bracteata).',
  },
  {
    id: 'opt-keringalursadur',
    komoditasKode: 'kom-karet',
    namaKomoditas: 'Karet',
    namaLokal: 'Kering Alur Sadur (KAS)',
    namaIlmiah: 'Tapping Panel Dryness',
    jenis: 'penyakit',
    gejala: 'Alur sadur tidak mengeluarkan lateks meskipun disadap normal, kulit pulihan sadur pecah-pecah bergelombang dan terbentuk tonjolan kayu.',
    rekomendasi: 'Menghentikan penyaduran sementara selama 3–6 bulan pada pohon bergejala, menurunkan intensitas sadur (sadur selang 3 hari), aplikasi zat stimulan organik.',
  },
  {
    id: 'opt-rayap-karet',
    komoditasKode: 'kom-karet',
    namaKomoditas: 'Karet',
    namaLokal: 'Rayap Kayu Karet',
    namaIlmiah: 'Coptotermes curvignathus',
    jenis: 'hama',
    gejala: 'Terowongan tanah cokelat menjalar di sepanjang kulit luar batang pohon karet, kayu teras di dalam keropos hancur sehingga pohon mudah patah tumbang.',
    rekomendasi: 'Aplikasi jamur entomopatogen Metarhizium anisopliae di liang aktif sarang rayap, penyingkiran tunggul-tunggul kayu sisa pembukaan lahan.',
  },

  // ==========================================================================
  // 5. AREN (kom-aren)
  // ==========================================================================
  {
    id: 'opt-artona',
    komoditasKode: 'kom-aren',
    namaKomoditas: 'Aren',
    namaLokal: 'Ulat Daun Aren',
    namaIlmiah: 'Artona catoxantha',
    jenis: 'hama',
    gejala: 'Bercak transparan memanjang menyerupai tangga pada helaian anak daun tua, daun mengering kecokelatan seperti terbakar, fotosintesis anjlok.',
    rekomendasi: 'Pemangkasan pelepah daun tua yang terserang berat dan dibakar, pelepasan musuh alami parasitoid larva Apanteles artonae.',
  },
  {
    id: 'opt-oryctes-aren',
    komoditasKode: 'kom-aren',
    namaKomoditas: 'Aren',
    namaLokal: 'Kumbang Tanduk Aren',
    namaIlmiah: 'Oryctes rhinoceros',
    jenis: 'hama',
    gejala: 'Pucuk janur daun aren terpotong berbentuk segitiga runcing, pelepah mudah patah pada pangkal, terdapat lubang gerekan pada titik tumbuh empulur.',
    rekomendasi: 'Pemasangan perangkap feromon kumbang, pemusnahan batang aren yang membusuk di lantai kebun dengan jamur Metarhizium anisopliae.',
  },
  {
    id: 'opt-kumbangsagu-aren',
    komoditasKode: 'kom-aren',
    namaKomoditas: 'Aren',
    namaLokal: 'Kumbang Sagu / Moncong Aren',
    namaIlmiah: 'Rhynchophorus ferrugineus',
    jenis: 'hama',
    gejala: 'Larva menggerek jaringan empulur lunak batang aren, pelepah tengah terkulai layu menguning, mengeluarkan lendir busuk dari lubang batang.',
    rekomendasi: 'Menutup seluruh luka bekas sadur nira atau pemangkasan dengan ter/cat anti jamur, sanitasi pohon inang yang telah lapuk.',
  },
  {
    id: 'opt-busuktitiktumbuh-aren',
    komoditasKode: 'kom-aren',
    namaKomoditas: 'Aren',
    namaLokal: 'Busuk Titik Tumbuh Aren',
    namaIlmiah: 'Phytophthora sp.',
    jenis: 'penyakit',
    gejala: 'Pelepah daun muda membusuk basah dan mengeluarkan aroma busuk menyengat, pucuk mudah dicabut lepas dari batang pokok, tanaman mati.',
    rekomendasi: 'Pembersihan sanitasi tajuk tanaman dari lumut dan kotoran air hujan, aplikasi agen antagonis Trichoderma viride pada ketiak pelepah.',
  },
  {
    id: 'opt-bercakdaun-aren',
    komoditasKode: 'kom-aren',
    namaKomoditas: 'Aren',
    namaLokal: 'Bercak Daun Cercospora Aren',
    namaIlmiah: 'Cercospora sp.',
    jenis: 'penyakit',
    gejala: 'Bercak cokelat melingkar dengan bagian tengah pucat kelabu pada helaian daun aren, helaian daun robek dan gugur prematur.',
    rekomendasi: 'Pemangkasan daun sakit parah pada tajuk bawah, penyemprotan fungisida nabati atau agen hayati Gliocladium sp.',
  },

  // ==========================================================================
  // 6. KELAPA DALAM (kom-kelapa)
  // ==========================================================================
  {
    id: 'opt-brontispa',
    komoditasKode: 'kom-kelapa',
    namaKomoditas: 'Kelapa Dalam',
    namaLokal: 'Kumbang Janur Kelapa',
    namaIlmiah: 'Brontispa longissima',
    jenis: 'hama',
    gejala: 'Helaian janur muda yang belum membuka tampak beralur-alur cokelat kehitaman mengering dan keriting berkerut akibat gerekan larva dan kumbang.',
    rekomendasi: 'Pelepasan parasitoid larva Tetrastichus brontispae, penyiraman suspensi jamur entomopatogen Metarhizium anisopliae langsung ke pucuk pohon kelapa.',
  },
  {
    id: 'opt-oryctes-kelapa',
    komoditasKode: 'kom-kelapa',
    namaKomoditas: 'Kelapa Dalam',
    namaLokal: 'Kumbang Tanduk Kelapa',
    namaIlmiah: 'Oryctes rhinoceros',
    jenis: 'hama',
    gejala: 'Daun pelepah muda yang baru mengembang tampak tergunting rapi berbentuk baji (huruf V), tajuk pohon tampak compang-camping.',
    rekomendasi: 'Pemasangan perangkap feromon (Feromonas), pemeliharaan kebersihan kebun dari tumpukan batang kelapa lapuk sarang perindukan larva.',
  },
  {
    id: 'opt-sexava',
    komoditasKode: 'kom-kelapa',
    namaKomoditas: 'Kelapa Dalam',
    namaLokal: 'Belalang Sexava Kelapa',
    namaIlmiah: 'Sexava nubila',
    jenis: 'hama',
    gejala: 'Daun kelapa dimakan habis dari pinggir helai daun hingga menyisakan lidi, tandan buah rontok massal, penurunan produksi drastis hingga 80%.',
    rekomendasi: 'Pelepasan parasitoid telur Trichogrammatoidea sexavae, penaburan lem serangga atau insektisida nabati pada pangkal batang pohon kelapa.',
  },
  {
    id: 'opt-kutusagu-kelapa',
    komoditasKode: 'kom-kelapa',
    namaKomoditas: 'Kelapa Dalam',
    namaLokal: 'Kutu Perisai Kelapa',
    namaIlmiah: 'Aspidiotus destructor',
    jenis: 'hama',
    gejala: 'Permukaan bawah daun diselimuti koloni kutu pipih berwarna putih kekuningan, daun menguning pucat dan dilapisi embun jelaga hitam.',
    rekomendasi: 'Pelepasan predator kepik kumbang Chilocorus politus, pemangkasan pelepah daun bawah yang terserang parah.',
  },
  {
    id: 'opt-busukpucuk-kelapa',
    komoditasKode: 'kom-kelapa',
    namaKomoditas: 'Kelapa Dalam',
    namaLokal: 'Busuk Pucuk Kelapa',
    namaIlmiah: 'Phytophthora palmivora',
    jenis: 'penyakit',
    gejala: 'Daun tombak paling muda membusuk dari pangkal dan mudah dicabut, mengeluarkan aroma busuk menyengat, bertahap pelepah lainnya terkulai dan patah.',
    rekomendasi: 'Pembersihan tajuk tanaman, aplikasi agens hayati Trichoderma pada ketiak pelepah muda, pohon mati segera ditebang dan dimusnahkan.',
  },

  // ==========================================================================
  // 7. KOPI (kom-kopi)
  // ==========================================================================
  {
    id: 'opt-pbkopi',
    komoditasKode: 'kom-kopi',
    namaKomoditas: 'Kopi',
    namaLokal: 'Penggerek Buah Kopi (PBKo)',
    namaIlmiah: 'Hypothenemus hampei',
    jenis: 'hama',
    gejala: 'Terdapat lubang gerek kecil (diameter ~1 mm) di bagian ujung/cakram buah kopi; buah muda rontok dan buah tua berlubang-lubang menurunkan bobot dan mutu citarasa biji.',
    rekomendasi: 'Petik bubuk (memetik buah terserang), lelesan (memungut buah gugur), racutan/rampasan seluruh sisa buah pascapanen, serta pemasangan perangkap atraktan alkohol-metanol (perangkap Brocap).',
  },
  {
    id: 'opt-karatdaunkopi',
    komoditasKode: 'kom-kopi',
    namaKomoditas: 'Kopi',
    namaLokal: 'Karat Daun Kopi',
    namaIlmiah: 'Hemileia vastatrix',
    jenis: 'penyakit',
    gejala: 'Bercak kuning muda pada permukaan atas daun yang di permukaan bawahnya tertutup serbuk spora berwarna jingga/oranye keemasan, daun rontok prematur hingga tajuk botak.',
    rekomendasi: 'Penanaman klon toleran/tahan (mis. Robusta klon BP 308, BP 436), pengaturan naungan kebun sekitar 30–50%, penyemprotan agens hayati Trichoderma atau fungisida tembaga.',
  },
  {
    id: 'opt-penggerekranting-kopi',
    komoditasKode: 'kom-kopi',
    namaKomoditas: 'Kopi',
    namaLokal: 'Penggerek Cabang & Ranting Kopi',
    namaIlmiah: 'Xylosandrus compactus',
    jenis: 'hama',
    gejala: 'Ujung ranting buah kopi layu mengering mendadak (mati ranting), terlihat lubang gerek jarum di sisi bawah ranting yang biasanya berasosiasi dengan jamur ambrosia.',
    rekomendasi: 'Pemangkasan ranting mati 5 cm di bawah lubang gerek lalu dibakar, sanitasi gulma inang dan pohon naungan.',
  },
  {
    id: 'opt-kutudompolan-kopi',
    komoditasKode: 'kom-kopi',
    namaKomoditas: 'Kopi',
    namaLokal: 'Kutu Dompolan Kopi',
    namaIlmiah: 'Planococcus citri',
    jenis: 'hama',
    gejala: 'Kumpulan kutu putih bertepung menyerang tangkai bunga dan dompolan buah kopi muda, menyebabkan bunga kering dan buah muda menguning lalu rontok.',
    rekomendasi: 'Penyemprotan jamur Beauveria bassiana, pemangkasan tunas air berlebih, pelestarian predator kumbang Scymnus sp.',
  },
  {
    id: 'opt-jamurupas-kopi',
    komoditasKode: 'kom-kopi',
    namaKomoditas: 'Kopi',
    namaLokal: 'Jamur Upas Kopi',
    namaIlmiah: 'Corticium salmonicolor',
    jenis: 'penyakit',
    gejala: 'Lapisan kerak miselium berwarna merah jambu (salmon pink) membalut permukaan kulit cabang dan ranting, daun di ujung cabang mengering cokelat dan mati.',
    rekomendasi: 'Mengerok lapisan kerak jamur pada stadia awal dan diolesi pasta bubur Bordeaux atau agens hayati Trichoderma, pemangkasan cabang terserang parah.',
  },

  // ==========================================================================
  // 8. PALA (kom-pala)
  // ==========================================================================
  {
    id: 'opt-penggerekbatang-pala',
    komoditasKode: 'kom-pala',
    namaKomoditas: 'Pala',
    namaLokal: 'Penggerek Batang Pala',
    namaIlmiah: 'Batocera sp.',
    jenis: 'hama',
    gejala: 'Lubang gerek bulat pada batang utama dan cabang besar mengeluarkan cairan kental kecokelatan serta serpihan serat kayu, cabang di atas lubang layu mengering dan rapuh.',
    rekomendasi: 'Membersihkan kotoran gerek, menyuntikkan larutan jamur Beauveria bassiana atau ekstrak tembakau ke dalam lubang lalu ditutup pasak kayu lunak.',
  },
  {
    id: 'opt-busukbuahkering-pala',
    komoditasKode: 'kom-pala',
    namaKomoditas: 'Pala',
    namaLokal: 'Busuk Buah Kering Pala',
    namaIlmiah: 'Stigmina myristicae',
    jenis: 'penyakit',
    gejala: 'Bercak nekrotik bulat kecil berwarna cokelat pada kulit buah pala muda meluas menjadi keras mengering, buah membelah sebelum masak dan biji rontok rusak.',
    rekomendasi: 'Pemangkasan ranting rimbun agar sirkulasi udara dan intensitas cahaya matahari baik, penyemprotan fungisida nabati atau agen hayati Trichoderma sp.',
  },
  {
    id: 'opt-busukbuahbasah-pala',
    komoditasKode: 'kom-pala',
    namaKomoditas: 'Pala',
    namaLokal: 'Busuk Buah Basah Pala',
    namaIlmiah: 'Colletotrichum gloeosporioides',
    jenis: 'penyakit',
    gejala: 'Daging buah pala membusuk basah kecokelatan berair, fuli merah memudar menjadi cokelat busuk, buah gugur ke tanah sebelum waktu panen.',
    rekomendasi: 'Sanitasi dan pengumpulan seluruh buah busuk di bawah pohon untuk dikubur, perbaikan saluran drainase kebun agar tanah tidak tergenang.',
  },
  {
    id: 'opt-kankerbatang-pala',
    komoditasKode: 'kom-pala',
    namaKomoditas: 'Pala',
    namaLokal: 'Kanker Batang Pala',
    namaIlmiah: 'Phytophthora sp.',
    jenis: 'penyakit',
    gejala: 'Kulit batang pecah-pecah mengeluarkan cairan berwarna merah gelap menyerupai getah berbau asam, daun-daun tajuk atas menguning dan rontok bertahap.',
    rekomendasi: 'Mengerok kulit bergejala sampai batas kayu sehat lalu diolesi ter/pasta bubur Bordeaux, penyiraman agens antagonis Trichoderma di perakaran pokok.',
  },
  {
    id: 'opt-rayappangkal-pala',
    komoditasKode: 'kom-pala',
    namaKomoditas: 'Pala',
    namaLokal: 'Rayap Pangkal Batang Pala',
    namaIlmiah: 'Coptotermes sp.',
    jenis: 'hama',
    gejala: 'Pangkal batang dan perakaran utama keropos berlubang digerek koloni rayap, pohon bergoyang tidak kokoh dan roboh mendadak saat angin kencang.',
    rekomendasi: 'Aplikasi jamur entomopatogen Metarhizium anisopliae di sekeliling pangkal batang, membersihkan kebun dari sisa kayu dan tunggul lapuk.',
  },
];

export function normalisasiNamaKomoditas(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Mencari komoditas master berdasarkan kode ID atau variasi nama.
 */
export function cariKomoditasMaster(kunci: string): MasterKomoditasEntry | undefined {
  const norm = normalisasiNamaKomoditas(kunci);
  return MASTER_KOMODITAS.find(
    (k) =>
      k.id === kunci ||
      k.kodeIkon === kunci ||
      normalisasiNamaKomoditas(k.nama) === norm ||
      normalisasiNamaKomoditas(k.id) === norm
  );
}

/**
 * Mengambil daftar OPT master berdasarkan ID komoditas atau nama komoditas.
 */
export function ambilMasterOptPerKomoditas(komoditasKunci: string): MasterOptEntry[] {
  const norm = normalisasiNamaKomoditas(komoditasKunci);
  const kom = MASTER_KOMODITAS.find(
    (k) =>
      k.id === komoditasKunci ||
      k.kodeIkon === komoditasKunci ||
      normalisasiNamaKomoditas(k.nama) === norm ||
      normalisasiNamaKomoditas(k.id) === norm
  );
  if (!kom) {
    return MASTER_OPT.filter(
      (o) =>
        o.komoditasKode === komoditasKunci ||
        normalisasiNamaKomoditas(o.namaKomoditas) === norm
    );
  }
  return MASTER_OPT.filter(
    (o) => o.komoditasKode === kom.id || normalisasiNamaKomoditas(o.namaKomoditas) === normalisasiNamaKomoditas(kom.nama)
  );
}
