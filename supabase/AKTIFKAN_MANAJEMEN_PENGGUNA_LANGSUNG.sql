-- ============================================================================
-- SIPUT-KALTIM: AKTIFKAN PENDAFTARAN & PENGHAPUSAN AKUN LANGSUNG OLEH ADMIN
-- Serta Perbaikan Menyeluruh Autentikasi (Bebas "Database error querying schema")
-- Menjamin pendaftaran ke-24 Petugas berikutnya berjalan lancar dan siap login
-- Jalankan seluruh skrip ini di SQL Editor Supabase (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Pastikan Ekstensi pgcrypto Aktif untuk Enkripsi Kata Sandi Bcrypt
create extension if not exists pgcrypto with schema extensions;

-- 2. Pastikan Tipe Enum 'peran' dan 'tipe_wilayah' Ada
do $$
begin
  if not exists (select 1 from pg_type where typname = 'peran') then
    create type public.peran as enum ('admin', 'operator', 'petugas');
  end if;
  if not exists (select 1 from pg_type where typname = 'tipe_wilayah') then
    create type public.tipe_wilayah as enum ('kabupaten', 'kecamatan', 'desa');
  end if;
end $$;

-- 3. PERBAIKAN AKUN EKSIS: Perbarui Token NULL di auth.users Menjadi String Kosong
-- Ini langsung mengatasi galat "Database error querying schema" (GoTrue NULL scanner)
update auth.users
set 
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, ''),
  raw_app_meta_data = coalesce(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb)
where 
  confirmation_token is null 
  or recovery_token is null 
  or email_change_token_new is null 
  or email_change is null
  or email_change_token_current is null
  or phone_change is null
  or phone_change_token is null
  or reauthentication_token is null
  or raw_app_meta_data is null;

-- 4. Pastikan Setiap Pengguna Memiliki Catatan Identitas di auth.identities
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
  u.id::text,
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

-- 5. TRIGGER OTOMATIS: Mencegah Token Bernilai NULL di Masa Depan
-- Menjamin ke-24 Petugas berikutnya yang didaftarkan langsung aman & bisa login tanpa error
create or replace function public.bersihkan_token_auth_users()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  new.confirmation_token := coalesce(new.confirmation_token, '');
  new.recovery_token := coalesce(new.recovery_token, '');
  new.email_change_token_new := coalesce(new.email_change_token_new, '');
  new.email_change := coalesce(new.email_change, '');
  new.email_change_token_current := coalesce(new.email_change_token_current, '');
  new.phone_change := coalesce(new.phone_change, '');
  new.phone_change_token := coalesce(new.phone_change_token, '');
  new.reauthentication_token := coalesce(new.reauthentication_token, '');
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb);
  return new;
end;
$$;

drop trigger if exists trg_bersihkan_token_auth_users on auth.users;
create trigger trg_bersihkan_token_auth_users
before insert or update on auth.users
for each row
execute function public.bersihkan_token_auth_users();

-- 6. Fungsi Pembantu Keamanan & Hierarki (Wajib Ada untuk Kebijakan RLS)
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

-- Beri izin eksekusi fungsi ke peran authenticated
grant execute on function public.peran_saya() to authenticated;
grant execute on function public.kabupaten_saya() to authenticated;
grant execute on function public.kabupaten_dari_desa(uuid) to authenticated;

-- 7. Penyesuaian constraint tabel profiles:
-- Operator kini diperbolehkan wilayah_id null (Provinsi Kaltim / Lintas Wilayah)
-- maupun memilih Kabupaten/Kota tertentu.
alter table public.profiles drop constraint if exists chk_wilayah_peran;
alter table public.profiles add constraint chk_wilayah_peran check (
  (peran = 'admin' and wilayah_id is null)
  or (peran = 'operator')
  or (peran = 'petugas' and wilayah_id is not null)
);

-- 8. Kebijakan RLS pada tabel public.profiles
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

-- 9. Kebijakan RLS Laporan (bila tabel laporan sudah ada)
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
  -- 1. Validasi pemanggil adalah Admin
  if coalesce(public.peran_saya()::text, '') <> 'admin' then
    return jsonb_build_object(
      'ok', false,
      'pesan', 'Hanya Admin Provinsi yang berwenang menambah akun pengguna.'
    );
  end if;

  if coalesce(trim(p_email), '') = '' or coalesce(trim(p_kata_sandi), '') = '' then
    return jsonb_build_object(
      'ok', false,
      'pesan', 'Alamat email dan kata sandi wajib diisi.'
    );
  end if;

  if length(trim(p_kata_sandi)) < 6 then
    return jsonb_build_object(
      'ok', false,
      'pesan', 'Kata sandi minimal 6 karakter.'
    );
  end if;

  -- 2. Cek apakah akun sudah ada di auth.users
  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  begin
    v_encrypted_pw := extensions.crypt(trim(p_kata_sandi), extensions.gen_salt('bf'));
  exception when others then
    v_encrypted_pw := crypt(trim(p_kata_sandi), gen_salt('bf'));
  end;

  if v_user_id is not null then
    -- Perbarui sandi dan pastikan email terkonfirmasi & token bersih
    update auth.users
    set encrypted_password = v_encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = '',
        email_change_token_current = '',
        phone_change = '',
        phone_change_token = '',
        reauthentication_token = '',
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = jsonb_build_object('nama', trim(p_nama), 'nip', nullif(trim(p_nip), '')),
        updated_at = now()
    where id = v_user_id;
  else
    -- Buat akun baru di auth.users lengkap dengan seluruh atribut GoTrue
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
      email_change_token_current,
      phone_change,
      phone_change_token,
      reauthentication_token,
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

  -- Pastikan identitas terdaftar di auth.identities
  begin
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', lower(trim(p_email))),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    ) on conflict do nothing;
  exception when others then
    null;
  end;

  -- 3. Simpan atau perbarui profil di public.profiles
  insert into public.profiles (
    id,
    nama,
    nip,
    jabatan,
    peran,
    wilayah_id,
    wkpp,
    aktif
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

  return jsonb_build_object(
    'ok', true,
    'data', row_to_json(v_profil)
  );
exception when others then
  return jsonb_build_object(
    'ok', false,
    'pesan', SQLERRM
  );
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
  -- 1. Validasi pemanggil adalah Admin
  if coalesce(public.peran_saya()::text, '') <> 'admin' then
    return jsonb_build_object('ok', false, 'pesan', 'Hanya Admin Provinsi yang berwenang menghapus akun.');
  end if;

  if p_target_id = auth.uid() then
    return jsonb_build_object('ok', false, 'pesan', 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.');
  end if;

  -- 2. Cek apakah ada laporan terkait
  select count(*) into v_count from public.laporan where petugas_id = p_target_id;
  if v_count > 0 then
    return jsonb_build_object(
      'ok', false,
      'pesan', format('Akun ini telah mencatat %s laporan serangan OPT. Demi integritas audit riwayat dinas, akun tidak dapat dihapus permanen. Silakan gunakan tombol Nonaktifkan.', v_count)
    );
  end if;

  -- 3. Hapus dari profiles dan auth.users
  delete from public.profiles where id = p_target_id;
  delete from auth.users where id = p_target_id;

  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'pesan', SQLERRM);
end;
$$;

grant execute on function public.admin_hapus_pengguna(uuid) to authenticated;
