-- ============================================================================
-- SIPUT-KALTIM: AKTIFKAN PENDAFTARAN & PENGHAPUSAN AKUN LANGSUNG OLEH ADMIN
-- Versi Tangguh & Dinamis (Aman untuk Semua Versi Skema Supabase)
-- ============================================================================

-- 1. Pastikan Ekstensi pgcrypto Aktif
create extension if not exists pgcrypto;

-- Pastikan search_path mencakup extensions, public, dan auth
set search_path = public, auth, extensions;

-- 2. Pastikan Tipe Enum 'peran' dan 'tipe_wilayah' Tersedia
do $$
begin
  if not exists (select 1 from pg_type where typname = 'peran') then
    create type public.peran as enum ('admin', 'operator', 'petugas');
  end if;
  if not exists (select 1 from pg_type where typname = 'tipe_wilayah') then
    create type public.tipe_wilayah as enum ('kabupaten', 'kecamatan', 'desa');
  end if;
end $$;

-- 3. PERBAIKAN AKUN EKSIS (Dinamis: Hanya kolom yang ada yang diperbarui)
-- Mengatasi galat "Database error querying schema" dengan aman
do $$
declare
  col_record record;
begin
  for col_record in (
    select column_name 
    from information_schema.columns 
    where table_schema = 'auth' 
      and table_name = 'users' 
      and is_nullable = 'YES'
      and column_name in (
        'confirmation_token', 
        'recovery_token', 
        'email_change', 
        'email_change_token_new', 
        'email_change_token_current',
        'phone_change',
        'phone_change_token',
        'reauthentication_token'
      )
  ) loop
    execute format('update auth.users set %I = '''' where %I is null', col_record.column_name, col_record.column_name);
  end loop;

  update auth.users 
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb)
  where raw_app_meta_data is null;
end $$;

-- 4. Setel / Sinkronkan Sandi Akun Petugas yang Ada ke 'Perlindungan.1!'
-- Ini memastikan akun adisanjaya2309@gmail.com langsung aktif dengan sandi yang benar
update auth.users
set encrypted_password = crypt('Perlindungan.1!', gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) in ('adisanjaya2309@gmail.com');

-- 5. Pastikan Seluruh Pengguna Memiliki Baris di auth.identities
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select 
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', lower(u.email)),
  'email',
  now(),
  now(),
  now()
from auth.users u
where not exists (
  select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
);

-- 6. Fungsi Pembantu Keamanan & Hierarki
create or replace function public.peran_saya()
returns public.peran
language sql
stable
security definer
set search_path = public
as $$
  select peran from public.profiles where id = auth.uid() and aktif = true
$$;

create or replace function public.kabupaten_saya()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select wilayah_id from public.profiles where id = auth.uid() and aktif = true
$$;

create or replace function public.kabupaten_dari_desa(p_desa uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select kab.id
  from public.wilayah d
  join public.wilayah kec on kec.id = d.parent_id
  join public.wilayah kab on kab.id = kec.parent_id
  where d.id = p_desa
    and d.tipe = 'desa'
$$;

grant execute on function public.peran_saya() to authenticated;
grant execute on function public.kabupaten_saya() to authenticated;
grant execute on function public.kabupaten_dari_desa(uuid) to authenticated;

-- 7. Penyesuaian Constraint Tabel Profiles (Mendukung Operator Provinsi / Lintas Wilayah)
alter table public.profiles drop constraint if exists chk_wilayah_peran;
alter table public.profiles add constraint chk_wilayah_peran check (
  (peran = 'admin' and wilayah_id is null)
  or (peran = 'operator')
  or (peran = 'petugas' and wilayah_id is not null)
);

-- 8. Kebijakan RLS Profiles
alter table public.profiles enable row level security;

drop policy if exists profiles_tambah_admin on public.profiles;
create policy profiles_tambah_admin on public.profiles
  for insert to authenticated
  with check (coalesce(public.peran_saya()::text, '') = 'admin');

drop policy if exists profiles_hapus_admin on public.profiles;
create policy profiles_hapus_admin on public.profiles
  for delete to authenticated
  using (coalesce(public.peran_saya()::text, '') = 'admin');

drop policy if exists profiles_baca on public.profiles;
create policy profiles_baca on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or coalesce(public.peran_saya()::text, '') = 'admin'
    or (
      coalesce(public.peran_saya()::text, '') = 'operator'
      and (
        public.kabupaten_saya() is null
        or wilayah_id = public.kabupaten_saya()
      )
      and peran <> 'admin'
    )
    or (
      coalesce(public.peran_saya()::text, '') = 'petugas'
      and wilayah_id = public.kabupaten_saya()
      and peran <> 'admin'
    )
  );

-- 9. Kebijakan RLS Laporan (bila tabel laporan ada)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'laporan') then
    alter table public.laporan enable row level security;

    drop policy if exists laporan_baca on public.laporan;
    create policy laporan_baca on public.laporan
      for select to authenticated
      using (
        coalesce(public.peran_saya()::text, '') = 'admin'
        or (
          coalesce(public.peran_saya()::text, '') = 'operator'
          and (
            public.kabupaten_saya() is null
            or public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
          )
          and (status <> 'draf' or petugas_id = auth.uid())
        )
        or (
          coalesce(public.peran_saya()::text, '') = 'petugas'
          and (
            petugas_id = auth.uid()
            or (
              public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
              and status <> 'draf'
            )
          )
        )
      );

    drop policy if exists laporan_verifikasi_operator on public.laporan;
    create policy laporan_verifikasi_operator on public.laporan
      for update to authenticated
      using (
        (
          coalesce(public.peran_saya()::text, '') = 'operator'
          and (
            public.kabupaten_saya() is null
            or public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
          )
          and status in ('menunggu', 'terverifikasi', 'ditolak')
        )
        or coalesce(public.peran_saya()::text, '') = 'admin'
      )
      with check (
        (
          coalesce(public.peran_saya()::text, '') = 'operator'
          and (
            public.kabupaten_saya() is null
            or public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
          )
          and status in ('menunggu', 'terverifikasi', 'ditolak')
        )
        or coalesce(public.peran_saya()::text, '') = 'admin'
      );
  end if;
end $$;

-- 10. Fungsi Database: Admin Tambah Pengguna Langsung (RPC)
create or replace function public.admin_tambah_pengguna(
  p_email text,
  p_kata_sandi text,
  p_nama text,
  p_nip text default null,
  p_jabatan text default '',
  p_peran text default 'petugas',
  p_wilayah_id uuid default null,
  p_wkpp text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_encrypted_pw text;
  v_profil public.profiles%rowtype;
begin
  if coalesce(public.peran_saya()::text, '') <> 'admin' then
    return jsonb_build_object(
      'ok', false,
      'pesan', 'Hanya Admin Provinsi yang berwenang menambah akun pengguna.'
    );
  end if;

  if coalesce(trim(p_email), '') = '' or coalesce(trim(p_kata_sandi), '') = '' then
    return jsonb_build_object('ok', false, 'pesan', 'Alamat email dan kata sandi wajib diisi.');
  end if;

  if length(trim(p_kata_sandi)) < 6 then
    return jsonb_build_object('ok', false, 'pesan', 'Kata sandi minimal 6 karakter.');
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));

  begin
    v_encrypted_pw := extensions.crypt(trim(p_kata_sandi), extensions.gen_salt('bf'));
  exception when others then
    v_encrypted_pw := crypt(trim(p_kata_sandi), gen_salt('bf'));
  end;

  if v_user_id is not null then
    update auth.users
    set encrypted_password = v_encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = jsonb_build_object('nama', trim(p_nama), 'nip', nullif(trim(p_nip), '')),
        updated_at = now()
    where id = v_user_id;
  else
    v_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(trim(p_email)),
      v_encrypted_pw,
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', trim(p_nama), 'nip', nullif(trim(p_nip), '')),
      now(),
      now()
    );
  end if;

  -- Pembersihan token dinamis pada pengguna ini
  begin
    update auth.users
    set confirmation_token = '',
        recovery_token = '',
        email_change = '',
        email_change_token_new = ''
    where id = v_user_id;
  exception when others then null;
  end;

  begin
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', lower(trim(p_email))),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    ) on conflict do nothing;
  exception when others then null;
  end;

  insert into public.profiles (
    id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif
  ) values (
    v_user_id,
    trim(p_nama),
    nullif(trim(p_nip), ''),
    coalesce(nullif(trim(p_jabatan), ''), case when p_peran = 'petugas' then 'Petugas Lapangan' else 'Operator UPTD' end),
    p_peran::public.peran,
    case when p_peran = 'admin' or p_wilayah_id is null then null else p_wilayah_id end,
    coalesce(nullif(trim(p_wkpp), ''), 'Wilayah Kerja'),
    true
  )
  on conflict (id) do update set
    nama = excluded.nama,
    nip = excluded.nip,
    jabatan = excluded.jabatan,
    peran = excluded.peran,
    wilayah_id = excluded.wilayah_id,
    wkpp = excluded.wkpp,
    aktif = true
  returning * into v_profil;

  return jsonb_build_object('ok', true, 'data', row_to_json(v_profil));
exception when others then
  return jsonb_build_object('ok', false, 'pesan', SQLERRM);
end;
$$;

grant execute on function public.admin_tambah_pengguna(text, text, text, text, text, text, uuid, text) to authenticated;

-- 11. Fungsi Database: Admin Hapus Pengguna (RPC)
create or replace function public.admin_hapus_pengguna(
  p_target_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_count integer;
begin
  if coalesce(public.peran_saya()::text, '') <> 'admin' then
    return jsonb_build_object('ok', false, 'pesan', 'Hanya Admin Provinsi yang berwenang menghapus akun.');
  end if;

  if p_target_id = auth.uid() then
    return jsonb_build_object('ok', false, 'pesan', 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.');
  end if;

  select count(*) into v_count from public.laporan where petugas_id = p_target_id;
  if v_count > 0 then
    return jsonb_build_object(
      'ok', false,
      'pesan', format('Akun ini telah mencatat %s laporan serangan OPT. Demi integritas audit riwayat dinas, akun tidak dapat dihapus permanen. Silakan gunakan tombol Nonaktifkan.', v_count)
    );
  end if;

  delete from public.profiles where id = p_target_id;
  delete from auth.users where id = p_target_id;

  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'pesan', SQLERRM);
end;
$$;

grant execute on function public.admin_hapus_pengguna(uuid) to authenticated;
