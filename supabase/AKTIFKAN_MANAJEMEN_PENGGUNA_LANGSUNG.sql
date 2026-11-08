-- ============================================================================
-- SIPUT-KALTIM: AKTIFKAN PENDAFTARAN & PENGHAPUSAN AKUN LANGSUNG OLEH ADMIN
-- Serta Mendukung Operator Tingkat Provinsi / Lintas Wilayah Kaltim
-- Jalankan seluruh skrip ini di SQL Editor Supabase (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Pastikan ekstensi pgcrypto aktif untuk enkripsi password bcrypt
create extension if not exists pgcrypto with schema extensions;

-- 2. Penyesuaian constraint tabel profiles:
-- Operator kini diperbolehkan wilayah_id null (Provinsi Kaltim / Lintas Wilayah)
-- maupun memilih Kabupaten/Kota tertentu.
alter table public.profiles drop constraint if exists chk_wilayah_peran;
alter table public.profiles add constraint chk_wilayah_peran check (
  (peran = 'admin' and wilayah_id is null)
  or (peran = 'operator')
  or (peran = 'petugas' and wilayah_id is not null)
);

-- 3. Kebijakan RLS Tambah & Hapus untuk Admin di tabel public.profiles
drop policy if exists profiles_tambah_admin on public.profiles;
create policy profiles_tambah_admin on public.profiles
  for insert to authenticated
  with check (public.peran_saya() = 'admin');

drop policy if exists profiles_hapus_admin on public.profiles;
create policy profiles_hapus_admin on public.profiles
  for delete to authenticated
  using (public.peran_saya() = 'admin');

-- 4. Kebijakan RLS Profiles: Operator Lintas Wilayah dapat melihat seluruh profil
drop policy if exists profiles_baca on public.profiles;
create policy profiles_baca on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.peran_saya() = 'admin'
    or (
      public.peran_saya() = 'operator'
      and (
        public.kabupaten_saya() is null
        or wilayah_id = public.kabupaten_saya()
      )
      and peran <> 'admin'
    )
    or (
      public.peran_saya() = 'petugas'
      and wilayah_id = public.kabupaten_saya()
      and peran <> 'admin'
    )
  );

-- 5. Kebijakan RLS Laporan: Operator Lintas Wilayah dapat membaca & memverifikasi laporan se-Kaltim
drop policy if exists laporan_baca on public.laporan;
create policy laporan_baca on public.laporan
  for select to authenticated
  using (
    public.peran_saya() = 'admin'
    or (
      public.peran_saya() = 'operator'
      and (
        public.kabupaten_saya() is null
        or public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
      )
      and (status <> 'draf' or petugas_id = auth.uid())
    )
    or (
      public.peran_saya() = 'petugas'
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
      public.peran_saya() = 'operator'
      and (
        public.kabupaten_saya() is null
        or public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
      )
      and status in ('menunggu', 'terverifikasi', 'ditolak')
    )
    or public.peran_saya() = 'admin'
  )
  with check (
    (
      public.peran_saya() = 'operator'
      and (
        public.kabupaten_saya() is null
        or public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
      )
      and status in ('menunggu', 'terverifikasi', 'ditolak')
    )
    or public.peran_saya() = 'admin'
  );

-- 6. Fungsi Database: Admin Tambah Pengguna Langsung
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

  -- 2. Cek apakah akun sudah ada di auth.users
  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  v_encrypted_pw := extensions.crypt(trim(p_kata_sandi), extensions.gen_salt('bf'));

  if v_user_id is not null then
    -- Perbarui sandi dan pastikan email terkonfirmasi
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

  -- 3. Simpan atau perbarui profil di public.profiles
  -- Untuk admin atau operator lintas wilayah, wilayah_id bernilai null
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

-- 7. Fungsi Database: Admin Hapus Pengguna
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
