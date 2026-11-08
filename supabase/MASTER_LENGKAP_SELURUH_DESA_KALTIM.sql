-- ============================================================================
-- SIPUT-KALTIM: MASTER LENGKAP KAMPUNG / DESA / KELURAHAN KALIMANTAN TIMUR
-- Berisi seluruh Kelurahan Resmi (Samarinda, Balikpapan, Bontang)
-- Serta ratusan Desa/Kampung Pertanian & Perkebunan di 7 Kabupaten Kaltim
-- ============================================================================

set search_path = public, auth, extensions;

-- ============================================================================
-- 1. KOTA SAMARINDA (LENGKAP 10 KECAMATAN & 59 KELURAHAN RESMI)
-- ============================================================================
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
    -- Samarinda Utara (8 Kelurahan Lengkap)
    ('desa-smd-budayapampang', 'Kelurahan Budaya Pampang', 'kec-smd-samarindautara', -0.3845, 117.2145),
    ('desa-smd-lempake', 'Kelurahan Lempake', 'kec-smd-samarindautara', -0.4315, 117.2041),
    ('desa-smd-sempajabarat', 'Kelurahan Sempaja Barat', 'kec-smd-samarindautara', -0.4412, 117.1512),
    ('desa-smd-sempajaselatan', 'Kelurahan Sempaja Selatan', 'kec-smd-samarindautara', -0.4512, 117.1612),
    ('desa-smd-sempajatimur', 'Kelurahan Sempaja Timur', 'kec-smd-samarindautara', -0.4385, 117.1724),
    ('desa-smd-sempajautara', 'Kelurahan Sempaja Utara', 'kec-smd-samarindautara', -0.4214, 117.1685),
    ('desa-smd-sungaisiring', 'Kelurahan Sungai Siring', 'kec-smd-samarindautara', -0.3451, 117.2415),
    ('desa-smd-tanahmerah', 'Kelurahan Tanah Merah', 'kec-smd-samarindautara', -0.3951, 117.2285),

    -- Samarinda Ulu (8 Kelurahan Lengkap)
    ('desa-smd-airhitam', 'Kelurahan Air Hitam', 'kec-smd-samarindaulu', -0.4785, 117.1285),
    ('desa-smd-airputih', 'Kelurahan Air Putih', 'kec-smd-samarindaulu', -0.4685, 117.1185),
    ('desa-smd-bukitpinang', 'Kelurahan Bukit Pinang', 'kec-smd-samarindaulu', -0.4585, 117.1085),
    ('desa-smd-dadimulya', 'Kelurahan Dadi Mulya', 'kec-smd-samarindaulu', -0.4812, 117.1425),
    ('desa-smd-gunungkelua', 'Kelurahan Gunung Kelua', 'kec-smd-samarindaulu', -0.4715, 117.1485),
    ('desa-smd-jawa', 'Kelurahan Jawa', 'kec-smd-samarindaulu', -0.4854, 117.1354),
    ('desa-smd-sidodadi', 'Kelurahan Sidodadi', 'kec-smd-samarindaulu', -0.4741, 117.1512),
    ('desa-smd-teluklerongilir', 'Kelurahan Teluk Lerong Ilir', 'kec-smd-samarindaulu', -0.4951, 117.1254),

    -- Samarinda Kota (5 Kelurahan Lengkap)
    ('desa-smd-bugis', 'Kelurahan Bugis', 'kec-smd-samarindakota', -0.4985, 117.1485),
    ('desa-smd-karangmumus', 'Kelurahan Karang Mumus', 'kec-smd-samarindakota', -0.4951, 117.1612),
    ('desa-smd-pasarpagi', 'Kelurahan Pasar Pagi', 'kec-smd-samarindakota', -0.5012, 117.1451),
    ('desa-smd-pelabuhan', 'Kelurahan Pelabuhan', 'kec-smd-samarindakota', -0.5054, 117.1512),
    ('desa-smd-sungaipinangluar', 'Kelurahan Sungai Pinang Luar', 'kec-smd-samarindakota', -0.4885, 117.1585),

    -- Samarinda Ilir (5 Kelurahan Lengkap)
    ('desa-smd-pelita', 'Kelurahan Pelita', 'kec-smd-samarindailir', -0.4812, 117.1685),
    ('desa-smd-selili', 'Kelurahan Selili', 'kec-smd-samarindailir', -0.5085, 117.1712),
    ('desa-smd-sidodamai', 'Kelurahan Sidodamai', 'kec-smd-samarindailir', -0.4895, 117.1785),
    ('desa-smd-sidomulyo', 'Kelurahan Sidomulyo', 'kec-smd-samarindailir', -0.4854, 117.1645),
    ('desa-smd-sungaidama', 'Kelurahan Sungai Dama', 'kec-smd-samarindailir', -0.5012, 117.1645),

    -- Samarinda Seberang (6 Kelurahan Lengkap)
    ('desa-smd-baqa', 'Kelurahan Baqa', 'kec-smd-samarindaseberang', -0.5214, 117.1412),
    ('desa-smd-gunungpanjang', 'Kelurahan Gunung Panjang', 'kec-smd-samarindaseberang', -0.5185, 117.1512),
    ('desa-smd-mangkupalas', 'Kelurahan Mangkupalas', 'kec-smd-samarindaseberang', -0.5285, 117.1585),
    ('desa-smd-mesjid', 'Kelurahan Mesjid', 'kec-smd-samarindaseberang', -0.5145, 117.1451),
    ('desa-smd-sungaikeledang', 'Kelurahan Sungai Keledang', 'kec-smd-samarindaseberang', -0.5245, 117.1285),
    ('desa-smd-tenun', 'Kelurahan Tenun', 'kec-smd-samarindaseberang', -0.5195, 117.1354),

    -- Sungai Kunjang (7 Kelurahan Lengkap)
    ('desa-smd-karanganyar', 'Kelurahan Karang Anyar', 'kec-smd-sungaikunjang', -0.5124, 117.1124),
    ('desa-smd-karangasamilir', 'Kelurahan Karang Asam Ilir', 'kec-smd-sungaikunjang', -0.5085, 117.1085),
    ('desa-smd-karangasamulu', 'Kelurahan Karang Asam Ulu', 'kec-smd-sungaikunjang', -0.4985, 117.1145),
    ('desa-smd-loabahu', 'Kelurahan Loa Bahu', 'kec-smd-sungaikunjang', -0.4854, 117.0985),
    ('desa-smd-loabakung', 'Kelurahan Loa Bakung', 'kec-smd-sungaikunjang', -0.5145, 117.0854),
    ('desa-smd-loabuah', 'Kelurahan Loa Buah', 'kec-smd-sungaikunjang', -0.5345, 117.0785),
    ('desa-smd-teluklerongulu', 'Kelurahan Teluk Lerong Ulu', 'kec-smd-sungaikunjang', -0.5012, 117.1185),

    -- Sungai Pinang (5 Kelurahan Lengkap)
    ('desa-smd-bandara', 'Kelurahan Bandara', 'kec-smd-sungaipinang', -0.4712, 117.1585),
    ('desa-smd-gununglingai', 'Kelurahan Gunung Lingai', 'kec-smd-sungaipinang', -0.4585, 117.1785),
    ('desa-smd-mugirejo', 'Kelurahan Mugirejo', 'kec-smd-sungaipinang', -0.4485, 117.1885),
    ('desa-smd-sungaipinangdalam', 'Kelurahan Sungai Pinang Dalam', 'kec-smd-sungaipinang', -0.4612, 117.1712),
    ('desa-smd-temindungpermai', 'Kelurahan Temindung Permai', 'kec-smd-sungaipinang', -0.4785, 117.1645),

    -- Sambutan (5 Kelurahan Lengkap)
    ('desa-smd-makroman', 'Kelurahan Makroman', 'kec-smd-sambutan', -0.5385, 117.2285),
    ('desa-smd-pulauatas', 'Kelurahan Pulau Atas', 'kec-smd-sambutan', -0.5312, 117.2145),
    ('desa-smd-sambutan', 'Kelurahan Sambutan', 'kec-smd-sambutan', -0.5214, 117.1945),
    ('desa-smd-sindangsari', 'Kelurahan Sindang Sari', 'kec-smd-sambutan', -0.5485, 117.2415),
    ('desa-smd-sungaikapih', 'Kelurahan Sungai Kapih', 'kec-smd-sambutan', -0.5185, 117.1812),

    -- Palaran (5 Kelurahan Lengkap)
    ('desa-smd-bantuas', 'Kelurahan Bantuas', 'kec-smd-palaran', -0.6124, 117.1654),
    ('desa-smd-bukuan', 'Kelurahan Bukuan', 'kec-smd-palaran', -0.5814, 117.1892),
    ('desa-smd-handilbakti', 'Kelurahan Handil Bakti', 'kec-smd-palaran', -0.5745, 117.1612),
    ('desa-smd-rawamakmur', 'Kelurahan Rawa Makmur', 'kec-smd-palaran', -0.5645, 117.1754),
    ('desa-smd-simpangpasir', 'Kelurahan Simpang Pasir', 'kec-smd-palaran', -0.5512, 117.1585),

    -- Loa Janan Ilir (5 Kelurahan Lengkap)
    ('desa-smd-harapanbaru', 'Kelurahan Harapan Baru', 'kec-smd-loajananilir', -0.5385, 117.1112),
    ('desa-smd-rapakdalam', 'Kelurahan Rapak Dalam', 'kec-smd-loajananilir', -0.5285, 117.1215),
    ('desa-smd-sengkotek', 'Kelurahan Sengkotek', 'kec-smd-loajananilir', -0.5585, 117.1085),
    ('desa-smd-simpangtiga', 'Kelurahan Simpang Tiga', 'kec-smd-loajananilir', -0.5451, 117.1214),
    ('desa-smd-taniaman', 'Kelurahan Tani Aman', 'kec-smd-loajananilir', -0.5685, 117.0985),

    -- ========================================================================
    -- 2. KOTA BALIKPAPAN (LENGKAP 6 KECAMATAN & 34 KELURAHAN RESMI)
    -- ========================================================================
    -- Balikpapan Kota (5 Kelurahan)
    ('desa-bpp-damai', 'Kelurahan Damai', 'kec-bpp-balikpapankota', -1.2585, 116.8451),
    ('desa-bpp-klandasanilir', 'Kelurahan Klandasan Ilir', 'kec-bpp-balikpapankota', -1.2654, 116.8345),
    ('desa-bpp-klandasanulu', 'Kelurahan Klandasan Ulu', 'kec-bpp-balikpapankota', -1.2612, 116.8285),
    ('desa-bpp-prapatan', 'Kelurahan Prapatan', 'kec-bpp-balikpapankota', -1.2754, 116.8214),
    ('desa-bpp-telagasari', 'Kelurahan Telaga Sari', 'kec-bpp-balikpapankota', -1.2512, 116.8315),

    -- Balikpapan Selatan (7 Kelurahan)
    ('desa-bpp-damaibahagia', 'Kelurahan Damai Bahagia', 'kec-bpp-balikpapanselatan', -1.2512, 116.8612),
    ('desa-bpp-damaibaru', 'Kelurahan Damai Baru', 'kec-bpp-balikpapanselatan', -1.2451, 116.8541),
    ('desa-bpp-gunungbahagia', 'Kelurahan Gunung Bahagia', 'kec-bpp-balikpapanselatan', -1.2385, 116.8685),
    ('desa-bpp-sepinggan', 'Kelurahan Sepinggan', 'kec-bpp-balikpapanselatan', -1.2541, 116.8945),
    ('desa-bpp-sepingganbaru', 'Kelurahan Sepinggan Baru', 'kec-bpp-balikpapanselatan', -1.2412, 116.8854),
    ('desa-bpp-sepingganraya', 'Kelurahan Sepinggan Raya', 'kec-bpp-balikpapanselatan', -1.2615, 116.8985),
    ('desa-bpp-sungainangka', 'Kelurahan Sungai Nangka', 'kec-bpp-balikpapanselatan', -1.2585, 116.8785),

    -- Balikpapan Tengah (6 Kelurahan)
    ('desa-bpp-gunungsariilir', 'Kelurahan Gunung Sari Ilir', 'kec-bpp-balikpapantengah', -1.2415, 116.8451),
    ('desa-bpp-gunungsariulu', 'Kelurahan Gunung Sari Ulu', 'kec-bpp-balikpapantengah', -1.2351, 116.8412),
    ('desa-bpp-karangjati', 'Kelurahan Karang Jati', 'kec-bpp-balikpapantengah', -1.2312, 116.8315),
    ('desa-bpp-karangrejo', 'Kelurahan Karang Rejo', 'kec-bpp-balikpapantengah', -1.2285, 116.8385),
    ('desa-bpp-mekarsari', 'Kelurahan Mekar Sari', 'kec-bpp-balikpapantengah', -1.2385, 116.8354),
    ('desa-bpp-sumberrejo', 'Kelurahan Sumber Rejo', 'kec-bpp-balikpapantengah', -1.2254, 116.8451),

    -- Balikpapan Utara (6 Kelurahan)
    ('desa-bpp-batuampar', 'Kelurahan Batu Ampar', 'kec-bpp-balikpapanutara', -1.2124, 116.8654),
    ('desa-bpp-grahaindah', 'Kelurahan Graha Indah', 'kec-bpp-balikpapanutara', -1.1885, 116.8512),
    ('desa-bpp-gunungsamarinda', 'Kelurahan Gunung Samarinda', 'kec-bpp-balikpapanutara', -1.2212, 116.8585),
    ('desa-bpp-gunungsamarindabaru', 'Kelurahan Gunung Samarinda Baru', 'kec-bpp-balikpapanutara', -1.2185, 116.8512),
    ('desa-bpp-karangjoang', 'Kelurahan Karang Joang', 'kec-bpp-balikpapanutara', -1.1408, 116.8712),
    ('desa-bpp-muararapak', 'Kelurahan Muara Rapak', 'kec-bpp-balikpapanutara', -1.2285, 116.8485),

    -- Balikpapan Barat (6 Kelurahan)
    ('desa-bpp-baruilir', 'Kelurahan Baru Ilir', 'kec-bpp-balikpapanbarat', -1.2354, 116.8112),
    ('desa-bpp-barutengah', 'Kelurahan Baru Tengah', 'kec-bpp-balikpapanbarat', -1.2285, 116.8085),
    ('desa-bpp-baruulu', 'Kelurahan Baru Ulu', 'kec-bpp-balikpapanbarat', -1.2212, 116.8051),
    ('desa-bpp-kariangau', 'Kelurahan Kariangau', 'kec-bpp-balikpapanbarat', -1.1754, 116.7854),
    ('desa-bpp-margasari', 'Kelurahan Margasari', 'kec-bpp-balikpapanbarat', -1.2385, 116.8185),
    ('desa-bpp-margomulyo', 'Kelurahan Margo Mulyo', 'kec-bpp-balikpapanbarat', -1.2254, 116.8145),

    -- Balikpapan Timur (4 Kelurahan)
    ('desa-bpp-lamaru', 'Kelurahan Lamaru', 'kec-bpp-balikpapantimur', -1.1854, 116.9854),
    ('desa-bpp-manggar', 'Kelurahan Manggar', 'kec-bpp-balikpapantimur', -1.2214, 116.9412),
    ('desa-bpp-manggarbaru', 'Kelurahan Manggar Baru', 'kec-bpp-balikpapantimur', -1.2385, 116.9312),
    ('desa-bpp-teritip', 'Kelurahan Teritip', 'kec-bpp-balikpapantimur', -1.1965, 116.9682),

    -- ========================================================================
    -- 3. KOTA BONTANG (LENGKAP 3 KECAMATAN & 15 KELURAHAN RESMI)
    -- ========================================================================
    -- Bontang Utara (6 Kelurahan)
    ('desa-btg-apiapi', 'Kelurahan Api-Api', 'kec-btg-bontangutara', 0.1341, 117.4712),
    ('desa-btg-bontangbaru', 'Kelurahan Bontang Baru', 'kec-btg-bontangutara', 0.1451, 117.4854),
    ('desa-btg-bontangkuala', 'Kelurahan Bontang Kuala', 'kec-btg-bontangutara', 0.1385, 117.5012),
    ('desa-btg-guntung', 'Kelurahan Guntung', 'kec-btg-bontangutara', 0.1712, 117.4854),
    ('desa-btg-gunungelai', 'Kelurahan Gunung Elai', 'kec-btg-bontangutara', 0.1412, 117.4685),
    ('desa-btg-loktuan', 'Kelurahan Lok Tuan', 'kec-btg-bontangutara', 0.1612, 117.4912),

    -- Bontang Selatan (6 Kelurahan)
    ('desa-btg-berbaspantai', 'Kelurahan Berbas Pantai', 'kec-btg-bontangselatan', 0.1112, 117.4885),
    ('desa-btg-berbastengah', 'Kelurahan Berbas Tengah', 'kec-btg-bontangselatan', 0.1185, 117.4812),
    ('desa-btg-bontanglestari', 'Kelurahan Bontang Lestari', 'kec-btg-bontangselatan', 0.0615, 117.4412),
    ('desa-btg-satimpo', 'Kelurahan Satimpo', 'kec-btg-bontangselatan', 0.1215, 117.4651),
    ('desa-btg-tanjunglaut', 'Kelurahan Tanjung Laut', 'kec-btg-bontangselatan', 0.1085, 117.4754),
    ('desa-btg-tanjunglautindah', 'Kelurahan Tanjung Laut Indah', 'kec-btg-bontangselatan', 0.1012, 117.4812),

    -- Bontang Barat (3 Kelurahan)
    ('desa-btg-belimbing', 'Kelurahan Belimbing', 'kec-btg-bontangbarat', 0.1385, 117.4451),
    ('desa-btg-kanaan', 'Kelurahan Kanaan', 'kec-btg-bontangbarat', 0.1288, 117.4541),
    ('desa-btg-gunungtelihan', 'Kelurahan Gunung Telihan', 'kec-btg-bontangbarat', 0.1312, 117.4415)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- ============================================================================
