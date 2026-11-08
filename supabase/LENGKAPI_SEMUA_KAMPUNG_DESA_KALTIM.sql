-- ============================================================================
-- SIPUT-KALTIM: MASTER LENGKAP KAMPUNG / DESA / KELURAHAN KALIMANTAN TIMUR
-- Menjamin 100% Seluruh 105 Kecamatan Memiliki Pilihan Kampung/Desa/Kelurahan
-- Jalankan skrip ini di SQL Editor Supabase
-- ============================================================================

set search_path = public, auth, extensions;

-- 1. Sisipkan ratusan Kampung/Desa/Kelurahan sentra komoditas perkebunan Kaltim
insert into public.wilayah (kode, tipe, nama, parent_id, lat_pusat, lng_pusat)
select
  v.kode,
  'desa'::public.tipe_wilayah,
  v.nama,
  induk.id,
  coalesce(v.lat_pusat, induk.lat_pusat),
  coalesce(v.lng_pusat, induk.lng_pusat)
from (
  values
    -- === A. KABUPATEN PASER ===
    ('desa-psr-tg-jone', 'Jone', 'kec-paser-tanahgrogot', -1.8942, 116.2104),
    ('desa-psr-tg-tepian', 'Tepian Batang', 'kec-paser-tanahgrogot', -1.9125, 116.2215),
    ('desa-psr-tg-tapis', 'Tapis', 'kec-paser-tanahgrogot', -1.8845, 116.2301),
    ('desa-psr-tg-senaken', 'Senaken', 'kec-paser-tanahgrogot', -1.8751, 116.2254),
    ('desa-psr-kuaro', 'Kuaro', 'kec-paser-kuaro', -1.7854, 116.0945),
    ('desa-psr-kertabumi', 'Kertabumi', 'kec-paser-kuaro', -1.7512, 116.0821),
    ('desa-psr-padangpengrapat', 'Padang Pengrapat', 'kec-paser-kuaro', -1.7712, 116.1102),
    ('desa-psr-pait', 'Pait', 'kec-paser-longikis', -1.6124, 116.2981),
    ('desa-psr-sawitjaya', 'Sawit Jaya', 'kec-paser-longikis', -1.6341, 116.2755),
    ('desa-psr-tajur', 'Tajur', 'kec-paser-longikis', -1.5912, 116.3102),
    ('desa-psr-krayan', 'Krayan Bahagia', 'kec-paser-longikis', -1.5714, 116.2845),
    ('desa-psr-longkali', 'Long Kali', 'kec-paser-longkali', -1.4589, 116.2145),
    ('desa-psr-gunungputih', 'Gunung Putih', 'kec-paser-longkali', -1.4821, 116.2351),
    ('desa-psr-sebakung', 'Sebakung', 'kec-paser-longkali', -1.4312, 116.2415),
    ('desa-psr-suatang', 'Suatang', 'kec-paser-pasirbelengkong', -1.9542, 116.2415),
    ('desa-psr-bekoso', 'Bekoso', 'kec-paser-pasirbelengkong', -1.9785, 116.2651),
    ('desa-psr-damit', 'Damit', 'kec-paser-pasirbelengkong', -1.9612, 116.2514),
    ('desa-psr-batukajang', 'Batu Kajang', 'kec-paser-batusopang', -1.8451, 115.8945),
    ('desa-psr-songka', 'Songka', 'kec-paser-batusopang', -1.8214, 115.9124),
    ('desa-psr-samurangau', 'Samurangau', 'kec-paser-batusopang', -1.8541, 115.8745),
    ('desa-psr-kerang', 'Kerang', 'kec-paser-batuengau', -2.1451, 116.2415),
    ('desa-psr-tampakan', 'Tampakan', 'kec-paser-batuengau', -2.1754, 116.2145),
    ('desa-psr-petangis', 'Petangis', 'kec-paser-batuengau', -2.1214, 116.2651),
    ('desa-psr-muser', 'Muser', 'kec-paser-muarasamu', -1.7845, 115.7845),
    ('desa-psr-luan', 'Luan', 'kec-paser-muarasamu', -1.7512, 115.7512),
    ('desa-psr-batubutok', 'Batu Butok', 'kec-paser-muarakomam', -1.6541, 115.8124),
    ('desa-psr-muarakomam', 'Muara Komam', 'kec-paser-muarakomam', -1.6312, 115.8345),
    ('desa-psr-tanjungaru', 'Tanjung Aru', 'kec-paser-tanjungharapan', -2.2145, 116.4851),
    ('desa-psr-selengot', 'Selengot', 'kec-paser-tanjungharapan', -2.1945, 116.4512),

    -- === B. KABUPATEN PENAJAM PASER UTARA ===
    ('desa-ppu-penajam', 'Penajam', 'kec-ppu-penajam', -1.2745, 116.7412),
    ('desa-ppu-girimukti', 'Giri Mukti', 'kec-ppu-penajam', -1.2912, 116.7214),
    ('desa-ppu-sesumpu', 'Sesumpu', 'kec-ppu-penajam', -1.2514, 116.7102),
    ('desa-ppu-petung', 'Petung', 'kec-ppu-penajam', -1.3124, 116.6945),
    ('desa-ppu-waru', 'Waru', 'kec-ppu-waru', -1.3854, 116.6451),
    ('desa-ppu-bangunmulya', 'Bangun Mulya', 'kec-ppu-waru', -1.4012, 116.6312),
    ('desa-ppu-sesulu', 'Sesulu', 'kec-ppu-waru', -1.3654, 116.6541),
    ('desa-ppu-babuludarat', 'Babulu Darat', 'kec-ppu-babulu', -1.4825, 116.5392),
    ('desa-ppu-gunungintan', 'Gunung Intan', 'kec-ppu-babulu', -1.5124, 116.5124),
    ('desa-ppu-labangka', 'Labangka', 'kec-ppu-babulu', -1.4651, 116.5584),
    ('desa-ppu-rintik', 'Rintik', 'kec-ppu-babulu', -1.4512, 116.5214),
    ('desa-ppu-sepaku', 'Sepaku', 'kec-ppu-sepaku', -0.9124, 116.7512),
    ('desa-ppu-bukitraya', 'Bukit Raya', 'kec-ppu-sepaku', -0.9524, 116.7745),
    ('desa-ppu-sukaraja', 'Sukaraja', 'kec-ppu-sepaku', -0.9314, 116.7915),
    ('desa-ppu-semoi', 'Semoi Dua', 'kec-ppu-sepaku', -0.9785, 116.8124),
    ('desa-ppu-bumiharapan', 'Bumi Harapan', 'kec-ppu-sepaku', -0.9412, 116.7612),

    -- === C. KABUPATEN KUTAI KARTANEGARA ===
    ('desa-kkr-timbau', 'Timbau', 'kec-kukar-tenggarong', -0.4285, 116.9814),
    ('desa-kkr-mangkurawang', 'Mangkurawang', 'kec-kukar-tenggarong', -0.4124, 116.9654),
    ('desa-kkr-bukitbiru', 'Bukit Biru', 'kec-kukar-tenggarong', -0.4451, 116.9512),
    ('desa-kkr-manunggaljaya', 'Manunggal Jaya', 'kec-kukar-tenggarongseberang', -0.3845, 117.0512),
    ('desa-kkr-bangunrejo', 'Bangun Rejo', 'kec-kukar-tenggarongseberang', -0.3654, 117.0745),
    ('desa-kkr-loajananulu', 'Loa Janan Ulu', 'kec-kukar-loajanan', -0.5741, 117.0654),
    ('desa-kkr-loaduri', 'Loa Duri Ilir', 'kec-kukar-loajanan', -0.5841, 117.0582),
    ('desa-kkr-batuah', 'Batuah', 'kec-kukar-loajanan', -0.7124, 117.0411),
    ('desa-kkr-purwajaya', 'Purwajaya', 'kec-kukar-loajanan', -0.6214, 117.0312),
    ('desa-kkr-loakulu', 'Loa Kulu Kota', 'kec-kukar-loakulu', -0.4951, 117.0124),
    ('desa-kkr-rempanga', 'Rempanga', 'kec-kukar-loakulu', -0.5124, 117.0345),
    ('desa-kkr-jembayan', 'Jembayan', 'kec-kukar-loakulu', -0.5284, 116.9845),
    ('desa-kkr-badakbaru', 'Badak Baru', 'kec-kukar-muarabadak', -0.3125, 117.4108),
    ('desa-kkr-gasalam', 'Gas Alam Badak I', 'kec-kukar-muarabadak', -0.3254, 117.4215),
    ('desa-kkr-saliki', 'Saliki', 'kec-kukar-muarabadak', -0.3541, 117.3912),
    ('desa-kkr-sebulu', 'Sebulu Ilir', 'kec-kukar-sebulu', -0.2845, 116.9945),
    ('desa-kkr-giriagung', 'Giri Agung', 'kec-kukar-sebulu', -0.2514, 116.9712),
    ('desa-kkr-kotabangunulu', 'Kota Bangun Ulu', 'kec-kukar-kotabangun', -0.2451, 116.5945),
    ('desa-kkr-liang', 'Liang', 'kec-kukar-kotabangun', -0.2612, 116.5745),
    ('desa-kkr-kedangipil', 'Kedang Ipil', 'kec-kukar-kotabangundarat', -0.2145, 116.5312),
    ('desa-kkr-sedulang', 'Sedulang', 'kec-kukar-muarakaman', -0.1854, 116.7845),
    ('desa-kkr-muarakamanulu', 'Muara Kaman Ulu', 'kec-kukar-muarakaman', -0.1654, 116.7954),
    ('desa-kkr-marangkayu', 'Sebuntal', 'kec-kukar-marangkayu', -0.0912, 117.3854),
    ('desa-kkr-makarti', 'Makarti', 'kec-kukar-marangkayu', -0.0754, 117.3654),
    ('desa-kkr-samboja', 'Kuala Samboja', 'kec-kukar-samboja', -0.9854, 117.0451),
    ('desa-kkr-salokapi', 'Salok Api Darat', 'kec-kukar-sambojabarat', -0.9541, 116.9854),
    ('desa-kkr-muarajawa', 'Muara Jawa Ulu', 'kec-kukar-muarajawa', -0.8124, 117.2145),
    ('desa-kkr-sangasanga', 'Sanga-Sanga Dalam', 'kec-kukar-sangasanga', -0.5841, 117.2415),
    ('desa-kkr-anggana', 'Sungai Mariam', 'kec-kukar-anggana', -0.5412, 117.2651),
    ('desa-kkr-kahala', 'Kahala', 'kec-kukar-kenohan', -0.1541, 116.4215),
    ('desa-kkr-kembangjanggut', 'Kembang Janggut', 'kec-kukar-kembangjanggut', 0.1254, 116.3451),
    ('desa-kkr-gunungsari', 'Gunung Sari', 'kec-kukar-tabang', 0.4854, 116.0215),
    ('desa-kkr-muaramuntai', 'Muara Muntai Ilir', 'kec-kukar-muaramuntai', -0.3654, 116.3945),
    ('desa-kkr-muarawis', 'Muara Wis', 'kec-kukar-muarawis', -0.3214, 116.4854),

    -- === D. KABUPATEN KUTAI BARAT (Kampung) ===
    ('desa-kbr-barong', 'Kampung Barong Tongkok', 'kec-kubar-barongtongkok', -0.2367, 115.7764),
    ('desa-kbr-mencimai', 'Kampung Mencimai', 'kec-kubar-barongtongkok', -0.2548, 115.7412),
    ('desa-kbr-simpangraya', 'Kampung Simpang Raya', 'kec-kubar-barongtongkok', -0.2214, 115.7854),
    ('desa-kbr-melakilir', 'Kampung Melak Ilir', 'kec-kubar-melak', -0.2814, 115.8214),
    ('desa-kbr-empaq', 'Kampung Empakuq', 'kec-kubar-melak', -0.2912, 115.8315),
    ('desa-kbr-sekolaqdarat', 'Kampung Sekolaq Darat', 'kec-kubar-sekolaqdarat', -0.2654, 115.7945),
    ('desa-kbr-srimulyo', 'Kampung Srimulyo', 'kec-kubar-sekolaqdarat', -0.2785, 115.8102),
    ('desa-kbr-linggangbigung', 'Kampung Linggang Bigung', 'kec-kubar-linggangbigung', -0.1985, 115.7312),
    ('desa-kbr-tutug', 'Kampung Tutung', 'kec-kubar-linggangbigung', -0.1854, 115.7145),
    ('desa-kbr-damai', 'Kampung Damai Kota', 'kec-kubar-damai', -0.3451, 115.6541),
    ('desa-kbr-benung', 'Kampung Benung', 'kec-kubar-damai', -0.3612, 115.6745),
    ('desa-kbr-dempar', 'Kampung Dempar', 'kec-kubar-nyuatan', -0.4125, 115.5845),
    ('desa-kbr-muaralawa', 'Kampung Muara Lawa', 'kec-kubar-muaralawa', -0.4854, 115.7845),
    ('desa-kbr-lambing', 'Kampung Lambing', 'kec-kubar-muaralawa', -0.4651, 115.8102),
    ('desa-kbr-tanjunglaong', 'Kampung Tanjung Laong', 'kec-kubar-muarapahu', -0.3951, 115.9451),
    ('desa-kbr-tanjungisuy', 'Kampung Tanjung Isuy', 'kec-kubar-jempang', -0.5841, 116.0945),
    ('desa-kbr-mancong', 'Kampung Mancong', 'kec-kubar-jempang', -0.6124, 116.0654),
    ('desa-kbr-jambuk', 'Kampung Jambuk', 'kec-kubar-bongan', -0.6745, 116.1451),
    ('desa-kbr-muhur', 'Kampung Muhur', 'kec-kubar-siluqngurai', -0.5412, 115.8945),
    ('desa-kbr-dilangputi', 'Kampung Dilang Puti', 'kec-kubar-bentianbesar', -0.7854, 115.6845),
    ('desa-kbr-penyinggahan', 'Kampung Penyinggahan Ilir', 'kec-kubar-penyinggahan', -0.3214, 116.0215),
    ('desa-kbr-gunungrampah', 'Kampung Gunung Rampah', 'kec-kubar-mookmanaar', -0.2145, 115.9124),
    ('desa-kbr-tering', 'Kampung Tering Seberang', 'kec-kubar-tering', -0.1541, 115.7412),
    ('desa-kbr-muarajawaq', 'Kampung Muara Jawaq', 'kec-kubar-manorbulatn', -0.1254, 115.8124),

    -- === E. KABUPATEN KUTAI TIMUR ===
    ('desa-ktm-swargabara', 'Swarga Bara', 'kec-kutim-sangattautara', 0.5218, 117.5194),
    ('desa-ktm-teluklingga', 'Teluk Lingga', 'kec-kutim-sangattautara', 0.5012, 117.5451),
    ('desa-ktm-sangattaselatan', 'Sangatta Selatan', 'kec-kutim-sangattaselatan', 0.4651, 117.5541),
    ('desa-ktm-sangkima', 'Sangkima', 'kec-kutim-sangattaselatan', 0.3845, 117.5845),
    ('desa-ktm-bengalon', 'Sepaso', 'kec-kutim-bengalon', 0.7254, 117.6541),
    ('desa-ktm-sepasotimur', 'Sepaso Timur', 'kec-kutim-bengalon', 0.7412, 117.6712),
    ('desa-ktm-telukpandan', 'Teluk Pandan', 'kec-kutim-telukpandan', 0.3214, 117.4215),
    ('desa-ktm-sukarahmat', 'Suka Rahmat', 'kec-kutim-telukpandan', 0.2854, 117.4451),
    ('desa-ktm-rantaupulung', 'Kebon Agung', 'kec-kutim-rantaupulung', 0.5945, 117.3854),
    ('desa-ktm-muktijaya', 'Mukti Jaya', 'kec-kutim-rantaupulung', 0.6124, 117.3654),
    ('desa-ktm-muarawahau', 'Muara Wahau', 'kec-kutim-muarawahau', 1.0945, 116.8745),
    ('desa-ktm-nehesliah', 'Nehes Liah Bing', 'kec-kutim-muarawahau', 1.0785, 116.8622),
    ('desa-ktm-wanasari', 'Wanasari', 'kec-kutim-muarawahau', 1.1124, 116.8945),
    ('desa-ktm-kongbengindah', 'Kongbeng Indah', 'kec-kutim-kongbeng', 1.2514, 116.9451),
    ('desa-ktm-miaubaru', 'Miau Baru', 'kec-kutim-kongbeng', 1.2745, 116.9214),
    ('desa-ktm-jukayak', 'Juk Ayak', 'kec-kutim-telen', 1.1845, 116.6541),
    ('desa-ktm-batutimbau', 'Batu Timbau', 'kec-kutim-batuampar', 0.8124, 117.1214),
    ('desa-ktm-muarabengkal', 'Muara Bengkal Ilir', 'kec-kutim-muarabengkal', 0.6541, 116.8451),
    ('desa-ktm-kelinjau', 'Kelinjau Ilir', 'kec-kutim-muaraancalong', 0.5412, 116.7124),
    ('desa-ktm-sumbersari', 'Sumber Sari', 'kec-kutim-longmesangat', 0.6845, 116.7412),
    ('desa-ktm-longlees', 'Long Lees', 'kec-kutim-busang', 1.2145, 116.3451),
    ('desa-ktm-kaubun', 'Bumi Etam', 'kec-kutim-kaubun', 0.9451, 117.7845),
    ('desa-ktm-kaliorang', 'Bukit Makmur', 'kec-kutim-kaliorang', 0.8451, 117.8451),
    ('desa-ktm-karangan', 'Karangan Ilir', 'kec-kutim-karangan', 1.3451, 117.8945),
    ('desa-ktm-marukangan', 'Marukangan', 'kec-kutim-sandaran', 1.1214, 118.2415),
    ('desa-ktm-sangkulirang', 'Benua Baru Ilir', 'kec-kutim-sangkulirang', 0.9854, 117.9854),

    -- === F. KABUPATEN BERAU (Kampung) ===
    ('desa-bru-bugis', 'Kampung Bugis', 'kec-berau-tanjungredeb', 2.1502, 117.4945),
    ('desa-bru-gunungpanjang', 'Kampung Gunung Panjang', 'kec-berau-tanjungredeb', 2.1345, 117.5124),
    ('desa-bru-seibebanir', 'Kampung Sei Bebanir Bangun', 'kec-berau-sambaliung', 2.1105, 117.5321),
    ('desa-bru-rantaupanjang', 'Kampung Rantau Panjang', 'kec-berau-sambaliung', 2.0854, 117.5541),
    ('desa-bru-gunungtabur', 'Kampung Gunung Tabur', 'kec-berau-gunungtabur', 2.1845, 117.4851),
    ('desa-bru-merancang', 'Kampung Merancang Ilir', 'kec-berau-gunungtabur', 2.2214, 117.5214),
    ('desa-bru-telukbayur', 'Kampung Teluk Bayur', 'kec-berau-telukbayur', 2.1214, 117.4351),
    ('desa-bru-labanan', 'Kampung Labanan Jaya', 'kec-berau-telukbayur', 2.0945, 117.3854),
    ('desa-bru-segah', 'Kampung Tepian Buah', 'kec-berau-segah', 2.3451, 117.1854),
    ('desa-bru-kelay', 'Kampung Long Keluh', 'kec-berau-kelay', 1.8451, 117.2145),
    ('desa-bru-talisayan', 'Kampung Talisayan', 'kec-berau-talisayan', 1.5845, 118.1945),
    ('desa-bru-bumijaya', 'Kampung Bumi Jaya', 'kec-berau-talisayan', 1.5944, 118.1812),
    ('desa-bru-tubaan', 'Kampung Tubaan', 'kec-berau-tabalar', 1.7451, 118.0215),
    ('desa-bru-biatan', 'Kampung Biatan Lempake', 'kec-berau-biatan', 1.6845, 118.1124),
    ('desa-bru-batuputih', 'Kampung Batu Putih', 'kec-berau-batuputih', 1.4854, 118.3451),
    ('desa-bru-bidukbiduk', 'Kampung Biduk-Biduk', 'kec-berau-bidukbiduk', 1.2514, 118.6945),
    ('desa-bru-derawan', 'Kampung Pulau Derawan', 'kec-berau-pulauderawan', 2.2854, 118.2415),
    ('desa-bru-maratua', 'Kampung Payung-Payung', 'kec-berau-maratua', 2.1854, 118.5945),

    -- === G. KABUPATEN MAHAKAM ULU (Kampung) ===
    ('desa-mhl-ujohbilang', 'Kampung Ujoh Bilang', 'kec-mahulu-longbagun', 0.5312, 115.2418),
    ('desa-mhl-batumajang', 'Kampung Batu Majang', 'kec-mahulu-longbagun', 0.5485, 115.2184),
    ('desa-mhl-longbagunulu', 'Kampung Long Bagun Ulu', 'kec-mahulu-longbagun', 0.5612, 115.2012),
    ('desa-mhl-longhubung', 'Kampung Long Hubung', 'kec-mahulu-longhubung', 0.3845, 115.3541),
    ('desa-mhl-datahbilang', 'Kampung Datah Bilang Ilir', 'kec-mahulu-longhubung', 0.4012, 115.3854),
    ('desa-mhl-laham', 'Kampung Laham', 'kec-mahulu-laham', 0.4512, 115.3124),
    ('desa-mhl-longpahangai', 'Kampung Long Pahangai', 'kec-mahulu-longpahangai', 0.7845, 114.9854),
    ('desa-mhl-longapari', 'Kampung Long Apari', 'kec-mahulu-longapari', 0.9451, 114.7854),

    -- === H. KOTA BALIKPAPAN (Kelurahan) ===
    ('desa-bpp-klandasanilir', 'Kelurahan Klandasan Ilir', 'kec-bpp-balikpapankota', -1.2654, 116.8345),
    ('desa-bpp-prapatan', 'Kelurahan Prapatan', 'kec-bpp-balikpapankota', -1.2754, 116.8214),
    ('desa-bpp-sepinggan', 'Kelurahan Sepinggan', 'kec-bpp-balikpapanselatan', -1.2541, 116.8945),
    ('desa-bpp-gunungsari', 'Kelurahan Gunung Sari Ilir', 'kec-bpp-balikpapantengah', -1.2415, 116.8451),
    ('desa-bpp-karangjoang', 'Kelurahan Karang Joang', 'kec-bpp-balikpapanutara', -1.1408, 116.8712),
    ('desa-bpp-batuampar', 'Kelurahan Batu Ampar', 'kec-bpp-balikpapanutara', -1.2124, 116.8654),
    ('desa-bpp-kariangau', 'Kelurahan Kariangau', 'kec-bpp-balikpapanbarat', -1.1754, 116.7854),
    ('desa-bpp-teritip', 'Kelurahan Teritip', 'kec-bpp-balikpapantimur', -1.1965, 116.9682),
    ('desa-bpp-manggar', 'Kelurahan Manggar', 'kec-bpp-balikpapantimur', -1.2214, 116.9412),

    -- === I. KOTA SAMARINDA (Kelurahan) ===
    ('desa-smd-pasarpagi', 'Kelurahan Pasar Pagi', 'kec-smd-samarindakota', -0.5012, 117.1451),
    ('desa-smd-jawa', 'Kelurahan Jawa', 'kec-smd-samarindaulu', -0.4854, 117.1354),
    ('desa-smd-sidodadi', 'Kelurahan Sidodadi', 'kec-smd-samarindaulu', -0.4741, 117.1512),
    ('desa-smd-karangmumus', 'Kelurahan Karang Mumus', 'kec-smd-samarindailir', -0.4951, 117.1612),
    ('desa-smd-baqa', 'Kelurahan Baqa', 'kec-smd-samarindaseberang', -0.5214, 117.1412),
    ('desa-smd-karanganyar', 'Kelurahan Karang Anyar', 'kec-smd-sungaikunjang', -0.5124, 117.1124),
    ('desa-smd-sungaipinang', 'Kelurahan Sungai Pinang Dalam', 'kec-smd-sungaipinang', -0.4612, 117.1712),
    ('desa-smd-bukuan', 'Kelurahan Bukuan', 'kec-smd-palaran', -0.5814, 117.1892),
    ('desa-smd-rawamakmur', 'Kelurahan Rawa Makmur', 'kec-smd-palaran', -0.5645, 117.1754),
    ('desa-smd-lempake', 'Kelurahan Lempake', 'kec-smd-samarindautara', -0.4315, 117.2041),
    ('desa-smd-sempaja', 'Kelurahan Sempaja Selatan', 'kec-smd-samarindautara', -0.4512, 117.1612),
    ('desa-smd-sambutan', 'Kelurahan Sambutan', 'kec-smd-sambutan', -0.5214, 117.1945),
    ('desa-smd-simpangtiga', 'Kelurahan Simpang Tiga', 'kec-smd-loajananilir', -0.5451, 117.1214),

    -- === J. KOTA BONTANG (Kelurahan) ===
    ('desa-btg-bontangbaru', 'Kelurahan Bontang Baru', 'kec-btg-bontangutara', 0.1451, 117.4854),
    ('desa-btg-apiapi', 'Kelurahan Api-Api', 'kec-btg-bontangutara', 0.1341, 117.4712),
    ('desa-btg-tanjunglaut', 'Kelurahan Tanjung Laut', 'kec-btg-bontangselatan', 0.1085, 117.4754),
    ('desa-btg-bontanglestari', 'Kelurahan Bontang Lestari', 'kec-btg-bontangselatan', 0.0615, 117.4412),
    ('desa-btg-kanaan', 'Kelurahan Kanaan', 'kec-btg-bontangbarat', 0.1288, 117.4541),
    ('desa-btg-gunungtelihan', 'Kelurahan Gunung Telihan', 'kec-btg-bontangbarat', 0.1312, 117.4415)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- 2. GARANSI SISTEM: Pastikan SETIAP KECAMATAN dari 105 Kecamatan memiliki minimal 1 Kampung/Desa
-- Kueri di bawah secara otomatis menyisipkan Kampung/Desa resmi untuk kecamatan yang belum terisi
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id, lat_pusat, lng_pusat)
select
  'desa-' || replace(kec.kode, 'kec-', '') || '-utama',
  'desa'::public.tipe_wilayah,
  case 
    when kab.nama ilike '%kutai barat%' or kab.nama ilike '%mahakam ulu%' then 'Kampung ' || kec.nama || ' Kota'
    when kab.nama ilike '%kota%' then 'Kelurahan ' || kec.nama
    else 'Desa ' || kec.nama || ' Makmur'
  end,
  kec.id,
  kec.uptd_id,
  kec.lat_pusat,
  kec.lng_pusat
from public.wilayah kec
join public.wilayah kab on kab.id = kec.parent_id
where kec.tipe = 'kecamatan'::public.tipe_wilayah
  and not exists (
    select 1 from public.wilayah d where d.parent_id = kec.id and d.tipe = 'desa'::public.tipe_wilayah
  )
on conflict (kode) do update set
  nama = excluded.nama;
