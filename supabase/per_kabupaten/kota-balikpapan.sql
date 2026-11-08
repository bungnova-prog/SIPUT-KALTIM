-- ============================================================================
-- 8. KOTA BALIKPAPAN (34 Kampung/Desa/Kelurahan)
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
    ('desa-6471010006', 'Kelurahan Gunung Bahagia', 'kec-bpp-balikpapanselatan'),
    ('desa-6471010007', 'Kelurahan Sepinggan', 'kec-bpp-balikpapanselatan'),
    ('desa-6471010008', 'Kelurahan Damai Baru', 'kec-bpp-balikpapanselatan'),
    ('desa-6471010009', 'Kelurahan Damai Bahagia', 'kec-bpp-balikpapanselatan'),
    ('desa-6471010010', 'Kelurahan Sungai Nangka', 'kec-bpp-balikpapanselatan'),
    ('desa-6471010011', 'Kelurahan Sepinggan Raya', 'kec-bpp-balikpapanselatan'),
    ('desa-6471010012', 'Kelurahan Sepinggan Baru', 'kec-bpp-balikpapanselatan'),
    ('desa-6471011001', 'Kelurahan Prapatan', 'kec-bpp-balikpapankota'),
    ('desa-6471011002', 'Kelurahan Telaga Sari', 'kec-bpp-balikpapankota'),
    ('desa-6471011003', 'Kelurahan Klandasan Ulu', 'kec-bpp-balikpapankota'),
    ('desa-6471011004', 'Kelurahan Klandasan Ilir', 'kec-bpp-balikpapankota'),
    ('desa-6471011005', 'Kelurahan Damai', 'kec-bpp-balikpapankota'),
    ('desa-6471020001', 'Kelurahan Manggar', 'kec-bpp-balikpapantimur'),
    ('desa-6471020002', 'Kelurahan Manggar Baru', 'kec-bpp-balikpapantimur'),
    ('desa-6471020003', 'Kelurahan Lemaru', 'kec-bpp-balikpapantimur'),
    ('desa-6471020004', 'Kelurahan Teritip', 'kec-bpp-balikpapantimur'),
    ('desa-6471030001', 'Kelurahan Muara Rapak', 'kec-bpp-balikpapanutara'),
    ('desa-6471030002', 'Kelurahan Gunung Samarinda', 'kec-bpp-balikpapanutara'),
    ('desa-6471030003', 'Kelurahan Batu Ampar', 'kec-bpp-balikpapanutara'),
    ('desa-6471030004', 'Kelurahan Karang Joang', 'kec-bpp-balikpapanutara'),
    ('desa-6471030005', 'Kelurahan Gunung Samarinda Baru', 'kec-bpp-balikpapanutara'),
    ('desa-6471030006', 'Kelurahan Graha Indah', 'kec-bpp-balikpapanutara'),
    ('desa-6471040001', 'Kelurahan Gunung Sari Ilir', 'kec-bpp-balikpapantengah'),
    ('desa-6471040002', 'Kelurahan Gunung Sari Ulu', 'kec-bpp-balikpapantengah'),
    ('desa-6471040003', 'Kelurahan Mekar Sari', 'kec-bpp-balikpapantengah'),
    ('desa-6471040004', 'Kelurahan Karang Rejo', 'kec-bpp-balikpapantengah'),
    ('desa-6471040005', 'Kelurahan Sumber Rejo', 'kec-bpp-balikpapantengah'),
    ('desa-6471040006', 'Kelurahan Karang Jati', 'kec-bpp-balikpapantengah'),
    ('desa-6471050001', 'Kelurahan Baru Tengah', 'kec-bpp-balikpapanbarat'),
    ('desa-6471050002', 'Kelurahan Marga Sari', 'kec-bpp-balikpapanbarat'),
    ('desa-6471050003', 'Kelurahan Baru Ilir', 'kec-bpp-balikpapanbarat'),
    ('desa-6471050004', 'Kelurahan Margo Mulyo', 'kec-bpp-balikpapanbarat'),
    ('desa-6471050005', 'Kelurahan Baru Ulu', 'kec-bpp-balikpapanbarat'),
    ('desa-6471050006', 'Kelurahan Kariangau', 'kec-bpp-balikpapanbarat')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id;

