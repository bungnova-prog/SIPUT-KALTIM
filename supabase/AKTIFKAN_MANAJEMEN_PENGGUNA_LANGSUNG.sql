-- ============================================================================
-- SIPUT-KALTIM: AKTIFKAN PENDAFTARAN & PENGHAPUSAN AKUN LANGSUNG OLEH ADMIN
-- Jalankan seluruh skrip ini di SQL Editor Supabase (https://supabase.com/dashboard)
-- Fungsi ini memungkinkan Admin mendaftarkan & menghapus akun petugas langsung
-- tanpa batasan email, tanpa email konfirmasi, dan bebas error rate limit!
-- ============================================================================

-- 1. Pastikan ekstensi pgcrypto aktif untuk enkripsi password bcrypt
create extension if not exists pgcrypto with schema extensions;

-- 2. Kebijakan RLS Tambah & Hapus untuk Admin di tabel public.profiles
drop policy if exists profiles_tambah_admin on public.profiles;
create policy profiles_tambah_admin on public.profiles
  for insert to authenticated
  with check (public.peran_saya() = 'admin');

drop policy if exists profiles_hapus_admin on public.profiles;
create policy profiles_hapus_admin on public.profiles
  for delete to authenticated
  using (public.peran_saya() = 'admin');

-- 3. Fungsi Database: Admin Tambah Pengguna Langsung
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
  if public.peran_saya() <> 'admin' then
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

  -- 2. Cek apakah user sudah ada di auth.users
  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  v_encrypted_pw := extensions.crypt(trim(p_kata_sandi), extensions.gen_salt('bf'));

  if v_user_id is not null then
    -- Perbarui kata sandi dan pastikan email terkonfirmasi
    update auth.users
    set encrypted_password = v_encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('nama', trim(p_nama), 'nip', nullif(trim(p_nip), '')),
        updated_at = now()
    where id = v_user_id;
  else
    -- Buat akun baru di auth.users
    v_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
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
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', trim(p_nama), 'nip', nullif(trim(p_nip), '')),
      now(),
      now()
    );

    -- Daftarkan identity email agar kompatibel penuh dengan Supabase GoTrue
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
        gen_random_uuid()::text,
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
  end if;

  -- 3. Simpan / perbarui ke tabel public.profiles
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
    case when p_peran = 'admin' then null else p_wilayah_id end,
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

-- 4. Fungsi Database: Admin Hapus Pengguna
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
  if public.peran_saya() <> 'admin' then
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
