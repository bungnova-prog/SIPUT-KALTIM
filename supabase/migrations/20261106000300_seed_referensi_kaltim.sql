-- ============================================================================
-- Migrasi 003: Seed Referensi Wilayah Kalimantan Timur, 7 Komoditas Baku,
-- Katalog OPT Awal & Konfigurasi Ambang Terpusat (SCHEMA.md §3 & §10.3)
-- Catatan: Tidak menyertakan data laporan atau profil fiktif produksi.
-- ============================================================================

-- 1. Konfigurasi Ambang Bawaan (AGENTS.md §8 & §11)
insert into public.konfigurasi (kunci, nilai)
values
  ('ambang_sedang_min', 25.00),
  ('ambang_berat_min', 50.00),
  ('ambang_peringatan', 15.00),
  ('ambang_eksplosif', 30.00)
on conflict (kunci) do nothing;

-- 2. Tiga UPTD Wilayah Proteksi Tanaman Perkebunan
insert into public.uptd (kode, nama, jumlah_pengamat_aktif)
values
  ('uptd-ppta', 'UPTD BPTP Wilayah Tengah (Samarinda, Kukar, Kubar, Mahulu)', 18),
  ('uptd-utara', 'UPTD Proteksi Wilayah Utara (Kutim, Berau, Bontang)', 14),
  ('uptd-selatan', 'UPTD Proteksi Wilayah Selatan (Paser, PPU, Balikpapan)', 12)
on conflict (kode) do nothing;

-- 3. Sepuluh Kabupaten/Kota Provinsi Kalimantan Timur (7 Kabupaten + 3 Kota)
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id, lat_pusat, lng_pusat)
select
  v.kode,
  'kabupaten'::public.tipe_wilayah,
  v.nama,
  null,
  u.id,
  v.lat_pusat,
  v.lng_pusat
from (
  values
    ('kab-paser', 'Kab. Paser', 'uptd-selatan', -1.9019::double precision, 116.1965::double precision),
    ('kab-ppu', 'Kab. Penajam Paser Utara', 'uptd-selatan', -1.3005, 116.7164),
    ('kab-kubar', 'Kab. Kutai Barat', 'uptd-ppta', -0.2367, 115.7764),
    ('kab-kukar', 'Kab. Kutai Kartanegara', 'uptd-ppta', -0.4402, 116.9814),
    ('kab-kutim', 'Kab. Kutai Timur', 'uptd-utara', 0.8531, 117.5906),
    ('kab-berau', 'Kab. Berau', 'uptd-utara', 2.1502, 117.4945),
    ('kab-mahulu', 'Kab. Mahakam Ulu', 'uptd-ppta', 0.5256, 115.2289),
    ('kota-balikpapan', 'Kota Balikpapan', 'uptd-selatan', -1.1502, 116.8689),
    ('kota-samarinda', 'Kota Samarinda', 'uptd-ppta', -0.4518, 117.1856),
    ('kota-bontang', 'Kota Bontang', 'uptd-utara', 0.1336, 117.4752)
) as v(kode, nama, uptd_kode, lat_pusat, lng_pusat)
join public.uptd u on u.kode = v.uptd_kode
on conflict (kode) do nothing;

-- Hubungkan kabupaten induk UPTD
update public.uptd u
set kabupaten_id = w.id
from public.wilayah w
where (u.kode = 'uptd-ppta' and w.kode = 'kab-kukar')
   or (u.kode = 'uptd-utara' and w.kode = 'kab-kutim')
   or (u.kode = 'uptd-selatan' and w.kode = 'kab-paser');

-- 4. Kecamatan Administratif Awal Kalimantan Timur
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id)
select
  v.kode,
  'kecamatan'::public.tipe_wilayah,
  v.nama,
  induk.id,
  induk.uptd_id
