-- ============================================================================
-- SIPUT-KALTIM: Tambahkan Kebijakan Tambah & Hapus Profil untuk Admin Provinsi
-- Jalankan skrip ini di SQL Editor Supabase jika Admin ingin menghapus akun
-- ============================================================================

-- 1. Beri izin INSERT ke Admin
drop policy if exists profiles_tambah_admin on public.profiles;
create policy profiles_tambah_admin on public.profiles
  for insert to authenticated
  with check (public.peran_saya() = 'admin');

-- 2. Beri izin DELETE ke Admin
drop policy if exists profiles_hapus_admin on public.profiles;
create policy profiles_hapus_admin on public.profiles
  for delete to authenticated
  using (public.peran_saya() = 'admin');
