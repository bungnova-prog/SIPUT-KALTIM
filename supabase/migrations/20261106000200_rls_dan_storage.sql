-- ============================================================================
-- Migrasi 002: Kebijakan Row Level Security (RLS), Realtime & Bucket Storage
-- Sumber: SCHEMA.md §5 dan SECURITY.md §5
-- Prinsip: Tanpa kebijakan = akses ditolak. Semua otorisasi ditegakkan di server.
-- ============================================================================

-- 1. Aktifkan RLS pada seluruh tabel domain
alter table public.uptd enable row level security;
alter table public.wilayah enable row level security;
alter table public.profiles enable row level security;
alter table public.komoditas enable row level security;
alter table public.opt enable row level security;
alter table public.konfigurasi enable row level security;
alter table public.laporan enable row level security;
alter table public.laporan_foto enable row level security;
alter table public.laporan_riwayat enable row level security;
alter table public.log_ekspor enable row level security;
alter table public.notifikasi enable row level security;

-- 2. Kebijakan Tabel Referensi (wilayah, uptd, komoditas, opt, konfigurasi)
drop policy if exists uptd_baca on public.uptd;
create policy uptd_baca on public.uptd
  for select to authenticated using (true);

drop policy if exists uptd_kelola_admin on public.uptd;
create policy uptd_kelola_admin on public.uptd
  for all to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

drop policy if exists wilayah_baca on public.wilayah;
create policy wilayah_baca on public.wilayah
  for select to authenticated using (true);

drop policy if exists wilayah_kelola_admin on public.wilayah;
create policy wilayah_kelola_admin on public.wilayah
  for all to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

drop policy if exists komoditas_baca on public.komoditas;
create policy komoditas_baca on public.komoditas
  for select to authenticated using (true);

drop policy if exists komoditas_kelola_admin on public.komoditas;
create policy komoditas_kelola_admin on public.komoditas
  for all to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

drop policy if exists opt_baca on public.opt;
create policy opt_baca on public.opt
  for select to authenticated using (true);

drop policy if exists opt_kelola_admin on public.opt;
create policy opt_kelola_admin on public.opt
  for all to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

drop policy if exists konfigurasi_baca on public.konfigurasi;
create policy konfigurasi_baca on public.konfigurasi
  for select to authenticated using (true);

drop policy if exists konfigurasi_kelola_admin on public.konfigurasi;
create policy konfigurasi_kelola_admin on public.konfigurasi
  for all to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

-- 3. Kebijakan Tabel profiles (SCHEMA.md §5)
-- Catatan: INSERT dilakukan melalui Edge Function berhak service_role di sisi server.
drop policy if exists profiles_baca on public.profiles;
create policy profiles_baca on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.peran_saya() = 'admin'
    or (
      public.peran_saya() = 'operator'
      and wilayah_id = public.kabupaten_saya()
      and peran <> 'admin'
    )
    or (
      public.peran_saya() = 'petugas'
      and wilayah_id = public.kabupaten_saya()
      and peran <> 'admin'
    )
  );

drop policy if exists profiles_ubah_admin on public.profiles;
create policy profiles_ubah_admin on public.profiles
  for update to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

-- 4. Kebijakan Tabel laporan (SCHEMA.md §5)
drop policy if exists laporan_baca on public.laporan;
create policy laporan_baca on public.laporan
  for select to authenticated
  using (
    public.peran_saya() = 'admin'
    or (
      public.peran_saya() = 'operator'
      and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
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

drop policy if exists laporan_tambah_petugas on public.laporan;
create policy laporan_tambah_petugas on public.laporan
  for insert to authenticated
  with check (
    (
      public.peran_saya() = 'petugas'
      and petugas_id = auth.uid()
      and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
      and status in ('draf', 'menunggu')
    )
    or (
      public.peran_saya() = 'operator'
      and petugas_id = auth.uid()
      and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
      and status in ('draf', 'menunggu')
    )
    or (
      public.peran_saya() = 'admin'
      and petugas_id = auth.uid()
    )
  );

drop policy if exists laporan_ubah_petugas on public.laporan;
create policy laporan_ubah_petugas on public.laporan
  for update to authenticated
  using (
    public.peran_saya() = 'petugas'
    and petugas_id = auth.uid()
    and status <> 'terverifikasi'
  )
  with check (
    petugas_id = auth.uid()
    and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
    and status in ('draf', 'menunggu')
  );

drop policy if exists laporan_kelola_operator on public.laporan;
create policy laporan_kelola_operator on public.laporan
  for update to authenticated
  using (
    public.peran_saya() = 'operator'
    and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
  )
  with check (
    public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya()
  );

drop policy if exists laporan_kelola_admin on public.laporan;
create policy laporan_kelola_admin on public.laporan
  for all to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

-- 5. Kebijakan Tabel laporan_foto & laporan_riwayat
drop policy if exists laporan_foto_baca on public.laporan_foto;
create policy laporan_foto_baca on public.laporan_foto
  for select to authenticated
  using (
    exists (
      select 1 from public.laporan l where l.id = laporan_id
    )
  );

drop policy if exists laporan_foto_tambah on public.laporan_foto;
create policy laporan_foto_tambah on public.laporan_foto
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.laporan l
      where l.id = laporan_id
        and (
          public.peran_saya() = 'admin'
          or (l.petugas_id = auth.uid() and l.status <> 'terverifikasi')
        )
    )
  );

