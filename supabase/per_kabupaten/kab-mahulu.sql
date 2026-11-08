-- ============================================================================
-- 7. KABUPATEN MAHAKAM ULU (50 Kampung/Desa/Kelurahan)
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
    ('desa-6411010001', 'Kampung Nyaribungan', 'kec-mahulu-laham'),
    ('desa-6411010002', 'Kampung Long Gelawang', 'kec-mahulu-laham'),
    ('desa-6411010003', 'Kampung Danum Paroi', 'kec-mahulu-laham'),
    ('desa-6411010004', 'Kampung Muara Ratah', 'kec-mahulu-laham'),
    ('desa-6411010005', 'Kampung Laham', 'kec-mahulu-laham'),
    ('desa-6411020001', 'Kampung Lutan', 'kec-mahulu-longhubung'),
    ('desa-6411020002', 'Kampung Memahak Teboq', 'kec-mahulu-longhubung'),
    ('desa-6411020003', 'Kampung Sirau', 'kec-mahulu-longhubung'),
    ('desa-6411020004', 'Kampung Mata Libaq', 'kec-mahulu-longhubung'),
    ('desa-6411020005', 'Kampung Datah Bilang Ilir', 'kec-mahulu-longhubung'),
    ('desa-6411020006', 'Kampung Datah Bilang Ulu', 'kec-mahulu-longhubung'),
    ('desa-6411020007', 'Kampung Datah Bilang Baru', 'kec-mahulu-longhubung'),
    ('desa-6411020008', 'Kampung Long Hubung', 'kec-mahulu-longhubung'),
    ('desa-6411020009', 'Kampung Wana Pariq', 'kec-mahulu-longhubung'),
    ('desa-6411020010', 'Kampung Tri Pariq Makmur', 'kec-mahulu-longhubung'),
    ('desa-6411020011', 'Kampung Long Hubung Ulu', 'kec-mahulu-longhubung'),
    ('desa-6411030001', 'Kampung Long Hurai', 'kec-mahulu-longbagun'),
    ('desa-6411030002', 'Kampung Rukun Damai', 'kec-mahulu-longbagun'),
    ('desa-6411030003', 'Kampung Long Merah', 'kec-mahulu-longbagun'),
    ('desa-6411030004', 'Kampung Mamahak Ilir', 'kec-mahulu-longbagun'),
    ('desa-6411030005', 'Kampung Mamahak Ulu', 'kec-mahulu-longbagun'),
    ('desa-6411030006', 'Kampung Long Melaham', 'kec-mahulu-longbagun'),
    ('desa-6411030007', 'Kampung Ujoh Bilang', 'kec-mahulu-longbagun'),
    ('desa-6411030008', 'Kampung Batu Majang', 'kec-mahulu-longbagun'),
    ('desa-6411030009', 'Kampung Batoq Kelo', 'kec-mahulu-longbagun'),
    ('desa-6411030010', 'Kampung Long Bagun Ulu', 'kec-mahulu-longbagun'),
    ('desa-6411030011', 'Kampung Long Bagun Ilir', 'kec-mahulu-longbagun'),
    ('desa-6411040001', 'Kampung Delang Kerohong', 'kec-mahulu-longpahangai'),
    ('desa-6411040002', 'Kampung Long Lunuk Baru', 'kec-mahulu-longpahangai'),
    ('desa-6411040003', 'Kampung Long Lunuk', 'kec-mahulu-longpahangai'),
    ('desa-6411040004', 'Kampung Naha Aruq', 'kec-mahulu-longpahangai'),
    ('desa-6411040005', 'Kampung Long Pahangai Dua', 'kec-mahulu-longpahangai'),
    ('desa-6411040006', 'Kampung Long Tuyoq', 'kec-mahulu-longpahangai'),
    ('desa-6411040007', 'Kampung Liu Mulang', 'kec-mahulu-longpahangai'),
    ('desa-6411040008', 'Kampung Long Pahangai Satu', 'kec-mahulu-longpahangai'),
    ('desa-6411040009', 'Kampung Datah Naha', 'kec-mahulu-longpahangai'),
    ('desa-6411040010', 'Kampung Long Isun', 'kec-mahulu-longpahangai'),
    ('desa-6411040011', 'Kampung Lirung Ubing', 'kec-mahulu-longpahangai'),
    ('desa-6411040012', 'Kampung Long Pakaq', 'kec-mahulu-longpahangai'),
    ('desa-6411040013', 'Kampung Long Pakaq Baru', 'kec-mahulu-longpahangai'),
    ('desa-6411050001', 'Kampung Naha Tifab', 'kec-mahulu-longapari'),
    ('desa-6411050002', 'Kampung Noha Silat', 'kec-mahulu-longapari'),
    ('desa-6411050003', 'Kampung Long Penaneh Dua', 'kec-mahulu-longapari'),
    ('desa-6411050004', 'Kampung Tiong Ohang', 'kec-mahulu-longapari'),
    ('desa-6411050005', 'Kampung Naha Buan', 'kec-mahulu-longapari'),
    ('desa-6411050006', 'Kampung Tiong Bu''u', 'kec-mahulu-longapari'),
    ('desa-6411050007', 'Kampung Long Penaneh Satu', 'kec-mahulu-longapari'),
    ('desa-6411050008', 'Kampung Long Penaneh Tiga', 'kec-mahulu-longapari'),
    ('desa-6411050009', 'Kampung Long Keriok', 'kec-mahulu-longapari'),
    ('desa-6411050010', 'Kampung Long Apari', 'kec-mahulu-longapari')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do update set
  nama = excluded.nama,
  parent_id = excluded.parent_id;