from (
  values
    ('kec-longikis', 'Long Ikis', 'kab-paser'),
    ('kec-tanahgrogot', 'Tanah Grogot', 'kab-paser'),
    ('kec-babulu', 'Babulu', 'kab-ppu'),
    ('kec-sepaku', 'Sepaku', 'kab-ppu'),
    ('kec-barong', 'Barong Tongkok', 'kab-kubar'),
    ('kec-melak', 'Melak', 'kab-kubar'),
    ('kec-loajanan', 'Loa Janan', 'kab-kukar'),
    ('kec-muarabadak', 'Muara Badak', 'kab-kukar'),
    ('kec-sangatta', 'Sangatta Utara', 'kab-kutim'),
    ('kec-muarawahau', 'Muara Wahau', 'kab-kutim'),
    ('kec-sambaliung', 'Sambaliung', 'kab-berau'),
    ('kec-talisayan', 'Talisayan', 'kab-berau'),
    ('kec-longbagun', 'Long Bagun', 'kab-mahulu'),
    ('kec-bpnutara', 'Balikpapan Utara', 'kota-balikpapan'),
    ('kec-bpntimur', 'Balikpapan Timur', 'kota-balikpapan'),
    ('kec-smdutara', 'Samarinda Utara', 'kota-samarinda'),
    ('kec-palaran', 'Palaran', 'kota-samarinda'),
    ('kec-bontangbarat', 'Bontang Barat', 'kota-bontang'),
    ('kec-bontangselatan', 'Bontang Selatan', 'kota-bontang')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do nothing;

-- 5. Desa / Kelurahan Administratif Awal Kalimantan Timur
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id, lat_pusat, lng_pusat)
select
  v.kode,
  'desa'::public.tipe_wilayah,
  v.nama,
  induk.id,
  induk.uptd_id,
  v.lat_pusat,
  v.lng_pusat