drop policy if exists laporan_foto_ubah_hapus on public.laporan_foto;
create policy laporan_foto_ubah_hapus on public.laporan_foto
  for delete to authenticated
  using (
    exists (
      select 1
      from public.laporan l
      where l.id = laporan_id
        and (
          public.peran_saya() = 'admin'
          or (l.petugas_id = auth.uid() and l.status <> 'terverifikasi')
        )
    )
  );

drop policy if exists laporan_riwayat_baca on public.laporan_riwayat;
create policy laporan_riwayat_baca on public.laporan_riwayat
  for select to authenticated
  using (
    exists (
      select 1 from public.laporan l where l.id = laporan_id
    )
  );

-- 6. Kebijakan Tabel log_ekspor (Append-Only — SCHEMA.md §3.8 & §5)
drop policy if exists log_ekspor_baca on public.log_ekspor;
create policy log_ekspor_baca on public.log_ekspor
  for select to authenticated
  using (
    public.peran_saya() = 'admin'
    or user_id = auth.uid()
  );

drop policy if exists log_ekspor_tambah on public.log_ekspor;
create policy log_ekspor_tambah on public.log_ekspor
  for insert to authenticated
  with check (user_id = auth.uid());

-- 7. Kebijakan Tabel notifikasi (SCHEMA.md §5)
drop policy if exists notifikasi_baca on public.notifikasi;
create policy notifikasi_baca on public.notifikasi
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifikasi_tandai_dibaca on public.notifikasi;
create policy notifikasi_tandai_dibaca on public.notifikasi
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notifikasi_hapus_milik on public.notifikasi;
create policy notifikasi_hapus_milik on public.notifikasi
  for delete to authenticated
  using (user_id = auth.uid());

-- 8. Bucket Privat Supabase Storage untuk Foto Geotagging (SECURITY.md §5.6 & SCHEMA.md §5)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'laporan-foto',
  'laporan-foto',
  false,
  8388608,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png'];

drop policy if exists storage_laporan_foto_baca on storage.objects;
create policy storage_laporan_foto_baca on storage.objects
  for select to authenticated
  using (
    bucket_id = 'laporan-foto'
    and exists (
      select 1
      from public.laporan l
      where l.id::text = split_part(name, '/', 2)
    )
  );

drop policy if exists storage_laporan_foto_unggah on storage.objects;
create policy storage_laporan_foto_unggah on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'laporan-foto'
    and split_part(name, '/', 1) = 'laporan'
    and exists (
      select 1
      from public.laporan l
      where l.id::text = split_part(name, '/', 2)
        and (
          public.peran_saya() = 'admin'
          or (l.petugas_id = auth.uid() and l.status <> 'terverifikasi')
        )
    )
  );

drop policy if exists storage_laporan_foto_hapus on storage.objects;
create policy storage_laporan_foto_hapus on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'laporan-foto'
    and split_part(name, '/', 1) = 'laporan'
    and exists (
      select 1
      from public.laporan l
      where l.id::text = split_part(name, '/', 2)
        and (
          public.peran_saya() = 'admin'
          or (l.petugas_id = auth.uid() and l.status <> 'terverifikasi')
        )
    )
  );

-- 9. Publikasi Supabase Realtime untuk pembaruan lintas layar tanpa muat ulang
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.laporan;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.notifikasi;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.log_ekspor;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.opt;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.profiles;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
