-- ============================================================================
-- Pengujian Isolasi Row Level Security (RLS) Lintas Peran & Wilayah
-- Sumber: SCHEMA.md §5 & §10.6 dan SECURITY.md §5.7
-- Seluruh pengujian dibungkus BEGIN ... ROLLBACK sehingga tidak mengotori data!
-- Cara jalankan: tempel di Supabase SQL Editor setelah migrasi 001–003 selesai.
-- ============================================================================

begin;

do $$
declare
  v_admin_id uuid := '00000000-0000-4000-8000-000000000001';
  v_op_kukar_id uuid := '00000000-0000-4000-8000-000000000002';
  v_ptg_kukar_id uuid := '00000000-0000-4000-8000-000000000003';
  v_ptg_berau_id uuid := '00000000-0000-4000-8000-000000000004';
  v_kab_kukar uuid;
  v_kab_berau uuid;
  v_desa_kukar uuid;
  v_desa_berau uuid;
  v_kom_sawit uuid;
  v_opt_gano uuid;
  v_lap_kukar uuid;
  v_lap_berau uuid;
  v_hitung integer;
begin
  select id into v_kab_kukar from public.wilayah where kode = 'kab-kukar';
  select id into v_kab_berau from public.wilayah where kode = 'kab-berau';
  select id into v_desa_kukar from public.wilayah where kode = 'desa-loaduri';
  select id into v_desa_berau from public.wilayah where kode = 'desa-seibebanir';
  select id into v_kom_sawit from public.komoditas where nama = 'Kelapa Sawit';
  select id into v_opt_gano from public.opt where nama_ilmiah = 'Ganoderma boninense';

  -- Siapkan akun auth sementara di dalam transaksi uji
  insert into auth.users (id, email, aud, role)
  values
    (v_admin_id, 'uji-admin@siput-kaltim.local', 'authenticated', 'authenticated'),
    (v_op_kukar_id, 'uji-op-kukar@siput-kaltim.local', 'authenticated', 'authenticated'),
    (v_ptg_kukar_id, 'uji-ptg-kukar@siput-kaltim.local', 'authenticated', 'authenticated'),
    (v_ptg_berau_id, 'uji-ptg-berau@siput-kaltim.local', 'authenticated', 'authenticated');

  insert into public.profiles (id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif)
  values
    (v_admin_id, 'Uji Admin', 'UJI-ADM-01', 'Admin Uji', 'admin', null, 'Provinsi', true),
    (v_op_kukar_id, 'Uji Operator Kukar', 'UJI-OP-01', 'Operator Uji', 'operator', v_kab_kukar, 'Kukar', true),
    (v_ptg_kukar_id, 'Uji Petugas Kukar', 'UJI-PTG-01', 'POPT Uji', 'petugas', v_kab_kukar, 'Loa Janan', true),
    (v_ptg_berau_id, 'Uji Petugas Berau', 'UJI-PTG-02', 'POPT Uji', 'petugas', v_kab_berau, 'Sambaliung', true);

  insert into public.laporan (
    kode, petugas_id, desa_id, nama_blok, lat, lng,
    komoditas_id, opt_id, fase_tanaman, tahun, triwulan, semester,
    luas_amatan, luas_ringan, luas_berat, luas_terkendali, status
  ) values (
    'UJI-KKR-001', v_ptg_kukar_id, v_desa_kukar, 'Blok Uji Kukar', -0.5841, 117.0582,
    v_kom_sawit, v_opt_gano, 'tm', 2026, 4, 2,
    20, 5, 6, 2, 'menunggu'
  ) returning id into v_lap_kukar;

  insert into public.laporan (
    kode, petugas_id, desa_id, nama_blok, lat, lng,
    komoditas_id, opt_id, fase_tanaman, tahun, triwulan, semester,
    luas_amatan, luas_ringan, luas_berat, luas_terkendali, status
  ) values (
    'UJI-BRU-001', v_ptg_berau_id, v_desa_berau, 'Blok Uji Berau', 2.1105, 117.5321,
    v_kom_sawit, v_opt_gano, 'tm', 2026, 4, 2,
    15, 2, 1, 1, 'menunggu'
  ) returning id into v_lap_berau;

  -- Aktifkan peran authenticated seperti permintaan klien Supabase
  perform set_config('role', 'authenticated', true);

  -- UJI 1: Operator Kukar HANYA melihat laporan Kukar (tidak boleh melihat laporan Berau)
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_op_kukar_id::text, 'role', 'authenticated')::text,
    true
  );

  select count(*) into v_hitung
  from public.laporan
  where id in (v_lap_kukar, v_lap_berau);

  if v_hitung <> 1 then
    raise exception 'GAGAL UJI RLS 1: Operator Kukar melihat % baris (seharusnya 1).', v_hitung;
  end if;

  -- UJI 2: Petugas Kukar TIDAK BOLEH melihat laporan Berau
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_ptg_kukar_id::text, 'role', 'authenticated')::text,
    true
  );

  select count(*) into v_hitung
  from public.laporan
  where id = v_lap_berau;

  if v_hitung <> 0 then
    raise exception 'GAGAL UJI RLS 2: Petugas Kukar dapat membaca laporan lintas kabupaten (Berau).';
  end if;

  -- UJI 3: Admin Provinsi melihat SELURUH laporan (Kukar + Berau = 2)
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text,
    true
  );

  select count(*) into v_hitung
  from public.laporan
  where id in (v_lap_kukar, v_lap_berau);

  if v_hitung <> 2 then
    raise exception 'GAGAL UJI RLS 3: Admin Provinsi melihat % baris (seharusnya 2).', v_hitung;
  end if;

  raise notice 'SELURUH UJI ISOLASI RLS BERHASIL (Admin=2, Operator Kukar=1, Lintas Wilayah=0).';
end $$;

rollback;