from (
  values
    ('desa-pait', 'Pait', 'kec-longikis', -1.6124::double precision, 116.2981::double precision),
    ('desa-jone', 'Jone', 'kec-tanahgrogot', -1.8942, 116.2104),
    ('desa-babuludarat', 'Babulu Darat', 'kec-babulu', -1.4825, 116.5392),
    ('desa-bukitraya', 'Bukit Raya', 'kec-sepaku', -0.9524, 116.7745),
    ('desa-mencimai', 'Mencimai', 'kec-barong', -0.2548, 115.7412),
    ('desa-empaq', 'Empakuq', 'kec-melak', -0.2912, 115.8315),
    ('desa-loaduri', 'Loa Duri Ilir', 'kec-loajanan', -0.5841, 117.0582),
    ('desa-batuah', 'Batuah', 'kec-loajanan', -0.7124, 117.0411),
    ('desa-badakbaru', 'Badak Baru', 'kec-muarabadak', -0.3125, 117.4108),
    ('desa-swargabara', 'Swarga Bara', 'kec-sangatta', 0.5218, 117.5194),
    ('desa-nehesliah', 'Nehes Liah Bing', 'kec-muarawahau', 1.0785, 116.8622),
    ('desa-seibebanir', 'Sei Bebanir Bangun', 'kec-sambaliung', 2.1105, 117.5321),
    ('desa-bumijaya', 'Bumi Jaya', 'kec-talisayan', 1.5944, 118.1812),
    ('desa-ujohbilang', 'Ujoh Bilang', 'kec-longbagun', 0.5312, 115.2418),
    ('desa-batumajang', 'Batu Majang', 'kec-longbagun', 0.5485, 115.2184),
    ('desa-karangjoang', 'Karang Joang', 'kec-bpnutara', -1.1408, 116.8712),
    ('desa-teritip', 'Teritip', 'kec-bpntimur', -1.1965, 116.9682),
    ('desa-lempake', 'Lempake', 'kec-smdutara', -0.4315, 117.2041),
    ('desa-bukuan', 'Bukuan', 'kec-palaran', -0.5814, 117.1892),
    ('desa-kanaan', 'Kanaan', 'kec-bontangbarat', 0.1288, 117.4541),
    ('desa-bontanglestari', 'Bontang Lestari', 'kec-bontangselatan', 0.0615, 117.4412)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do nothing;

-- 6. Tujuh Komoditas Baku Terpisah (AGENTS.md §8)
insert into public.komoditas (nama, kode_ikon, aktif)
values
  ('Lada', 'lada', true),
  ('Kelapa Sawit', 'sawit', true),
  ('Kakao', 'kakao', true),
  ('Karet', 'karet', true),
  ('Aren', 'aren', true),
  ('Kelapa Dalam', 'kelapa_dalam', true),
  ('Kopi', 'kopi', true)
on conflict (nama) do nothing;

-- 7. Katalog OPT Utama Perkebunan Kalimantan Timur (SCHEMA.md §3.5)
insert into public.opt (komoditas_id, nama_lokal, nama_ilmiah, jenis, gejala, rekomendasi)
select
  k.id,
  v.nama_lokal,
  v.nama_ilmiah,
  v.jenis::public.jenis_opt,
  v.gejala,
  v.rekomendasi
from (
  values
    ('Kelapa Sawit', 'Busuk Pangkal Batang', 'Ganoderma boninense', 'penyakit',
      'Daun tombak tidak membuka lebih dari 3 pelepah, pelepah bawah mengering dan menggantung, muncul tubuh buah jamur di pangkal batang.',
      'Parit isolasi 1x1 m pada pokok terserang, aplikasi agens hayati Trichoderma harzianum, sanitasi bonggol terinfeksi.'),
    ('Kelapa Sawit', 'Kumbang Tanduk', 'Oryctes rhinoceros', 'hama',
      'Pelepah daun muda terpotong berbentuk segitiga seperti huruf V dan terdapat gerekan pada titik tumbuh.',
      'Pemasangan feromon agregat (Feromonas), aplikasi jamur entomopatogen Metarhizium anisopliae pada tumpukan tandan kosong.'),
    ('Kelapa Sawit', 'Ulat Api', 'Setora nitens', 'hama',
      'Helaian anak daun habis dimakan hingga menyisakan lidi dari pelepah bawah merambat ke tajuk atas.',
      'Penanaman tanaman bermanfaat Turnera subulata, konservasi musuh alami Sycanus sp., pengutipan kepompong.'),
    ('Lada', 'Busuk Pangkal Batang Lada', 'Phytophthora capsici', 'penyakit',
      'Layu mendadak seluruh sulur, bercak hitam berlendir pada leher akar, daun menguning lalu gugur cepat.',
      'Pembuatan saluran drainase kebun, pemangkasan sulur cacing, pemberian bubur Bordeaux dan Trichoderma sp.'),
    ('Lada', 'Kepik Penghisap Buah Lada', 'Dasynus piperis', 'hama',
      'Buah lada menghitam, kosong (hampa), dan rontok sebelum masak fisiologis.',
      'Sanitasi gulma inang, pemanfaatan jamur Beauveria bassiana pada pagi/sore hari.'),
    ('Kakao', 'Penggerek Buah Kakao (PBK)', 'Conopomorpha cramerella', 'hama',
      'Buah masak awal belang kuning-hijau, biji saling melekat dan berwarna kehitaman saat dibelah.',
      'PsPSP (Panen sering, Pemangkasan teratur, Sanitasi kulit buah, Pemupukan berimbang) serta sarungisasi buah.'),
    ('Kakao', 'Busuk Buah Kakao', 'Phytophthora palmivora', 'penyakit',
      'Bercak cokelat kehitaman berbatas tegas dimulai dari ujung atau pangkal buah dan tertutup miselium putih.',
      'Pemangkasan penaung untuk menurunkan kelembapan, pemetikan dan penguburan buah busuk sedalam 30 cm.'),
    ('Karet', 'Gugur Daun Corynespora', 'Corynespora cassiicola', 'penyakit',
      'Bercak nekrotik menyirip seperti tulang ikan sepanjang tulang daun diikuti gugur daun berulang.',
      'Pemupukan ekstra K pada awal pembentukan daun baru, aplikasi fungisida selektif pada kebun pembibitan.'),
    ('Karet', 'Jamur Akar Putih (JAP)', 'Rigidoporus microporus', 'penyakit',
      'Daun kusam menguning lalu meranggas, terdapat rizomorfa putih menjalar kuat pada permukaan akar tunggang.',
      'Pembukaan leher akar, pengolesan belerang/Trichoderma konidia pada perakaran sehat di sekeliling pohon sakit.'),
    ('Aren', 'Ulat Daun Aren', 'Artona catoxantha', 'hama',
      'Bercak transparan memanjang seperti tangga pada helaian daun tua yang mengering seperti terbakar.',
      'Pemangkasan pelepah tua terserang berat dan pelepasan parasitoid Apanteles artonae.'),
    ('Kelapa Dalam', 'Kumbang Janur Kelapa', 'Brontispa longissima', 'hama',
      'Janur yang belum membuka tampak cokelat mengering dan berkerut akibat gerekan larva dan imago.',
      'Pelepasan parasitoid Tetrastichus brontispae dan aplikasi Metarhizium anisopliae pada pucuk kelapa.'),
    ('Kopi', 'Penggerek Buah Kopi (PBKo)', 'Hypothenemus hampei', 'hama',
      'Lubang kecil di cakram ujung buah kopi; buah muda gugur dan buah tua berlubang-lubang menurunkan mutu biji.',
      'Lelesan, racutan, rampasan buah tersisa pascapanen serta pemasangan perangkap atraktan alkohol-metanol.')
) as v(nama_komoditas, nama_lokal, nama_ilmiah, jenis, gejala, rekomendasi)
join public.komoditas k on k.nama = v.nama_komoditas
where not exists (
  select 1
  from public.opt o
  where o.komoditas_id = k.id
    and lower(o.nama_ilmiah) = lower(v.nama_ilmiah)
);
