-- ============================================================================
-- 10. KOTA BONTANG (14 Kampung/Desa/Kelurahan)
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
    ('desa-6474010001', 'Kelurahan Bontang Lestari', 'kec-btg-bontangselatan'),
    ('desa-6474010002', 'Kelurahan Satimpo', 'kec-btg-bontangselatan'),
    ('desa-6474010003', 'Kelurahan Berebas Pantai', 'kec-btg-bontangselatan'),
    ('desa-6474010004', 'Kelurahan Berebas Tengah', 'kec-btg-bontangselatan'),
    ('desa-6474010005', 'Kelurahan Tanjung Laut', 'kec-btg-bontangselatan'),
    ('desa-6474010006', 'Kelurahan Tanjung Laut Indah', 'kec-btg-bontangselatan'),
    ('desa-6474020001', 'Kelurahan Bontang Kuala', 'kec-btg-bontangutara'),
    ('desa-6474020002', 'Kelurahan Bontang Baru', 'kec-btg-bontangutara'),
    ('desa-6474020003', 'Kelurahan Api-Api', 'kec-btg-bontangutara'),
    ('desa-6474020004', 'Kelurahan Gunung Lai', 'kec-btg-bontangutara'),
    ('desa-6474020005', 'Kelurahan Lok Tuan', 'kec-btg-bontangutara'),
    ('desa-6474030001', 'Kelurahan Kanaan', 'kec-btg-bontangbarat'),
    ('desa-6474030002', 'Kelurahan Gunung Telihan', 'kec-btg-bontangbarat'),
    ('desa-6474030003', 'Kelurahan Belimbing', 'kec-btg-bontangbarat')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id;