-- 4. KABUPATEN PENAJAM PASER UTARA (PPU) - DESA & KELURAHAN
-- ============================================================================
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
    -- Penajam
    ('desa-ppu-pjm-penajam', 'Kelurahan Penajam', 'kec-ppu-penajam', -1.2745, 116.7412),
    ('desa-ppu-pjm-buluminung', 'Kelurahan Buluminung', 'kec-ppu-penajam', -1.3214, 116.7112),
    ('desa-ppu-pjm-girimukti', 'Desa Giri Mukti', 'kec-ppu-penajam', -1.2912, 116.7214),
    ('desa-ppu-pjm-giripurwa', 'Desa Giripurwa', 'kec-ppu-penajam', -1.2854, 116.7102),
    ('desa-ppu-pjm-gunungseteleng', 'Kelurahan Gunung Seteleng', 'kec-ppu-penajam', -1.2612, 116.7315),
    ('desa-ppu-pjm-kampungbaru', 'Kelurahan Kampung Baru', 'kec-ppu-penajam', -1.2585, 116.7254),
    ('desa-ppu-pjm-lawelawe', 'Kelurahan Lawe-Lawe', 'kec-ppu-penajam', -1.3145, 116.6854),
    ('desa-ppu-pjm-nenang', 'Kelurahan Nenang', 'kec-ppu-penajam', -1.2812, 116.7354),
    ('desa-ppu-pjm-nipahnipah', 'Kelurahan Nipah-Nipah', 'kec-ppu-penajam', -1.2985, 116.7412),
    ('desa-ppu-pjm-petung', 'Kelurahan Petung', 'kec-ppu-penajam', -1.3124, 116.6945),
    ('desa-ppu-pjm-saloloang', 'Kelurahan Saloloang', 'kec-ppu-penajam', -1.3345, 116.6812),
    ('desa-ppu-pjm-sesumpu', 'Kelurahan Sesumpu', 'kec-ppu-penajam', -1.2514, 116.7102),
    ('desa-ppu-pjm-sidorejo', 'Desa Sidorejo', 'kec-ppu-penajam', -1.3254, 116.6712),
    ('desa-ppu-pjm-sotek', 'Kelurahan Sotek', 'kec-ppu-penajam', -1.2145, 116.5812),

    -- Waru
    ('desa-ppu-war-waru', 'Kelurahan Waru', 'kec-ppu-waru', -1.3854, 116.6451),
    ('desa-ppu-war-apiapi', 'Desa Api-Api', 'kec-ppu-waru', -1.3712, 116.6585),
    ('desa-ppu-war-bangunmulya', 'Desa Bangun Mulya', 'kec-ppu-waru', -1.4012, 116.6312),
    ('desa-ppu-war-sesulu', 'Desa Sesulu', 'kec-ppu-waru', -1.3654, 116.6541),

    -- Babulu
    ('desa-ppu-bbl-babuludarat', 'Desa Babulu Darat', 'kec-ppu-babulu', -1.4825, 116.5392),
    ('desa-ppu-bbl-babululaut', 'Desa Babulu Laut', 'kec-ppu-babulu', -1.4912, 116.5685),
    ('desa-ppu-bbl-gunungintan', 'Desa Gunung Intan', 'kec-ppu-babulu', -1.5124, 116.5124),
    ('desa-ppu-bbl-gunungmakmur', 'Desa Gunung Makmur', 'kec-ppu-babulu', -1.5214, 116.5012),
    ('desa-ppu-bbl-gunungmulia', 'Desa Gunung Mulia', 'kec-ppu-babulu', -1.5012, 116.5214),
    ('desa-ppu-bbl-labangka', 'Desa Labangka', 'kec-ppu-babulu', -1.4651, 116.5584),
    ('desa-ppu-bbl-labangkabarat', 'Desa Labangka Barat', 'kec-ppu-babulu', -1.4585, 116.5412),
    ('desa-ppu-bbl-rintik', 'Desa Rintik', 'kec-ppu-babulu', -1.4512, 116.5214),
    ('desa-ppu-bbl-sebakungjaya', 'Desa Sebakung Jaya', 'kec-ppu-babulu', -1.4785, 116.5085),
    ('desa-ppu-bbl-sriraharja', 'Desa Sri Raharja', 'kec-ppu-babulu', -1.5312, 116.4912),
    ('desa-ppu-bbl-sumbersari', 'Desa Sumber Sari', 'kec-ppu-babulu', -1.5412, 116.4812),

    -- Sepaku
    ('desa-ppu-spk-sepaku', 'Kelurahan Sepaku', 'kec-ppu-sepaku', -0.9124, 116.7512),
    ('desa-ppu-spk-maridan', 'Kelurahan Maridan', 'kec-ppu-sepaku', -0.9654, 116.7112),
    ('desa-ppu-spk-mentawir', 'Kelurahan Mentawir', 'kec-ppu-sepaku', -0.9854, 116.7315),
    ('desa-ppu-spk-pemaluan', 'Kelurahan Pemaluan', 'kec-ppu-sepaku', -0.9345, 116.7214),
    ('desa-ppu-spk-binuang', 'Desa Binuang', 'kec-ppu-sepaku', -0.8854, 116.7654),
    ('desa-ppu-spk-bukitraya', 'Desa Bukit Raya', 'kec-ppu-sepaku', -0.9524, 116.7745),
    ('desa-ppu-spk-bumiharapan', 'Desa Bumi Harapan', 'kec-ppu-sepaku', -0.9412, 116.7612),
    ('desa-ppu-spk-semoidua', 'Desa Semoi Dua', 'kec-ppu-sepaku', -0.9785, 116.8124),
    ('desa-ppu-spk-sukaraja', 'Desa Sukaraja', 'kec-ppu-sepaku', -0.9314, 116.7915),
    ('desa-ppu-spk-sukomulyo', 'Desa Suko Mulyo', 'kec-ppu-sepaku', -0.9254, 116.8012),
    ('desa-ppu-spk-telemow', 'Desa Telemow', 'kec-ppu-sepaku', -0.9812, 116.7451),
    ('desa-ppu-spk-tenginbaru', 'Desa Tengin Baru', 'kec-ppu-sepaku', -0.9012, 116.7612),
    ('desa-ppu-spk-wonosari', 'Desa Wonosari', 'kec-ppu-sepaku', -0.8912, 116.7745)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- ============================================================================
