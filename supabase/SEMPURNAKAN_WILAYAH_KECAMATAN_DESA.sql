-- ============================================================================
-- SIPUT-KALTIM: MASTER DATA LENGKAP WILAYAH KALIMANTAN TIMUR
-- Berisi 105 Kecamatan Lengkap (10 Kab/Kota) & Ratusan Desa/Kelurahan Sentra OPT
-- Serta RPC Penambahan Desa Baru Secara Mandiri oleh Petugas Lapangan
-- Jalankan seluruh skrip ini di SQL Editor Supabase (https://supabase.com/dashboard)
-- ============================================================================

set search_path = public, auth, extensions;

-- 1. Pastikan 10 Kabupaten/Kota Tersedia & Lengkap
insert into public.wilayah (kode, tipe, nama, parent_id, lat_pusat, lng_pusat)
values
  ('kab-paser', 'kabupaten', 'Kab. Paser', null, -1.9019, 116.1965),
  ('kab-ppu', 'kabupaten', 'Kab. Penajam Paser Utara', null, -1.3005, 116.7164),
  ('kab-kubar', 'kabupaten', 'Kab. Kutai Barat', null, -0.2367, 115.7764),
  ('kab-kukar', 'kabupaten', 'Kab. Kutai Kartanegara', null, -0.4402, 116.9814),
  ('kab-kutim', 'kabupaten', 'Kab. Kutai Timur', null, 0.8531, 117.5906),
  ('kab-berau', 'kabupaten', 'Kab. Berau', null, 2.1502, 117.4945),
  ('kab-mahulu', 'kabupaten', 'Kab. Mahakam Ulu', null, 0.5256, 115.2289),
  ('kota-balikpapan', 'kabupaten', 'Kota Balikpapan', null, -1.1502, 116.8689),
  ('kota-samarinda', 'kabupaten', 'Kota Samarinda', null, -0.4518, 117.1856),
  ('kota-bontang', 'kabupaten', 'Kota Bontang', null, 0.1336, 117.4752)
on conflict (kode) do update set
  nama = excluded.nama,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- 2. Master Data Seluruh 105 Kecamatan di Provinsi Kalimantan Timur
insert into public.wilayah (kode, tipe, nama, parent_id)
select
  v.kode,
  'kecamatan'::public.tipe_wilayah,
  v.nama,
  induk.id
from (
  values
    -- A. KABUPATEN PASER (10 Kecamatan)
    ('kec-paser-tanahgrogot', 'Tanah Grogot', 'kab-paser'),
    ('kec-paser-kuaro', 'Kuaro', 'kab-paser'),
    ('kec-paser-longikis', 'Long Ikis', 'kab-paser'),
    ('kec-paser-longkali', 'Long Kali', 'kab-paser'),
    ('kec-paser-pasirbelengkong', 'Pasir Belengkong', 'kab-paser'),
    ('kec-paser-batusopang', 'Batu Sopang', 'kab-paser'),
    ('kec-paser-batuengau', 'Batu Engau', 'kab-paser'),
    ('kec-paser-muarasamu', 'Muara Samu', 'kab-paser'),
    ('kec-paser-muarakomam', 'Muara Komam', 'kab-paser'),
    ('kec-paser-tanjungharapan', 'Tanjung Harapan', 'kab-paser'),

    -- B. KABUPATEN PENAJAM PASER UTARA (4 Kecamatan)
    ('kec-ppu-penajam', 'Penajam', 'kab-ppu'),
    ('kec-ppu-waru', 'Waru', 'kab-ppu'),
    ('kec-ppu-babulu', 'Babulu', 'kab-ppu'),
    ('kec-ppu-sepaku', 'Sepaku', 'kab-ppu'),

    -- C. KABUPATEN KUTAI KARTANEGARA (20 Kecamatan)
    ('kec-kukar-tenggarong', 'Tenggarong', 'kab-kukar'),
    ('kec-kukar-tenggarongseberang', 'Tenggarong Seberang', 'kab-kukar'),
    ('kec-kukar-loajanan', 'Loa Janan', 'kab-kukar'),
    ('kec-kukar-loakulu', 'Loa Kulu', 'kab-kukar'),
    ('kec-kukar-muarabadak', 'Muara Badak', 'kab-kukar'),
    ('kec-kukar-marangkayu', 'Marang Kayu', 'kab-kukar'),
    ('kec-kukar-samboja', 'Samboja', 'kab-kukar'),
    ('kec-kukar-sambojabarat', 'Samboja Barat', 'kab-kukar'),
    ('kec-kukar-muarajawa', 'Muara Jawa', 'kab-kukar'),
    ('kec-kukar-sangasanga', 'Sanga-Sanga', 'kab-kukar'),
    ('kec-kukar-anggana', 'Anggana', 'kab-kukar'),
    ('kec-kukar-sebulu', 'Sebulu', 'kab-kukar'),
    ('kec-kukar-kotabangun', 'Kota Bangun', 'kab-kukar'),
    ('kec-kukar-kotabangundarat', 'Kota Bangun Darat', 'kab-kukar'),
    ('kec-kukar-kenohan', 'Kenohan', 'kab-kukar'),
    ('kec-kukar-kembangjanggut', 'Kembang Janggut', 'kab-kukar'),
    ('kec-kukar-tabang', 'Tabang', 'kab-kukar'),
    ('kec-kukar-muaramuntai', 'Muara Muntai', 'kab-kukar'),
    ('kec-kukar-muarawis', 'Muara Wis', 'kab-kukar'),
    ('kec-kukar-muarakaman', 'Muara Kaman', 'kab-kukar'),

    -- D. KABUPATEN KUTAI BARAT (16 Kecamatan)
    ('kec-kubar-barongtongkok', 'Barong Tongkok', 'kab-kubar'),
    ('kec-kubar-melak', 'Melak', 'kab-kubar'),
    ('kec-kubar-sekolaqdarat', 'Sekolaq Darat', 'kab-kubar'),
    ('kec-kubar-linggangbigung', 'Linggang Bigung', 'kab-kubar'),
    ('kec-kubar-damai', 'Damai', 'kab-kubar'),
    ('kec-kubar-nyuatan', 'Nyuatan', 'kab-kubar'),
    ('kec-kubar-muaralawa', 'Muara Lawa', 'kab-kubar'),
    ('kec-kubar-muarapahu', 'Muara Pahu', 'kab-kubar'),
    ('kec-kubar-jempang', 'Jempang', 'kab-kubar'),
    ('kec-kubar-bongan', 'Bongan', 'kab-kubar'),
    ('kec-kubar-siluqngurai', 'Siluq Ngurai', 'kab-kubar'),
    ('kec-kubar-bentianbesar', 'Bentian Besar', 'kab-kubar'),
    ('kec-kubar-penyinggahan', 'Penyinggahan', 'kab-kubar'),
    ('kec-kubar-mookmanaar', 'Mook Manaar Bulatn', 'kab-kubar'),
    ('kec-kubar-tering', 'Tering', 'kab-kubar'),
    ('kec-kubar-manorbulatn', 'Manor Bulatn', 'kab-kubar'),

    -- E. KABUPATEN KUTAI TIMUR (18 Kecamatan)
    ('kec-kutim-sangattautara', 'Sangatta Utara', 'kab-kutim'),
    ('kec-kutim-sangattaselatan', 'Sangatta Selatan', 'kab-kutim'),
    ('kec-kutim-bengalon', 'Bengalon', 'kab-kutim'),
    ('kec-kutim-telukpandan', 'Teluk Pandan', 'kab-kutim'),
    ('kec-kutim-rantaupulung', 'Rantau Pulung', 'kab-kutim'),
    ('kec-kutim-muarawahau', 'Muara Wahau', 'kab-kutim'),
    ('kec-kutim-kongbeng', 'Kongbeng', 'kab-kutim'),
    ('kec-kutim-telen', 'Telen', 'kab-kutim'),
    ('kec-kutim-batuampar', 'Batu Ampar', 'kab-kutim'),
    ('kec-kutim-muarabengkal', 'Muara Bengkal', 'kab-kutim'),
    ('kec-kutim-muaraancalong', 'Muara Ancalong', 'kab-kutim'),
    ('kec-kutim-longmesangat', 'Long Mesangat', 'kab-kutim'),
    ('kec-kutim-busang', 'Busang', 'kab-kutim'),
    ('kec-kutim-kaubun', 'Kaubun', 'kab-kutim'),
    ('kec-kutim-kaliorang', 'Kaliorang', 'kab-kutim'),
    ('kec-kutim-karangan', 'Karangan', 'kab-kutim'),
    ('kec-kutim-sandaran', 'Sandaran', 'kab-kutim'),
    ('kec-kutim-sangkulirang', 'Sangkulirang', 'kab-kutim'),

    -- F. KABUPATEN BERAU (13 Kecamatan)
    ('kec-berau-tanjungredeb', 'Tanjung Redeb', 'kab-berau'),
    ('kec-berau-sambaliung', 'Sambaliung', 'kab-berau'),
    ('kec-berau-gunungtabur', 'Gunung Tabur', 'kab-berau'),
    ('kec-berau-telukbayur', 'Teluk Bayur', 'kab-berau'),
    ('kec-berau-segah', 'Segah', 'kab-berau'),
    ('kec-berau-kelay', 'Kelay', 'kab-berau'),
    ('kec-berau-talisayan', 'Talisayan', 'kab-berau'),
    ('kec-berau-tabalar', 'Tabalar', 'kab-berau'),
    ('kec-berau-biatan', 'Biatan', 'kab-berau'),
    ('kec-berau-batuputih', 'Batu Putih', 'kab-berau'),
    ('kec-berau-bidukbiduk', 'Biduk-Biduk', 'kab-berau'),
    ('kec-berau-pulauderawan', 'Pulau Derawan', 'kab-berau'),
    ('kec-berau-maratua', 'Maratua', 'kab-berau'),

    -- G. KABUPATEN MAHAKAM ULU (5 Kecamatan)
    ('kec-mahulu-longbagun', 'Long Bagun', 'kab-mahulu'),
    ('kec-mahulu-longhubung', 'Long Hubung', 'kab-mahulu'),
    ('kec-mahulu-laham', 'Laham', 'kab-mahulu'),
    ('kec-mahulu-longpahangai', 'Long Pahangai', 'kab-mahulu'),
    ('kec-mahulu-longapari', 'Long Apari', 'kab-mahulu'),

    -- H. KOTA BALIKPAPAN (6 Kecamatan)
    ('kec-bpp-balikpapankota', 'Balikpapan Kota', 'kota-balikpapan'),
    ('kec-bpp-balikpapanselatan', 'Balikpapan Selatan', 'kota-balikpapan'),
    ('kec-bpp-balikpapantengah', 'Balikpapan Tengah', 'kota-balikpapan'),
    ('kec-bpp-balikpapanutara', 'Balikpapan Utara', 'kota-balikpapan'),
    ('kec-bpp-balikpapanbarat', 'Balikpapan Barat', 'kota-balikpapan'),
    ('kec-bpp-balikpapantimur', 'Balikpapan Timur', 'kota-balikpapan'),

    -- I. KOTA SAMARINDA (10 Kecamatan)
    ('kec-smd-samarindakota', 'Samarinda Kota', 'kota-samarinda'),
    ('kec-smd-samarindaulu', 'Samarinda Ulu', 'kota-samarinda'),
    ('kec-smd-samarindailir', 'Samarinda Ilir', 'kota-samarinda'),
    ('kec-smd-samarindaseberang', 'Samarinda Seberang', 'kota-samarinda'),
    ('kec-smd-sungaikunjang', 'Sungai Kunjang', 'kota-samarinda'),
    ('kec-smd-sungaipinang', 'Sungai Pinang', 'kota-samarinda'),
    ('kec-smd-palaran', 'Palaran', 'kota-samarinda'),
    ('kec-smd-samarindautara', 'Samarinda Utara', 'kota-samarinda'),
    ('kec-smd-sambutan', 'Sambutan', 'kota-samarinda'),
    ('kec-smd-loajananilir', 'Loa Janan Ilir', 'kota-samarinda'),

    -- J. KOTA BONTANG (3 Kecamatan)
    ('kec-btg-bontangutara', 'Bontang Utara', 'kota-bontang'),
    ('kec-btg-bontangselatan', 'Bontang Selatan', 'kota-bontang'),
    ('kec-btg-bontangbarat', 'Bontang Barat', 'kota-bontang')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id;

-- 3. Master Data Desa / Kelurahan Sentra Perkebunan & Pertanian di Setiap Kecamatan
insert into public.wilayah (kode, tipe, nama, parent_id, lat_pusat, lng_pusat)
select
  v.kode,
  'desa'::public.tipe_wilayah,
  v.nama,
  induk.id,
  v.lat_pusat,
  v.lng_pusat
from (
  values
    -- Paser
    ('desa-psr-tg-jone', 'Jone', 'kec-paser-tanahgrogot', -1.8942::double precision, 116.2104::double precision),
    ('desa-psr-tg-tepian', 'Tepian Batang', 'kec-paser-tanahgrogot', -1.9125, 116.2215),
    ('desa-psr-tg-tapis', 'Tapis', 'kec-paser-tanahgrogot', -1.8845, 116.2301),
    ('desa-psr-kuaro', 'Kuaro', 'kec-paser-kuaro', -1.7854, 116.0945),
    ('desa-psr-kertabumi', 'Kertabumi', 'kec-paser-kuaro', -1.7512, 116.0821),
    ('desa-psr-pait', 'Pait', 'kec-paser-longikis', -1.6124, 116.2981),
    ('desa-psr-sawitjaya', 'Sawit Jaya', 'kec-paser-longikis', -1.6341, 116.2755),
    ('desa-psr-tajur', 'Tajur', 'kec-paser-longikis', -1.5912, 116.3102),
    ('desa-psr-longkali', 'Long Kali', 'kec-paser-longkali', -1.4589, 116.2145),
    ('desa-psr-gunungputih', 'Gunung Putih', 'kec-paser-longkali', -1.4821, 116.2351),
    ('desa-psr-suatang', 'Suatang', 'kec-paser-pasirbelengkong', -1.9542, 116.2415),
    ('desa-psr-bekoso', 'Bekoso', 'kec-paser-pasirbelengkong', -1.9785, 116.2651),
    ('desa-psr-batukajang', 'Batu Kajang', 'kec-paser-batusopang', -1.8451, 115.8945),
    ('desa-psr-songka', 'Songka', 'kec-paser-batusopang', -1.8214, 115.9124),
    ('desa-psr-kerang', 'Kerang', 'kec-paser-batuengau', -2.1451, 116.2415),
    ('desa-psr-tampakan', 'Tampakan', 'kec-paser-batuengau', -2.1754, 116.2145),
    ('desa-psr-muser', 'Muser', 'kec-paser-muarasamu', -1.7845, 115.7845),
    ('desa-psr-luan', 'Luan', 'kec-paser-muarasamu', -1.7512, 115.7512),
    ('desa-psr-batubutok', 'Batu Butok', 'kec-paser-muarakomam', -1.6541, 115.8124),
    ('desa-psr-tanjungaru', 'Tanjung Aru', 'kec-paser-tanjungharapan', -2.2145, 116.4851),

    -- PPU
    ('desa-ppu-penajam', 'Penajam', 'kec-ppu-penajam', -1.2754, 116.7412),
    ('desa-ppu-petung', 'Petung', 'kec-ppu-penajam', -1.3541, 116.6851),
    ('desa-ppu-saloloang', 'Saloloang', 'kec-ppu-penajam', -1.3945, 116.7124),
    ('desa-ppu-sesulu', 'Sesulu', 'kec-ppu-waru', -1.4125, 116.6451),
    ('desa-ppu-bangunmulya', 'Bangun Mulya', 'kec-ppu-waru', -1.4312, 116.6214),
    ('desa-ppu-babuludarat', 'Babulu Darat', 'kec-ppu-babulu', -1.4825, 116.5392),
    ('desa-ppu-gunungmakmur', 'Gunung Makmur', 'kec-ppu-babulu', -1.5012, 116.5124),
    ('desa-ppu-labangka', 'Labangka', 'kec-ppu-babulu', -1.5214, 116.4851),
    ('desa-ppu-bukitraya', 'Bukit Raya', 'kec-ppu-sepaku', -0.9524, 116.7745),
    ('desa-ppu-bumiharapan', 'Bumi Harapan', 'kec-ppu-sepaku', -0.9785, 116.7512),
    ('desa-ppu-tenginbaru', 'Tengin Baru', 'kec-ppu-sepaku', -0.9124, 116.8125),

    -- Kukar
    ('desa-kkr-tgr-melayu', 'Melayu', 'kec-kukar-tenggarong', -0.4285, 116.9854),
    ('desa-kkr-tgr-bukitbiru', 'Bukit Biru', 'kec-kukar-tenggarong', -0.4512, 116.9621),
    ('desa-kkr-tgr-panji', 'Panji', 'kec-kukar-tenggarong', -0.4354, 116.9924),
    ('desa-kkr-manunggaljaya', 'Manunggal Jaya', 'kec-kukar-tenggarongseberang', -0.3845, 117.0451),
    ('desa-kkr-bangunrejo', 'Bangun Rejo', 'kec-kukar-tenggarongseberang', -0.3621, 117.0654),
    ('desa-kkr-bhuanajaya', 'Bhuana Jaya', 'kec-kukar-tenggarongseberang', -0.3341, 117.0912),
    ('desa-kkr-loaduri', 'Loa Duri Ilir', 'kec-kukar-loajanan', -0.5841, 117.0582),
    ('desa-kkr-batuah', 'Batuah', 'kec-kukar-loajanan', -0.7124, 117.0411),
    ('desa-kkr-purwajaya', 'Purwajaya', 'kec-kukar-loajanan', -0.6125, 117.0651),
    ('desa-kkr-loakulu', 'Loa Kulu Kota', 'kec-kukar-loakulu', -0.5124, 117.0124),
    ('desa-kkr-lohsumber', 'Loh Sumber', 'kec-kukar-loakulu', -0.5341, 116.9945),
    ('desa-kkr-badakbaru', 'Badak Baru', 'kec-kukar-muarabadak', -0.3125, 117.4108),
    ('desa-kkr-saliki', 'Saliki', 'kec-kukar-muarabadak', -0.3451, 117.3854),
    ('desa-kkr-sebuntal', 'Sebuntal', 'kec-kukar-marangkayu', -0.1854, 117.4215),
    ('desa-kkr-makarti', 'Makarti', 'kec-kukar-marangkayu', -0.1541, 117.3945),
    ('desa-kkr-kualasamboja', 'Kuala Samboja', 'kec-kukar-samboja', -0.9854, 117.0541),
    ('desa-kkr-sanipah', 'Sanipah', 'kec-kukar-samboja', -1.0214, 117.1124),
    ('desa-kkr-karyamerdeka', 'Karya Merdeka', 'kec-kukar-sambojabarat', -0.9541, 116.9851),
    ('desa-kkr-sungaimerdeka', 'Sungai Merdeka', 'kec-kukar-sambojabarat', -0.9312, 116.9624),
    ('desa-kkr-muarajawapesisir', 'Muara Jawa Pesisir', 'kec-kukar-muarajawa', -0.8124, 117.2415),
    ('desa-kkr-sangasangadalam', 'Sanga-Sanga Dalam', 'kec-kukar-sangasanga', -0.5841, 117.2651),
    ('desa-kkr-sungaimeriam', 'Sungai Meriam', 'kec-kukar-anggana', -0.5541, 117.2415),
    ('desa-kkr-sidomulyo', 'Sidomulyo', 'kec-kukar-anggana', -0.5312, 117.2654),
    ('desa-kkr-sebulumodern', 'Sebulu Modern', 'kec-kukar-sebulu', -0.2754, 117.0124),
    ('desa-kkr-giriagung', 'Giri Agung', 'kec-kukar-sebulu', -0.2512, 116.9854),
    ('desa-kkr-kotabangunu', 'Kota Bangun Ulu', 'kec-kukar-kotabangun', -0.2451, 116.5841),
    ('desa-kkr-liang', 'Liang', 'kec-kukar-kotabangun', -0.2214, 116.6124),
    ('desa-kkr-kedangipil', 'Kedang Ipil', 'kec-kukar-kotabangundarat', -0.2854, 116.5412),
    ('desa-kkr-kahala', 'Kahala', 'kec-kukar-kenohan', -0.1541, 116.3214),
    ('desa-kkr-kembangjanggut', 'Kembang Janggut', 'kec-kukar-kembangjanggut', 0.0541, 116.3412),
    ('desa-kkr-bukitlayang', 'Bukit Layang', 'kec-kukar-kembangjanggut', 0.0812, 116.3654),
    ('desa-kkr-bilatalang', 'Bila Talang', 'kec-kukar-tabang', 0.5412, 115.9854),
    ('desa-kkr-muaramuntaiilir', 'Muara Muntai Ilir', 'kec-kukar-muaramuntai', -0.4125, 116.4125),
    ('desa-kkr-muarawis', 'Muara Wis', 'kec-kukar-muarawis', -0.4512, 116.3854),
    ('desa-kkr-muarakamanulu', 'Muara Kaman Ulu', 'kec-kukar-muarakaman', -0.1854, 116.7854),
    ('desa-kkr-bungajadi', 'Bunga Jadi', 'kec-kukar-muarakaman', -0.1541, 116.8124),

    -- Kubar
    ('desa-kbr-mencimai', 'Mencimai', 'kec-kubar-barongtongkok', -0.2548, 115.7412),
    ('desa-kbr-simpangraya', 'Simpang Raya', 'kec-kubar-barongtongkok', -0.2351, 115.7654),
    ('desa-kbr-juaqasa', 'Juaq Asa', 'kec-kubar-barongtongkok', -0.2712, 115.7214),
    ('desa-kbr-empaq', 'Empakuq', 'kec-kubar-melak', -0.2912, 115.8315),
    ('desa-kbr-melakilir', 'Melak Ilir', 'kec-kubar-melak', -0.2754, 115.8541),
    ('desa-kbr-sekolaqdarat', 'Sekolaq Darat', 'kec-kubar-sekolaqdarat', -0.2854, 115.7945),
    ('desa-kbr-sumberbangun', 'Sumber Bangun', 'kec-kubar-sekolaqdarat', -0.3124, 115.8124),
    ('desa-kbr-bigungbaru', 'Bigung Baru', 'kec-kubar-linggangbigung', -0.1854, 115.6854),
    ('desa-kbr-damaikota', 'Damai Kota', 'kec-kubar-damai', -0.3451, 115.6412),
    ('desa-kbr-dempar', 'Dempar', 'kec-kubar-nyuatan', -0.3954, 115.5841),
    ('desa-kbr-muaralawa', 'Muara Lawa', 'kec-kubar-muaralawa', -0.4512, 115.8451),
    ('desa-kbr-lambing', 'Lambing', 'kec-kubar-muaralawa', -0.4754, 115.8712),
    ('desa-kbr-tanjunglaong', 'Tanjung Laong', 'kec-kubar-muarapahu', -0.3845, 115.9854),
    ('desa-kbr-tanjungisuy', 'Tanjung Isuy', 'kec-kubar-jempang', -0.5841, 116.0215),
    ('desa-kbr-muaratae', 'Muara Tae', 'kec-kubar-jempang', -0.6124, 115.9854),
    ('desa-kbr-jambuk', 'Jambuk', 'kec-kubar-bongan', -0.7125, 116.1412),
    ('desa-kbr-muhur', 'Muhur', 'kec-kubar-siluqngurai', -0.5124, 115.7412),
    ('desa-kbr-dilangputi', 'Dilang Puti', 'kec-kubar-bentianbesar', -0.7854, 115.4854),
    ('desa-kbr-penyinggahan', 'Penyinggahan Ilir', 'kec-kubar-penyinggahan', -0.3412, 116.0854),
    ('desa-kbr-gunungrampah', 'Gunung Rampah', 'kec-kubar-mookmanaar', -0.1451, 115.8945),
    ('desa-kbr-teringseberang', 'Tering Seberang', 'kec-kubar-tering', -0.0954, 115.8412),
    ('desa-kbr-purworejo', 'Purworejo', 'kec-kubar-tering', -0.0712, 115.8654),

    -- Kutim
    ('desa-ktm-swargabara', 'Swarga Bara', 'kec-kutim-sangattautara', 0.5218, 117.5194),
    ('desa-ktm-teluklingga', 'Teluk Lingga', 'kec-kutim-sangattautara', 0.5012, 117.5412),
    ('desa-ktm-sangattaselatan', 'Sangatta Selatan', 'kec-kutim-sangattaselatan', 0.4651, 117.5312),
    ('desa-ktm-sepaso', 'Sepaso', 'kec-kutim-bengalon', 0.7854, 117.5841),
    ('desa-ktm-sepasotimur', 'Sepaso Timur', 'kec-kutim-bengalon', 0.7954, 117.6124),
    ('desa-ktm-telukpandan', 'Teluk Pandan', 'kec-kutim-telukpandan', 0.2854, 117.4412),
    ('desa-ktm-kebonagung', 'Kebon Agung', 'kec-kutim-rantaupulung', 0.6125, 117.3854),
    ('desa-ktm-muktijaya', 'Mukti Jaya', 'kec-kutim-rantaupulung', 0.6354, 117.3621),
    ('desa-ktm-nehesliah', 'Nehes Liah Bing', 'kec-kutim-muarawahau', 1.0785, 116.8622),
    ('desa-ktm-waskitakarya', 'Waskita Karya', 'kec-kutim-muarawahau', 1.0541, 116.8854),
    ('desa-ktm-miaubaru', 'Miau Baru', 'kec-kutim-kongbeng', 1.2854, 116.9412),
    ('desa-ktm-makmurjaya', 'Makmur Jaya', 'kec-kutim-kongbeng', 1.3125, 116.9654),
    ('desa-ktm-marahhaloq', 'Marah Haloq', 'kec-kutim-telen', 1.1541, 116.6541),
    ('desa-ktm-batutimbau', 'Batu Timbau', 'kec-kutim-batuampar', 0.8124, 116.9854),
    ('desa-ktm-muarabengkalilir', 'Muara Bengkal Ilir', 'kec-kutim-muarabengkal', 0.4512, 116.7412),
    ('desa-ktm-kelinjauilir', 'Kelinjau Ilir', 'kec-kutim-muaraancalong', 0.3854, 116.6451),
    ('desa-ktm-sumbersari', 'Sumber Sari', 'kec-kutim-longmesangat', 0.6541, 116.7854),
    ('desa-ktm-longlees', 'Long Lees', 'kec-kutim-busang', 0.9854, 116.3412),
    ('desa-ktm-bumietam', 'Bumi Etam', 'kec-kutim-kaubun', 0.9541, 117.8412),
    ('desa-ktm-bangunjaya', 'Bangun Jaya', 'kec-kutim-kaliorang', 0.7854, 117.8124),
    ('desa-ktm-karanganhilir', 'Karangan Hilir', 'kec-kutim-karangan', 1.2541, 117.7412),
    ('desa-ktm-manubar', 'Manubar', 'kec-kutim-sandaran', 1.1245, 118.2415),
    ('desa-ktm-benuabaruilir', 'Benua Baru Ilir', 'kec-kutim-sangkulirang', 0.9854, 117.9854),

    -- Berau
    ('desa-bru-bugis', 'Bugis', 'kec-berau-tanjungredeb', 2.1541, 117.4945),
    ('desa-bru-gayam', 'Gayam', 'kec-berau-tanjungredeb', 2.1485, 117.5012),
    ('desa-bru-gunungpanjang', 'Gunung Panjang', 'kec-berau-tanjungredeb', 2.1624, 117.4812),
    ('desa-bru-seibebanir', 'Sei Bebanir Bangun', 'kec-berau-sambaliung', 2.1105, 117.5321),
    ('desa-bru-rantaupanjang', 'Rantau Panjang', 'kec-berau-sambaliung', 2.0854, 117.5541),
    ('desa-bru-gunungtabur', 'Gunung Tabur', 'kec-berau-gunungtabur', 2.1854, 117.5124),
    ('desa-bru-merancangilir', 'Merancang Ilir', 'kec-berau-gunungtabur', 2.2415, 117.5854),
    ('desa-bru-telukbayur', 'Teluk Bayur', 'kec-berau-telukbayur', 2.1124, 117.4412),
    ('desa-bru-labananjaya', 'Labanan Jaya', 'kec-berau-telukbayur', 2.0854, 117.3854),
    ('desa-bru-tepianbuah', 'Tepian Buah', 'kec-berau-segah', 2.2854, 117.0854),
    ('desa-bru-harapanjaya', 'Harapan Jaya', 'kec-berau-segah', 2.3125, 117.1124),
    ('desa-bru-muaralesan', 'Muara Lesan', 'kec-berau-kelay', 1.8541, 117.2145),
    ('desa-bru-bumijaya', 'Bumi Jaya', 'kec-berau-talisayan', 1.5944, 118.1812),
    ('desa-bru-campursari', 'Campur Sari', 'kec-berau-talisayan', 1.6214, 118.2124),
    ('desa-bru-tubaan', 'Tubaan', 'kec-berau-tabalar', 1.7854, 118.0412),
    ('desa-bru-biatanlempake', 'Biatan Lempake', 'kec-berau-biatan', 1.7124, 118.1412),
    ('desa-bru-batuputih', 'Batu Putih', 'kec-berau-batuputih', 1.4512, 118.4412),
    ('desa-bru-bidukbiduk', 'Biduk-Biduk', 'kec-berau-bidukbiduk', 1.2415, 118.6854),
    ('desa-bru-tanjungbatu', 'Tanjung Batu', 'kec-berau-pulauderawan', 2.2854, 118.1124),
    ('desa-bru-pulauderawan', 'Pulau Derawan', 'kec-berau-pulauderawan', 2.2812, 118.2451),
    ('desa-bru-bohesilian', 'Bohesilian', 'kec-berau-maratua', 2.1854, 118.5854),

    -- Mahulu
    ('desa-mhl-ujohbilang', 'Ujoh Bilang', 'kec-mahulu-longbagun', 0.5312, 115.2418),
    ('desa-mhl-batumajang', 'Batu Majang', 'kec-mahulu-longbagun', 0.5485, 115.2184),
    ('desa-mhl-longbagunulu', 'Long Bagun Ulu', 'kec-mahulu-longbagun', 0.5624, 115.1954),
    ('desa-mhl-longhubung', 'Long Hubung', 'kec-mahulu-longhubung', 0.4512, 115.4412),
    ('desa-mhl-datahbilang', 'Datah Bilang Ulu', 'kec-mahulu-longhubung', 0.4215, 115.4854),
    ('desa-mhl-laham', 'Laham', 'kec-mahulu-laham', 0.6541, 115.0854),
    ('desa-mhl-longpahangai', 'Long Pahangai I', 'kec-mahulu-longpahangai', 0.8541, 114.8412),
    ('desa-mhl-longapari', 'Long Apari', 'kec-mahulu-longapari', 1.0541, 114.5412),

    -- Samarinda
    ('desa-smd-pasarpagi', 'Pasar Pagi', 'kec-smd-samarindakota', -0.5012, 117.1451),
    ('desa-smd-karangmumus', 'Karang Mumus', 'kec-smd-samarindakota', -0.4954, 117.1541),
    ('desa-smd-airputih', 'Air Putih', 'kec-smd-samarindaulu', -0.4785, 117.1124),
    ('desa-smd-gunungkelua', 'Gunung Kelua', 'kec-smd-samarindaulu', -0.4651, 117.1354),
    ('desa-smd-sidomulyo', 'Sidomulyo', 'kec-smd-samarindailir', -0.4854, 117.1654),
    ('desa-smd-baqa', 'Baqa', 'kec-smd-samarindaseberang', -0.5214, 117.1412),
    ('desa-smd-loabakung', 'Loa Bakung', 'kec-smd-sungaikunjang', -0.5124, 117.0854),
    ('desa-smd-sungaipinangd', 'Sungai Pinang Dalam', 'kec-smd-sungaipinang', -0.4612, 117.1712),
    ('desa-smd-bukuan', 'Bukuan', 'kec-smd-palaran', -0.5814, 117.1892),
    ('desa-smd-rawamakmur', 'Rawa Makmur', 'kec-smd-palaran', -0.5621, 117.1745),
    ('desa-smd-lempake', 'Lempake', 'kec-smd-samarindautara', -0.4315, 117.2041),
    ('desa-smd-tanahmerah', 'Tanah Merah', 'kec-smd-samarindautara', -0.3854, 117.2415),
    ('desa-smd-sambutan', 'Sambutan', 'kec-smd-sambutan', -0.5124, 117.2145),
    ('desa-smd-simpangtiga', 'Simpang Tiga', 'kec-smd-loajananilir', -0.5412, 117.1012),

    -- Balikpapan
    ('desa-bpp-prapatan', 'Prapatan', 'kec-bpp-balikpapankota', -1.2754, 116.8214),
    ('desa-bpp-sepinggan', 'Sepinggan', 'kec-bpp-balikpapanselatan', -1.2541, 116.8945),
    ('desa-bpp-gunungsari', 'Gunung Sari Ilir', 'kec-bpp-balikpapantengah', -1.2415, 116.8451),
    ('desa-bpp-karangjoang', 'Karang Joang', 'kec-bpp-balikpapanutara', -1.1408, 116.8712),
    ('desa-bpp-batuampar', 'Batu Ampar', 'kec-bpp-balikpapanutara', -1.2124, 116.8654),
    ('desa-bpp-kariangau', 'Kariangau', 'kec-bpp-balikpapanbarat', -1.1754, 116.7854),
    ('desa-bpp-teritip', 'Teritip', 'kec-bpp-balikpapantimur', -1.1965, 116.9682),
    ('desa-bpp-manggar', 'Manggar', 'kec-bpp-balikpapantimur', -1.2214, 116.9412),

    -- Bontang
    ('desa-btg-bontangbaru', 'Bontang Baru', 'kec-btg-bontangutara', 0.1451, 117.4854),
    ('desa-btg-apiapi', 'Api-Api', 'kec-btg-bontangutara', 0.1341, 117.4712),
    ('desa-btg-tanjunglaut', 'Tanjung Laut', 'kec-btg-bontangselatan', 0.1085, 117.4754),
    ('desa-btg-bontanglestari', 'Bontang Lestari', 'kec-btg-bontangselatan', 0.0615, 117.4412),
    ('desa-btg-kanaan', 'Kanaan', 'kec-btg-bontangbarat', 0.1288, 117.4541),
    ('desa-btg-gunungtelihan', 'Gunung Telihan', 'kec-btg-bontangbarat', 0.1312, 117.4415)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- 4. Fungsi Database RPC: Tambah Desa / Kelurahan Baru Secara Mandiri
-- Memungkinkan Petugas Lapangan, Operator, atau Admin mendaftarkan desa baru langsung dari form input
create or replace function public.admin_tambah_desa(
  p_nama text,
  p_kecamatan_id uuid,
  p_lat double precision default null,
  p_lng double precision default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_kec public.wilayah%rowtype;
  v_desa public.wilayah%rowtype;
  v_kode text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'pesan', 'Sesi tidak sah. Silakan masuk terlebih dahulu.');
  end if;

  if coalesce(trim(p_nama), '') = '' then
    return jsonb_build_object('ok', false, 'pesan', 'Nama desa / kelurahan wajib diisi.');
  end if;

  select * into v_kec from public.wilayah where id = p_kecamatan_id and tipe = 'kecamatan'::public.tipe_wilayah;
  if v_kec.id is null then
    return jsonb_build_object('ok', false, 'pesan', 'Kecamatan induk tidak ditemukan.');
  end if;

  -- Buat kode unik slug
  v_kode := 'desa-custom-' || lower(regexp_replace(trim(p_nama), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(gen_random_uuid()::text, 1, 6);

  insert into public.wilayah (
    kode,
    tipe,
    nama,
    parent_id,
    uptd_id,
    lat_pusat,
    lng_pusat
  ) values (
    v_kode,
    'desa'::public.tipe_wilayah,
    trim(p_nama),
    v_kec.id,
    v_kec.uptd_id,
    coalesce(p_lat, v_kec.lat_pusat),
    coalesce(p_lng, v_kec.lng_pusat)
  )
  returning * into v_desa;

  return jsonb_build_object('ok', true, 'data', row_to_json(v_desa));
exception when others then
  return jsonb_build_object('ok', false, 'pesan', SQLERRM);
end;
$$;

grant execute on function public.admin_tambah_desa(text, uuid, double precision, double precision) to authenticated;

-- 5. Fungsi Database RPC: Tambah Kecamatan Baru Secara Mandiri
create or replace function public.admin_tambah_kecamatan(
  p_nama text,
  p_kabupaten_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_kab public.wilayah%rowtype;
  v_kec public.wilayah%rowtype;
  v_kode text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'pesan', 'Sesi tidak sah. Silakan masuk terlebih dahulu.');
  end if;

  if coalesce(trim(p_nama), '') = '' then
    return jsonb_build_object('ok', false, 'pesan', 'Nama kecamatan wajib diisi.');
  end if;

  select * into v_kab from public.wilayah where id = p_kabupaten_id and tipe = 'kabupaten'::public.tipe_wilayah;
  if v_kab.id is null then
    return jsonb_build_object('ok', false, 'pesan', 'Kabupaten induk tidak ditemukan.');
  end if;

  v_kode := 'kec-custom-' || lower(regexp_replace(trim(p_nama), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(gen_random_uuid()::text, 1, 6);

  insert into public.wilayah (
    kode,
    tipe,
    nama,
    parent_id,
    uptd_id,
    lat_pusat,
    lng_pusat
  ) values (
    v_kode,
    'kecamatan'::public.tipe_wilayah,
    trim(p_nama),
    v_kab.id,
    v_kab.uptd_id,
    v_kab.lat_pusat,
    v_kab.lng_pusat
  )
  returning * into v_kec;

  return jsonb_build_object('ok', true, 'data', row_to_json(v_kec));
exception when others then
  return jsonb_build_object('ok', false, 'pesan', SQLERRM);
end;
$$;

grant execute on function public.admin_tambah_kecamatan(text, uuid) to authenticated;

-- Kebijakan RLS agar pengguna terotentikasi dapat membaca dan menyisipkan wilayah
drop policy if exists wilayah_baca on public.wilayah;
create policy wilayah_baca on public.wilayah
  for select to authenticated using (true);

drop policy if exists wilayah_tambah on public.wilayah;
create policy wilayah_tambah on public.wilayah
  for insert to authenticated with check (true);
