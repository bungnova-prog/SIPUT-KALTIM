-- ============================================================================
-- 2. KABUPATEN PENAJAM PASER UTARA (50 Kampung/Desa/Kelurahan)
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
    ('desa-6409010001', 'Desa Gunung Makmur', 'kec-ppu-babulu'),
    ('desa-6409010002', 'Desa Gunung Intan', 'kec-ppu-babulu'),
    ('desa-6409010003', 'Desa Sumber Sari', 'kec-ppu-babulu'),
    ('desa-6409010004', 'Desa Sri Raharja', 'kec-ppu-babulu'),
    ('desa-6409010005', 'Desa Rawa Mulia', 'kec-ppu-babulu'),
    ('desa-6409010006', 'Desa Sebakung Jaya', 'kec-ppu-babulu'),
    ('desa-6409010007', 'Desa Babulu Laut', 'kec-ppu-babulu'),
    ('desa-6409010008', 'Desa Babulu Darat', 'kec-ppu-babulu'),
    ('desa-6409010009', 'Desa Labangka', 'kec-ppu-babulu'),
    ('desa-6409010010', 'Desa Rintik', 'kec-ppu-babulu'),
    ('desa-6409010011', 'Desa Gunung Mulia', 'kec-ppu-babulu'),
    ('desa-6409010012', 'Desa Labangka Barat', 'kec-ppu-babulu'),
    ('desa-6409020001', 'Desa Api Api', 'kec-ppu-waru'),
    ('desa-6409020003', 'Desa Waru', 'kec-ppu-waru'),
    ('desa-6409020004', 'Desa Bangun Mulya', 'kec-ppu-waru'),
    ('desa-6409030001', 'Desa Tanjung Tengah', 'kec-ppu-penajam'),
    ('desa-6409030002', 'Desa Saloloang', 'kec-ppu-penajam'),
    ('desa-6409030004', 'Desa Giri Mukti', 'kec-ppu-penajam'),
    ('desa-6409030005', 'Desa Lawe Lawe', 'kec-ppu-penajam'),
    ('desa-6409030006', 'Desa Pejala', 'kec-ppu-penajam'),
    ('desa-6409030007', 'Desa Kampung Baru', 'kec-ppu-penajam'),
    ('desa-6409030009', 'Desa Sungai Parit', 'kec-ppu-penajam'),
    ('desa-6409030010', 'Desa Nipah Nipah', 'kec-ppu-penajam'),
    ('desa-6409030011', 'Desa Nenang', 'kec-ppu-penajam'),
    ('desa-6409030013', 'Desa Penajam', 'kec-ppu-penajam'),
    ('desa-6409030014', 'Desa Bulu Minung', 'kec-ppu-penajam'),
    ('desa-6409030015', 'Desa Sotek', 'kec-ppu-penajam'),
    ('desa-6409030016', 'Desa Sepan', 'kec-ppu-penajam'),
    ('desa-6409030017', 'Desa Riko', 'kec-ppu-penajam'),
    ('desa-6409030018', 'Desa Pantai Lango', 'kec-ppu-penajam'),
    ('desa-6409030019', 'Desa Gersik', 'kec-ppu-penajam'),
    ('desa-6409030020', 'Desa Jenebora', 'kec-ppu-penajam'),
    ('desa-6409030021', 'Desa Bukit Subur', 'kec-ppu-penajam'),
    ('desa-6409030022', 'Desa Sidorejo', 'kec-ppu-penajam'),
    ('desa-6409030023', 'Desa Giripurwa', 'kec-ppu-penajam'),
    ('desa-6409040001', 'Desa Maridan', 'kec-ppu-sepaku'),
    ('desa-6409040002', 'Desa Mentawir', 'kec-ppu-sepaku'),
    ('desa-6409040003', 'Desa Pemaluan', 'kec-ppu-sepaku'),
    ('desa-6409040004', 'Desa Bumi Harapan', 'kec-ppu-sepaku'),
    ('desa-6409040005', 'Desa Wonosari', 'kec-ppu-sepaku'),
    ('desa-6409040006', 'Desa Semoi Dua', 'kec-ppu-sepaku'),
    ('desa-6409040007', 'Desa Argo Mulyo', 'kec-ppu-sepaku'),
    ('desa-6409040008', 'Desa Suko Mulyo', 'kec-ppu-sepaku'),
    ('desa-6409040009', 'Desa Tengin Baru', 'kec-ppu-sepaku'),
    ('desa-6409040010', 'Desa Sukaraja', 'kec-ppu-sepaku'),
    ('desa-6409040011', 'Desa Bukit Raya', 'kec-ppu-sepaku'),
    ('desa-6409040012', 'Desa Sepaku', 'kec-ppu-sepaku'),
    ('desa-6409040013', 'Desa Karang Jinawi', 'kec-ppu-sepaku'),
    ('desa-6409040014', 'Desa Telemow', 'kec-ppu-sepaku'),
    ('desa-6409040015', 'Desa Binuang', 'kec-ppu-sepaku')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id;