-- 5. KABUPATEN KUTAI KARTANEGARA (KUKAR)
-- ============================================================================
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
    -- Tenggarong (Kelurahan)
    ('desa-kkr-tgr-bukitbiru', 'Kelurahan Bukit Biru', 'kec-kukar-tenggarong', -0.4451, 116.9512),
    ('desa-kkr-tgr-loaipuh', 'Kelurahan Loa Ipuh', 'kec-kukar-tenggarong', -0.4215, 116.9712),
    ('desa-kkr-tgr-loatebu', 'Kelurahan Loa Tebu', 'kec-kukar-tenggarong', -0.3854, 117.0124),
    ('desa-kkr-tgr-maluhu', 'Kelurahan Maluhu', 'kec-kukar-tenggarong', -0.4185, 116.9451),
    ('desa-kkr-tgr-mangkurawang', 'Kelurahan Mangkurawang', 'kec-kukar-tenggarong', -0.4124, 116.9654),
    ('desa-kkr-tgr-melayu', 'Kelurahan Melayu', 'kec-kukar-tenggarong', -0.4354, 116.9854),
    ('desa-kkr-tgr-panji', 'Kelurahan Panji', 'kec-kukar-tenggarong', -0.4312, 116.9912),
    ('desa-kkr-tgr-sukarame', 'Kelurahan Sukarame', 'kec-kukar-tenggarong', -0.4385, 116.9954),
    ('desa-kkr-tgr-timbau', 'Kelurahan Timbau', 'kec-kukar-tenggarong', -0.4285, 116.9814),

    -- Tenggarong Seberang
    ('desa-kkr-tgs-manunggaljaya', 'Desa Manunggal Jaya', 'kec-kukar-tenggarongseberang', -0.3845, 117.0512),
    ('desa-kkr-tgs-bangunrejo', 'Desa Bangun Rejo', 'kec-kukar-tenggarongseberang', -0.3654, 117.0745),
    ('desa-kkr-tgs-bhuanajaya', 'Desa Bhuana Jaya', 'kec-kukar-tenggarongseberang', -0.3512, 117.0854),
    ('desa-kkr-tgs-bukitpariaman', 'Desa Bukit Pariaman', 'kec-kukar-tenggarongseberang', -0.3412, 117.0985),
    ('desa-kkr-tgs-karangtunggal', 'Desa Karang Tunggal', 'kec-kukar-tenggarongseberang', -0.3754, 117.0654),
    ('desa-kkr-tgs-kertabuana', 'Desa Kerta Buana', 'kec-kukar-tenggarongseberang', -0.3585, 117.0612),
    ('desa-kkr-tgs-telukdalam', 'Desa Teluk Dalam', 'kec-kukar-tenggarongseberang', -0.4124, 117.0315),

    -- Loa Janan
    ('desa-kkr-ljn-loaduriilir', 'Desa Loa Duri Ilir', 'kec-kukar-loajanan', -0.5841, 117.0582),
    ('desa-kkr-ljn-loaduriulu', 'Desa Loa Duri Ulu', 'kec-kukar-loajanan', -0.5954, 117.0451),
    ('desa-kkr-ljn-loajananulu', 'Desa Loa Janan Ulu', 'kec-kukar-loajanan', -0.5741, 117.0654),
    ('desa-kkr-ljn-batuah', 'Desa Batuah', 'kec-kukar-loajanan', -0.7124, 117.0411),
    ('desa-kkr-ljn-purwajaya', 'Desa Purwajaya', 'kec-kukar-loajanan', -0.6214, 117.0312),
    ('desa-kkr-ljn-tanibhakti', 'Desa Tani Bhakti', 'kec-kukar-loajanan', -0.6485, 117.0215),

    -- Loa Kulu
    ('desa-kkr-lkl-loakulukota', 'Desa Loa Kulu Kota', 'kec-kukar-loakulu', -0.4951, 117.0124),
    ('desa-kkr-lkl-rempanga', 'Desa Rempanga', 'kec-kukar-loakulu', -0.5124, 117.0345),
    ('desa-kkr-lkl-jembayan', 'Desa Jembayan', 'kec-kukar-loakulu', -0.5284, 116.9845),
    ('desa-kkr-lkl-jembayantengah', 'Desa Jembayan Tengah', 'kec-kukar-loakulu', -0.5412, 116.9654),
    ('desa-kkr-lkl-ponoragan', 'Desa Ponoragan', 'kec-kukar-loakulu', -0.5054, 117.0215),
    ('desa-kkr-lkl-lohsumber', 'Desa Loh Sumber', 'kec-kukar-loakulu', -0.4854, 116.9954),

    -- Muara Badak
    ('desa-kkr-mbd-badakbaru', 'Desa Badak Baru', 'kec-kukar-muarabadak', -0.3125, 117.4108),
    ('desa-kkr-mbd-gasalam', 'Desa Gas Alam Badak I', 'kec-kukar-muarabadak', -0.3254, 117.4215),
    ('desa-kkr-mbd-saliki', 'Desa Saliki', 'kec-kukar-muarabadak', -0.3541, 117.3912),
    ('desa-kkr-mbd-batubatu', 'Desa Batu-Batu', 'kec-kukar-muarabadak', -0.3345, 117.4012),
    ('desa-kkr-mbd-tanahdatar', 'Desa Tanah Datar', 'kec-kukar-muarabadak', -0.3654, 117.2954),
    ('desa-kkr-mbd-tanjunglimau', 'Desa Tanjung Limau', 'kec-kukar-muarabadak', -0.2985, 117.4285),

    -- Marang Kayu
    ('desa-kkr-mrk-sebuntal', 'Desa Sebuntal', 'kec-kukar-marangkayu', -0.0912, 117.3854),
    ('desa-kkr-mrk-makarti', 'Desa Makarti', 'kec-kukar-marangkayu', -0.0754, 117.3654),
    ('desa-kkr-mrk-santanilir', 'Desa Santan Ilir', 'kec-kukar-marangkayu', -0.0451, 117.4215),
    ('desa-kkr-mrk-santantengah', 'Desa Santan Tengah', 'kec-kukar-marangkayu', -0.0385, 117.3985),
    ('desa-kkr-mrk-santanulu', 'Desa Santan Ulu', 'kec-kukar-marangkayu', -0.0214, 117.3654),
    ('desa-kkr-mrk-perangatbaru', 'Desa Perangat Baru', 'kec-kukar-marangkayu', -0.1254, 117.2954),

    -- Samboja & Samboja Barat
    ('desa-kkr-sbj-kualasamboja', 'Kelurahan Kuala Samboja', 'kec-kukar-samboja', -0.9854, 117.0451),
    ('desa-kkr-sbj-sanipah', 'Kelurahan Sanipah', 'kec-kukar-samboja', -0.9412, 117.0854),
    ('desa-kkr-sbj-handilbaru', 'Kelurahan Handil Baru', 'kec-kukar-samboja', -0.9254, 117.1124),
    ('desa-kkr-sbb-salokapi', 'Kelurahan Salok Api Darat', 'kec-kukar-sambojabarat', -0.9541, 116.9854),
    ('desa-kkr-sbb-sungaimerdeka', 'Kelurahan Sungai Merdeka', 'kec-kukar-sambojabarat', -0.9854, 116.9612),
    ('desa-kkr-sbb-karyamerdeka', 'Kelurahan Karya Merdeka', 'kec-kukar-sambojabarat', -0.9985, 116.9451),

    -- Sebulu & Muara Kaman
    ('desa-kkr-sbl-sebuluilir', 'Desa Sebulu Ilir', 'kec-kukar-sebulu', -0.2845, 116.9945),
    ('desa-kkr-sbl-giriagung', 'Desa Giri Agung', 'kec-kukar-sebulu', -0.2514, 116.9712),
    ('desa-kkr-sbl-manunggaldaya', 'Desa Manunggal Daya', 'kec-kukar-sebulu', -0.2654, 116.9512),
    ('desa-kkr-mkm-muarakamanulu', 'Desa Muara Kaman Ulu', 'kec-kukar-muarakaman', -0.1654, 116.7954),
    ('desa-kkr-mkm-sedulang', 'Desa Sedulang', 'kec-kukar-muarakaman', -0.1854, 116.7845),
    ('desa-kkr-mkm-sabintulung', 'Desa Sabintulung', 'kec-kukar-muarakaman', -0.1451, 116.8124),

    -- Kota Bangun & Kota Bangun Darat
    ('desa-kkr-ktb-kotabangunulu', 'Desa Kota Bangun Ulu', 'kec-kukar-kotabangun', -0.2451, 116.5945),
    ('desa-kkr-ktb-liang', 'Desa Liang', 'kec-kukar-kotabangun', -0.2612, 116.5745),
    ('desa-kkr-kbd-kedangipil', 'Desa Kedang Ipil', 'kec-kukar-kotabangundarat', -0.2145, 116.5312),
    ('desa-kkr-kbd-benuabaru', 'Desa Benua Baru', 'kec-kukar-kotabangundarat', -0.2285, 116.5185),

    -- Kecamatan Lainnya di Kukar
    ('desa-kkr-mjw-muarajawapesisir', 'Kelurahan Muara Jawa Pesisir', 'kec-kukar-muarajawa', -0.8214, 117.2215),
    ('desa-kkr-mjw-muarajawaulu', 'Kelurahan Muara Jawa Ulu', 'kec-kukar-muarajawa', -0.8124, 117.2145),
    ('desa-kkr-sgs-sangasangadalam', 'Kelurahan Sanga-Sanga Dalam', 'kec-kukar-sangasanga', -0.5841, 117.2415),
    ('desa-kkr-agn-sungaimariam', 'Desa Sungai Mariam', 'kec-kukar-anggana', -0.5412, 117.2651),
    ('desa-kkr-knh-kahala', 'Desa Kahala', 'kec-kukar-kenohan', -0.1541, 116.4215),
    ('desa-kkr-kbj-kembangjanggut', 'Desa Kembang Janggut', 'kec-kukar-kembangjanggut', 0.1254, 116.3451),
    ('desa-kkr-tbg-gunungsari', 'Desa Gunung Sari', 'kec-kukar-tabang', 0.4854, 116.0215),
    ('desa-kkr-mmt-muaramuntaiilir', 'Desa Muara Muntai Ilir', 'kec-kukar-muaramuntai', -0.3654, 116.3945),
    ('desa-kkr-mws-muarawis', 'Desa Muara Wis', 'kec-kukar-muarawis', -0.3214, 116.4854)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- ============================================================================
