-- ============================================================================
-- 9. KOTA SAMARINDA (59 Kampung/Desa/Kelurahan)
-- ============================================================================
set search_path = public, auth, extensions;

insert into public.wilayah (kode, tipe, nama, parent_id, lat_pusat, lng_pusat)
select
  v.kode,
  'desa'::public.tipe_wilayah,
  v.nama,
  induk.id,
  induk.lat_pusat,
  induk.lng_pusat
from (
  values
    ('desa-6472010001', 'Kelurahan Simpang Pasir', 'kec-smd-palaran'),
    ('desa-6472010002', 'Kelurahan Handil Bakti', 'kec-smd-palaran'),
    ('desa-6472010003', 'Kelurahan Bantuas', 'kec-smd-palaran'),
    ('desa-6472010004', 'Kelurahan Bukuan', 'kec-smd-palaran'),
    ('desa-6472010005', 'Kelurahan Rawa Makmur', 'kec-smd-palaran'),
    ('desa-6472020006', 'Kelurahan Selili', 'kec-smd-samarindailir'),
    ('desa-6472020007', 'Kelurahan Sungai Dama', 'kec-smd-samarindailir'),
    ('desa-6472020008', 'Kelurahan Sidodamai', 'kec-smd-samarindailir'),
    ('desa-6472020009', 'Kelurahan Sidomulyo', 'kec-smd-samarindailir'),
    ('desa-6472020014', 'Kelurahan Pelita', 'kec-smd-samarindailir'),
    ('desa-6472021001', 'Kelurahan Bugis', 'kec-smd-samarindakota'),
    ('desa-6472021002', 'Kelurahan Pasar Pagi', 'kec-smd-samarindakota'),
    ('desa-6472021003', 'Kelurahan Pelabuhan', 'kec-smd-samarindakota'),
    ('desa-6472021004', 'Kelurahan Sungai Pinang Luar', 'kec-smd-samarindakota'),
    ('desa-6472021005', 'Kelurahan Karang Mumus', 'kec-smd-samarindakota'),
    ('desa-6472022001', 'Kelurahan Pulau Atas', 'kec-smd-sambutan'),
    ('desa-6472022002', 'Kelurahan Sindang Sari', 'kec-smd-sambutan'),
    ('desa-6472022003', 'Kelurahan Makroman', 'kec-smd-sambutan'),
    ('desa-6472022004', 'Kelurahan Sambutan', 'kec-smd-sambutan'),
    ('desa-6472022005', 'Kelurahan Sungai Kapih', 'kec-smd-sambutan'),
    ('desa-6472030001', 'Kelurahan Mesjid', 'kec-smd-samarindaseberang'),
    ('desa-6472030002', 'Kelurahan Baqa', 'kec-smd-samarindaseberang'),
    ('desa-6472030005', 'Kelurahan Sungai Keledang', 'kec-smd-samarindaseberang'),
    ('desa-6472030006', 'Kelurahan Mangkupalas', 'kec-smd-samarindaseberang'),
    ('desa-6472030007', 'Kelurahan Tenun Samarinda', 'kec-smd-samarindaseberang'),
    ('desa-6472030008', 'Kelurahan Gunung Panjang', 'kec-smd-samarindaseberang'),
    ('desa-6472031001', 'Kelurahan Sengkotek', 'kec-smd-loajananilir'),
    ('desa-6472031002', 'Kelurahan Simpang Tiga', 'kec-smd-loajananilir'),
    ('desa-6472031003', 'Kelurahan Tani Aman', 'kec-smd-loajananilir'),
    ('desa-6472031004', 'Kelurahan Harapan Baru', 'kec-smd-loajananilir'),
    ('desa-6472031005', 'Kelurahan Rapak Dalam', 'kec-smd-loajananilir'),
    ('desa-6472040001', 'Kelurahan Loa Buah', 'kec-smd-sungaikunjang'),
    ('desa-6472040002', 'Kelurahan Loa Bakung', 'kec-smd-sungaikunjang'),
    ('desa-6472040003', 'Kelurahan Karang Asam Ulu', 'kec-smd-sungaikunjang'),
    ('desa-6472040004', 'Kelurahan Teluk Lerong Ulu', 'kec-smd-sungaikunjang'),
    ('desa-6472040005', 'Kelurahan Lok Bahu', 'kec-smd-sungaikunjang'),
    ('desa-6472040006', 'Kelurahan Karang Asam Ilir', 'kec-smd-sungaikunjang'),
    ('desa-6472040007', 'Kelurahan Karang Anyar', 'kec-smd-sungaikunjang'),
    ('desa-6472050001', 'Kelurahan Teluk Lerong Ilir', 'kec-smd-samarindaulu'),
    ('desa-6472050002', 'Kelurahan Jawa', 'kec-smd-samarindaulu'),
    ('desa-6472050004', 'Kelurahan Dadi Mulya', 'kec-smd-samarindaulu'),
    ('desa-6472050005', 'Kelurahan Sidodadi', 'kec-smd-samarindaulu'),
    ('desa-6472050006', 'Kelurahan Gunung Kelua', 'kec-smd-samarindaulu'),
    ('desa-6472050007', 'Kelurahan Air Hitam', 'kec-smd-samarindaulu'),
    ('desa-6472050008', 'Kelurahan Air Putih', 'kec-smd-samarindaulu'),
    ('desa-6472050009', 'Kelurahan Bukit Pinang', 'kec-smd-samarindaulu'),
    ('desa-6472060004', 'Kelurahan Lempake', 'kec-smd-samarindautara'),
    ('desa-6472060005', 'Kelurahan Sempaja Selatan', 'kec-smd-samarindautara'),
    ('desa-6472060006', 'Kelurahan Sungai Siring', 'kec-smd-samarindautara'),
    ('desa-6472060010', 'Kelurahan Tanah Merah', 'kec-smd-samarindautara'),
    ('desa-6472060011', 'Kelurahan Sempaja Utara', 'kec-smd-samarindautara'),
    ('desa-6472060012', 'Kelurahan Sempaja Timur', 'kec-smd-samarindautara'),
    ('desa-6472060013', 'Kelurahan Sempaja Barat', 'kec-smd-samarindautara'),
    ('desa-6472060014', 'Kelurahan Budaya Pampang', 'kec-smd-samarindautara'),
    ('desa-6472061001', 'Kelurahan Temindung Permai', 'kec-smd-sungaipinang'),
    ('desa-6472061002', 'Kelurahan Bandara', 'kec-smd-sungaipinang'),
    ('desa-6472061003', 'Kelurahan Sungai Pinang Dalam', 'kec-smd-sungaipinang'),
    ('desa-6472061004', 'Kelurahan Mugirejo', 'kec-smd-sungaipinang'),
    ('desa-6472061005', 'Kelurahan Gunung Lingai', 'kec-smd-sungaipinang')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id;