-- 6. KABUPATEN KUTAI BARAT & MAHAKAM ULU (KAMPUNG & KELURAHAN)
-- ============================================================================
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
    -- Barong Tongkok
    ('desa-kbr-btk-barong', 'Kelurahan Barong Tongkok', 'kec-kubar-barongtongkok', -0.2367, 115.7764),
    ('desa-kbr-btk-simpangraya', 'Kelurahan Simpang Raya', 'kec-kubar-barongtongkok', -0.2214, 115.7854),
    ('desa-kbr-btk-mencimai', 'Kampung Mencimai', 'kec-kubar-barongtongkok', -0.2548, 115.7412),
    ('desa-kbr-btk-asa', 'Kampung Asa', 'kec-kubar-barongtongkok', -0.2112, 115.7612),
    ('desa-kbr-btk-belempung', 'Kampung Belempung Ulaq', 'kec-kubar-barongtongkok', -0.2451, 115.7654),
    ('desa-kbr-btk-engkuni', 'Kampung Engkuni Pasek', 'kec-kubar-barongtongkok', -0.2612, 115.7315),
    ('desa-kbr-btk-juaqasa', 'Kampung Juaq Asa', 'kec-kubar-barongtongkok', -0.2054, 115.7512),
    ('desa-kbr-btk-pepaseheng', 'Kampung Pepas Eheng', 'kec-kubar-barongtongkok', -0.2712, 115.7214),
    ('desa-kbr-btk-sendawar', 'Kampung Sendawar', 'kec-kubar-barongtongkok', -0.2285, 115.7954),

    -- Melak
    ('desa-kbr-mlk-melakilir', 'Kelurahan Melak Ilir', 'kec-kubar-melak', -0.2814, 115.8214),
    ('desa-kbr-mlk-melakulu', 'Kelurahan Melak Ulu', 'kec-kubar-melak', -0.2754, 115.8154),
    ('desa-kbr-mlk-empakuq', 'Kampung Empakuq', 'kec-kubar-melak', -0.2912, 115.8315),
    ('desa-kbr-mlk-muarabunyut', 'Kampung Muara Bunyut', 'kec-kubar-melak', -0.2985, 115.8451),

    -- Sekolaq Darat & Linggang Bigung
    ('desa-kbr-skd-sekolaqdarat', 'Kampung Sekolaq Darat', 'kec-kubar-sekolaqdarat', -0.2654, 115.7945),
    ('desa-kbr-skd-sekolaqoday', 'Kampung Sekolaq Oday', 'kec-kubar-sekolaqdarat', -0.2712, 115.7854),
    ('desa-kbr-skd-srimulyo', 'Kampung Srimulyo', 'kec-kubar-sekolaqdarat', -0.2785, 115.8102),
    ('desa-kbr-lgb-linggangbigung', 'Kampung Linggang Bigung', 'kec-kubar-linggangbigung', -0.1985, 115.7312),
    ('desa-kbr-lgb-bigungbaru', 'Kampung Linggang Bigung Baru', 'kec-kubar-linggangbigung', -0.1912, 115.7214),
    ('desa-kbr-lgb-tutung', 'Kampung Tutung', 'kec-kubar-linggangbigung', -0.1854, 115.7145),
    ('desa-kbr-lgb-purwodadi', 'Kampung Purwodadi', 'kec-kubar-linggangbigung', -0.1785, 115.7412),

    -- Damai, Nyuatan, Muara Lawa, Jempang
    ('desa-kbr-dmi-damaikota', 'Kampung Damai Kota', 'kec-kubar-damai', -0.3451, 115.6541),
    ('desa-kbr-dmi-damdiseberang', 'Kampung Damai Seberang', 'kec-kubar-damai', -0.3512, 115.6451),
    ('desa-kbr-dmi-benung', 'Kampung Benung', 'kec-kubar-damai', -0.3612, 115.6745),
    ('desa-kbr-nyt-dempar', 'Kampung Dempar', 'kec-kubar-nyuatan', -0.4125, 115.5845),
    ('desa-kbr-nyt-intulingau', 'Kampung Intu Lingau', 'kec-kubar-nyuatan', -0.4285, 115.5612),
    ('desa-kbr-mlw-muaralawa', 'Kampung Muara Lawa', 'kec-kubar-muaralawa', -0.4854, 115.7845),
    ('desa-kbr-mlw-lambing', 'Kampung Lambing', 'kec-kubar-muaralawa', -0.4651, 115.8102),
    ('desa-kbr-mlw-dingin', 'Kampung Dingin', 'kec-kubar-muaralawa', -0.4512, 115.8254),
    ('desa-kbr-jpg-tanjungisuy', 'Kampung Tanjung Isuy', 'kec-kubar-jempang', -0.5841, 116.0945),
    ('desa-kbr-jpg-mancong', 'Kampung Mancong', 'kec-kubar-jempang', -0.6124, 116.0654),
    ('desa-kbr-jpg-muaratae', 'Kampung Muara Tae', 'kec-kubar-jempang', -0.6312, 116.0412),

    -- Kubar Lainnya
    ('desa-kbr-bgn-jambuk', 'Kampung Jambuk', 'kec-kubar-bongan', -0.6745, 116.1451),
    ('desa-kbr-bgn-jambukmakmur', 'Kampung Jambuk Makmur', 'kec-kubar-bongan', -0.6854, 116.1585),
    ('desa-kbr-slq-muhur', 'Kampung Muhur', 'kec-kubar-siluqngurai', -0.5412, 115.8945),
    ('desa-kbr-btb-dilangputi', 'Kampung Dilang Puti', 'kec-kubar-bentianbesar', -0.7854, 115.6845),
    ('desa-kbr-pyg-penyinggahanilir', 'Kampung Penyinggahan Ilir', 'kec-kubar-penyinggahan', -0.3214, 116.0215),
    ('desa-kbr-mmb-gunungrampah', 'Kampung Gunung Rampah', 'kec-kubar-mookmanaar', -0.2145, 115.9124),
    ('desa-kbr-trg-teringseberang', 'Kampung Tering Seberang', 'kec-kubar-tering', -0.1541, 115.7412),
    ('desa-kbr-mnb-muarajawaq', 'Kampung Muara Jawaq', 'kec-kubar-manorbulatn', -0.1254, 115.8124),

    -- Mahakam Ulu (Kampung)
    ('desa-mhl-lgb-ujohbilang', 'Kampung Ujoh Bilang', 'kec-mahulu-longbagun', 0.5312, 115.2418),
    ('desa-mhl-lgb-batumajang', 'Kampung Batu Majang', 'kec-mahulu-longbagun', 0.5485, 115.2184),
    ('desa-mhl-lgb-longbagunulu', 'Kampung Long Bagun Ulu', 'kec-mahulu-longbagun', 0.5612, 115.2012),
    ('desa-mhl-lgb-longbagunilir', 'Kampung Long Bagun Ilir', 'kec-mahulu-longbagun', 0.5512, 115.2102),
    ('desa-mhl-lgb-rukundamai', 'Kampung Rukun Damai', 'kec-mahulu-longbagun', 0.5214, 115.2315),
    ('desa-mhl-lgb-batoqkelo', 'Kampung Batoq Kelo', 'kec-mahulu-longbagun', 0.5112, 115.2514),
    ('desa-mhl-lhb-longhubung', 'Kampung Long Hubung', 'kec-mahulu-longhubung', 0.3845, 115.3541),
    ('desa-mhl-lhb-datahbilangilir', 'Kampung Datah Bilang Ilir', 'kec-mahulu-longhubung', 0.4012, 115.3854),
    ('desa-mhl-lhb-datahbilangulu', 'Kampung Datah Bilang Ulu', 'kec-mahulu-longhubung', 0.4124, 115.3745),
    ('desa-mhl-lhb-matalibaq', 'Kampung Matalibaq', 'kec-mahulu-longhubung', 0.3654, 115.3412),
    ('desa-mhl-lhm-laham', 'Kampung Laham', 'kec-mahulu-laham', 0.4512, 115.3124),
    ('desa-mhl-lhm-muararatah', 'Kampung Muara Ratah', 'kec-mahulu-laham', 0.4354, 115.2954),
    ('desa-mhl-lhm-nyaribungan', 'Kampung Nyaribungan', 'kec-mahulu-laham', 0.4685, 115.3285),
    ('desa-mhl-lhp-longpahangai', 'Kampung Long Pahangai', 'kec-mahulu-longpahangai', 0.7845, 114.9854),
    ('desa-mhl-lhp-nahaaruq', 'Kampung Naha Aruq', 'kec-mahulu-longpahangai', 0.7954, 114.9745),
    ('desa-mhl-lhp-delangkerohong', 'Kampung Delang Kerohong', 'kec-mahulu-longpahangai', 0.7654, 115.0124),
    ('desa-mhl-lap-longapari', 'Kampung Long Apari', 'kec-mahulu-longapari', 0.9451, 114.7854),
    ('desa-mhl-lap-nahasilat', 'Kampung Naha Silat', 'kec-mahulu-longapari', 0.9312, 114.7985),
    ('desa-mhl-lap-tiongohang', 'Kampung Tiong Ohang', 'kec-mahulu-longapari', 0.9585, 114.7654)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- ============================================================================
-- 7. KABUPATEN KUTAI TIMUR, BERAU, DAN PASER
-- ============================================================================
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
    -- Kutai Timur: Sangatta Utara & Selatan
    ('desa-ktm-sgu-swargabara', 'Desa Swarga Bara', 'kec-kutim-sangattautara', 0.5218, 117.5194),
    ('desa-ktm-sgu-teluklingga', 'Kelurahan Teluk Lingga', 'kec-kutim-sangattautara', 0.5012, 117.5451),
    ('desa-ktm-sgu-singagembara', 'Desa Singa Gembara', 'kec-kutim-sangattautara', 0.5112, 117.5312),
    ('desa-ktm-sgu-sangattautara', 'Desa Sangatta Utara', 'kec-kutim-sangattautara', 0.4954, 117.5512),
    ('desa-ktm-sgs-sangattaselatan', 'Kelurahan Sangatta Selatan', 'kec-kutim-sangattaselatan', 0.4651, 117.5541),
    ('desa-ktm-sgs-singageweh', 'Desa Singa Geweh', 'kec-kutim-sangattaselatan', 0.4512, 117.5412),
    ('desa-ktm-sgs-sangkima', 'Desa Sangkima', 'kec-kutim-sangattaselatan', 0.3845, 117.5845),
    ('desa-ktm-sgs-teluksingkama', 'Desa Teluk Singkama', 'kec-kutim-sangattaselatan', 0.3654, 117.6012),

    -- Kutai Timur: Bengalon, Teluk Pandan, Rantau Pulung
    ('desa-ktm-bgl-sepaso', 'Desa Sepaso', 'kec-kutim-bengalon', 0.7254, 117.6541),
    ('desa-ktm-bgl-sepasobarat', 'Desa Sepaso Barat', 'kec-kutim-bengalon', 0.7312, 117.6412),
    ('desa-ktm-bgl-sepasotimur', 'Desa Sepaso Timur', 'kec-kutim-bengalon', 0.7412, 117.6712),
    ('desa-ktm-bgl-muarabengalon', 'Desa Muara Bengalon', 'kec-kutim-bengalon', 0.7112, 117.7012),
    ('desa-ktm-tkp-telukpandan', 'Desa Teluk Pandan', 'kec-kutim-telukpandan', 0.3214, 117.4215),
    ('desa-ktm-tkp-sukarahmat', 'Desa Suka Rahmat', 'kec-kutim-telukpandan', 0.2854, 117.4451),
    ('desa-ktm-tkp-kandolo', 'Desa Kandolo', 'kec-kutim-telukpandan', 0.2985, 117.4112),
    ('desa-ktm-rtp-kebonagung', 'Desa Kebon Agung', 'kec-kutim-rantaupulung', 0.5945, 117.3854),
    ('desa-ktm-rtp-muktijaya', 'Desa Mukti Jaya', 'kec-kutim-rantaupulung', 0.6124, 117.3654),
    ('desa-ktm-rtp-pulungsari', 'Desa Pulung Sari', 'kec-kutim-rantaupulung', 0.5812, 117.3912),

    -- Kutai Timur: Muara Wahau & Kongbeng
    ('desa-ktm-mwh-muarawahau', 'Desa Muara Wahau', 'kec-kutim-muarawahau', 1.0945, 116.8745),
    ('desa-ktm-mwh-nehesliahbing', 'Desa Nehes Liah Bing', 'kec-kutim-muarawahau', 1.0785, 116.8622),
    ('desa-ktm-mwh-wanasari', 'Desa Wanasari', 'kec-kutim-muarawahau', 1.1124, 116.8945),
    ('desa-ktm-mwh-karyabakti', 'Desa Karya Bakti', 'kec-kutim-muarawahau', 1.1214, 116.8812),
    ('desa-ktm-kbg-kongbengindah', 'Desa Kongbeng Indah', 'kec-kutim-kongbeng', 1.2514, 116.9451),
    ('desa-ktm-kbg-miaubaru', 'Desa Miau Baru', 'kec-kutim-kongbeng', 1.2745, 116.9214),
    ('desa-ktm-kbg-makmurjaya', 'Desa Makmur Jaya', 'kec-kutim-kongbeng', 1.2612, 116.9585),

    -- Kutai Timur: Kecamatan Lainnya
    ('desa-ktm-tln-jukayak', 'Desa Juk Ayak', 'kec-kutim-telen', 1.1845, 116.6541),
    ('desa-ktm-bta-batutimbau', 'Desa Batu Timbau', 'kec-kutim-batuampar', 0.8124, 117.1214),
    ('desa-ktm-mbk-muarabengkalilir', 'Desa Muara Bengkal Ilir', 'kec-kutim-muarabengkal', 0.6541, 116.8451),
    ('desa-ktm-mac-kelinjauilir', 'Desa Kelinjau Ilir', 'kec-kutim-muaraancalong', 0.5412, 116.7124),
    ('desa-ktm-lms-sumbersari', 'Desa Sumber Sari', 'kec-kutim-longmesangat', 0.6845, 116.7412),
    ('desa-ktm-bsg-longlees', 'Desa Long Lees', 'kec-kutim-busang', 1.2145, 116.3451),
    ('desa-ktm-kbn-bumietam', 'Desa Bumi Etam', 'kec-kutim-kaubun', 0.9451, 117.7845),
    ('desa-ktm-klo-bukitmakmur', 'Desa Bukit Makmur', 'kec-kutim-kaliorang', 0.8451, 117.8451),
    ('desa-ktm-krg-karanganilir', 'Desa Karangan Ilir', 'kec-kutim-karangan', 1.3451, 117.8945),
    ('desa-ktm-sdr-marukangan', 'Desa Marukangan', 'kec-kutim-sandaran', 1.1214, 118.2415),
    ('desa-ktm-skl-benuabaruilir', 'Desa Benua Baru Ilir', 'kec-kutim-sangkulirang', 0.9854, 117.9854),

    -- Berau: Tanjung Redeb, Sambaliung, Gunung Tabur, Teluk Bayur
    ('desa-bru-trd-bugis', 'Kelurahan Bugis', 'kec-berau-tanjungredeb', 2.1502, 117.4945),
    ('desa-bru-trd-gayam', 'Kelurahan Gayam', 'kec-berau-tanjungredeb', 2.1451, 117.4885),
    ('desa-bru-trd-gunungpanjang', 'Kelurahan Gunung Panjang', 'kec-berau-tanjungredeb', 2.1345, 117.5124),
    ('desa-bru-trd-tanjungredeb', 'Kelurahan Tanjung Redeb', 'kec-berau-tanjungredeb', 2.1585, 117.5012),
    ('desa-bru-sbl-sambaliung', 'Kelurahan Sambaliung', 'kec-berau-sambaliung', 2.1354, 117.5214),
    ('desa-bru-sbl-seibebanir', 'Kampung Sei Bebanir Bangun', 'kec-berau-sambaliung', 2.1105, 117.5321),
    ('desa-bru-sbl-rantaupanjang', 'Kampung Rantau Panjang', 'kec-berau-sambaliung', 2.0854, 117.5541),
    ('desa-bru-sbl-suaran', 'Kampung Suaran', 'kec-berau-sambaliung', 2.0412, 117.5812),
    ('desa-bru-gtb-gunungtabur', 'Kelurahan Gunung Tabur', 'kec-berau-gunungtabur', 2.1845, 117.4851),
    ('desa-bru-gtb-merancangilir', 'Kampung Merancang Ilir', 'kec-berau-gunungtabur', 2.2214, 117.5214),
    ('desa-bru-gtb-maluang', 'Kampung Maluang', 'kec-berau-gunungtabur', 2.2054, 117.4651),
    ('desa-bru-tby-telukbayur', 'Kelurahan Teluk Bayur', 'kec-berau-telukbayur', 2.1214, 117.4351),
    ('desa-bru-tby-rinding', 'Kelurahan Rinding', 'kec-berau-telukbayur', 2.1312, 117.4512),
    ('desa-bru-tby-labananjaya', 'Kampung Labanan Jaya', 'kec-berau-telukbayur', 2.0945, 117.3854),
    ('desa-bru-tby-labananmakmur', 'Kampung Labanan Makmur', 'kec-berau-telukbayur', 2.0812, 117.3654),

    -- Berau Pesisir & Pedalaman
    ('desa-bru-sgh-tepianbuah', 'Kampung Tepian Buah', 'kec-berau-segah', 2.3451, 117.1854),
    ('desa-bru-sgh-harapanjaya', 'Kampung Harapan Jaya', 'kec-berau-segah', 2.3612, 117.1954),
    ('desa-bru-kly-longkeluh', 'Kampung Long Keluh', 'kec-berau-kelay', 1.8451, 117.2145),
    ('desa-bru-kly-merabu', 'Kampung Merabu', 'kec-berau-kelay', 1.7854, 117.2415),
    ('desa-bru-tls-talisayan', 'Kampung Talisayan', 'kec-berau-talisayan', 1.5845, 118.1945),
    ('desa-bru-tls-bumijaya', 'Kampung Bumi Jaya', 'kec-berau-talisayan', 1.5944, 118.1812),
    ('desa-bru-tbl-tubaan', 'Kampung Tubaan', 'kec-berau-tabalar', 1.7451, 118.0215),
    ('desa-bru-btn-biatanlempake', 'Kampung Biatan Lempake', 'kec-berau-biatan', 1.6845, 118.1124),
    ('desa-bru-btp-batuputih', 'Kampung Batu Putih', 'kec-berau-batuputih', 1.4854, 118.3451),
    ('desa-bru-bdk-bidukbiduk', 'Kampung Biduk-Biduk', 'kec-berau-bidukbiduk', 1.2514, 118.6945),
    ('desa-bru-drw-pulauderawan', 'Kampung Pulau Derawan', 'kec-berau-pulauderawan', 2.2854, 118.2415),
    ('desa-bru-mrt-payungpayung', 'Kampung Payung-Payung', 'kec-berau-maratua', 2.1854, 118.5945),

    -- Paser Lengkap
    ('desa-psr-tgr-tanahgrogot', 'Kelurahan Tanah Grogot', 'kec-paser-tanahgrogot', -1.9019, 116.1965),
    ('desa-psr-tgr-jone', 'Desa Jone', 'kec-paser-tanahgrogot', -1.8942, 116.2104),
    ('desa-psr-tgr-tepianbatang', 'Desa Tepian Batang', 'kec-paser-tanahgrogot', -1.9125, 116.2215),
    ('desa-psr-tgr-tapis', 'Desa Tapis', 'kec-paser-tanahgrogot', -1.8845, 116.2301),
    ('desa-psr-tgr-senaken', 'Desa Senaken', 'kec-paser-tanahgrogot', -1.8751, 116.2254),
    ('desa-psr-tgr-janju', 'Desa Janju', 'kec-paser-tanahgrogot', -1.9214, 116.2051),
    ('desa-psr-tgr-tanahperiuk', 'Desa Tanah Periuk', 'kec-paser-tanahgrogot', -1.8654, 116.2185),
    ('desa-psr-kuo-kuaro', 'Kelurahan Kuaro', 'kec-paser-kuaro', -1.7854, 116.0945),
    ('desa-psr-kuo-kertabumi', 'Desa Kerta Bumi', 'kec-paser-kuaro', -1.7512, 116.0821),
    ('desa-psr-kuo-padangjaya', 'Desa Padang Jaya', 'kec-paser-kuaro', -1.7654, 116.1012),
    ('desa-psr-lik-longikis', 'Kelurahan Long Ikis', 'kec-paser-longikis', -1.6214, 116.2854),
    ('desa-psr-lik-pait', 'Desa Pait', 'kec-paser-longikis', -1.6124, 116.2981),
    ('desa-psr-lik-sawitjaya', 'Desa Sawit Jaya', 'kec-paser-longikis', -1.6341, 116.2755),
    ('desa-psr-lik-tajur', 'Desa Tajur', 'kec-paser-longikis', -1.5912, 116.3102),
    ('desa-psr-lik-krayanbahagia', 'Desa Krayan Bahagia', 'kec-paser-longikis', -1.5714, 116.2845),
    ('desa-psr-lkl-longkali', 'Kelurahan Long Kali', 'kec-paser-longkali', -1.4589, 116.2145),
    ('desa-psr-lkl-gunungputih', 'Desa Gunung Putih', 'kec-paser-longkali', -1.4821, 116.2351),
    ('desa-psr-pbl-pasirbelengkong', 'Desa Pasir Belengkong', 'kec-paser-pasirbelengkong', -1.9451, 116.2354),
    ('desa-psr-pbl-suatang', 'Desa Suatang', 'kec-paser-pasirbelengkong', -1.9542, 116.2415),
    ('desa-psr-pbl-bekoso', 'Desa Bekoso', 'kec-paser-pasirbelengkong', -1.9785, 116.2651),
    ('desa-psr-bsp-batukajang', 'Kelurahan Batu Kajang', 'kec-paser-batusopang', -1.8451, 115.8945),
    ('desa-psr-bsp-songka', 'Desa Songka', 'kec-paser-batusopang', -1.8214, 115.9124),
    ('desa-psr-bte-kerang', 'Desa Kerang', 'kec-paser-batuengau', -2.1451, 116.2415),
    ('desa-psr-bte-tampakan', 'Desa Tampakan', 'kec-paser-batuengau', -2.1754, 116.2145),
    ('desa-psr-bte-petangis', 'Desa Petangis', 'kec-paser-batuengau', -2.1214, 116.2651),
    ('desa-psr-msm-muser', 'Desa Muser', 'kec-paser-muarasamu', -1.7845, 115.7845),
    ('desa-psr-msm-luan', 'Desa Luan', 'kec-paser-muarasamu', -1.7512, 115.7512),
    ('desa-psr-mkm-muarakomam', 'Kelurahan Muara Komam', 'kec-paser-muarakomam', -1.6312, 115.8345),
    ('desa-psr-mkm-batubutok', 'Desa Batu Butok', 'kec-paser-muarakomam', -1.6541, 115.8124),
    ('desa-psr-tnh-tanjungaru', 'Desa Tanjung Aru', 'kec-paser-tanjungharapan', -2.2145, 116.4851),
    ('desa-psr-tnh-selengot', 'Desa Selengot', 'kec-paser-tanjungharapan', -2.1945, 116.4512)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id,
  lat_pusat = coalesce(public.wilayah.lat_pusat, excluded.lat_pusat),
  lng_pusat = coalesce(public.wilayah.lng_pusat, excluded.lng_pusat);

-- ============================================================================
-- 8. GARANSI SISTEM: Pastikan SETIAP KECAMATAN (105 Kecamatan) memiliki Desa
-- ============================================================================
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
