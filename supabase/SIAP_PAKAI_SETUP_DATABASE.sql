-- ============================================================================
-- Migrasi 001: Skema Inti SIPUT-KALTIM (Fase 2)
-- Sumber: SCHEMA.md Â§2â€“Â§4, Â§6 dan SECURITY.md Â§5, Â§7
-- Catatan: Jalankan secara sadar oleh pemilik proyek pada Supabase SQL Editor / CLI.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Tipe Enumerasi (SCHEMA.md Â§2)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'peran') then
    create type public.peran as enum ('admin', 'operator', 'petugas');
  end if;
  if not exists (select 1 from pg_type where typname = 'tipe_wilayah') then
    create type public.tipe_wilayah as enum ('kabupaten', 'kecamatan', 'desa');
  end if;
  if not exists (select 1 from pg_type where typname = 'jenis_opt') then
    create type public.jenis_opt as enum ('hama', 'penyakit');
  end if;
  if not exists (select 1 from pg_type where typname = 'tingkat_serangan') then
    create type public.tingkat_serangan as enum ('ringan', 'sedang', 'berat');
  end if;
  if not exists (select 1 from pg_type where typname = 'status_laporan') then
    create type public.status_laporan as enum ('draf', 'menunggu', 'terverifikasi', 'ditolak');
  end if;
  if not exists (select 1 from pg_type where typname = 'fase_tanaman') then
    create type public.fase_tanaman as enum ('tbm', 'tm', 'ttm_tr');
  end if;
  if not exists (select 1 from pg_type where typname = 'tipe_notifikasi') then
    create type public.tipe_notifikasi as enum (
      'laporan_baru',
      'peringatan_eksplosif',
      'menunggu_validasi',
      'info'
    );
  end if;
end $$;

-- 2. Tabel UPTD & Wilayah Administratif (SCHEMA.md Â§3.2 & Â§3.3)
create table if not exists public.uptd (
  id uuid primary key default gen_random_uuid(),
  kode text unique not null,
  nama text not null,
  kabupaten_id uuid,
  jumlah_pengamat_aktif integer not null default 0 check (jumlah_pengamat_aktif >= 0),
  dibuat_pada timestamptz not null default now()
);

create table if not exists public.wilayah (
  id uuid primary key default gen_random_uuid(),
  kode text unique not null,
  tipe public.tipe_wilayah not null,
  nama text not null,
  parent_id uuid references public.wilayah(id) on delete restrict,
  uptd_id uuid references public.uptd(id) on delete set null,
  lat_pusat double precision,
  lng_pusat double precision,
  constraint chk_parent_kabupaten check (
    (tipe = 'kabupaten' and parent_id is null)
    or (tipe in ('kecamatan', 'desa') and parent_id is not null)
  )
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_uptd_kabupaten'
  ) then
    alter table public.uptd
      add constraint fk_uptd_kabupaten
      foreign key (kabupaten_id) references public.wilayah(id) on delete set null;
  end if;
end $$;

-- 3. Tabel Profil Pengguna Terautentikasi (SCHEMA.md Â§3.1)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null check (char_length(btrim(nama)) >= 2),
  nip text unique,
  jabatan text not null default '',
  peran public.peran not null,
  wilayah_id uuid references public.wilayah(id) on delete restrict,
  wkpp text not null default '',
  aktif boolean not null default true,
  dibuat_pada timestamptz not null default now(),
  constraint chk_wilayah_peran check (
    (peran = 'admin' and wilayah_id is null)
    or (peran = 'operator')
    or (peran = 'petugas' and wilayah_id is not null)
  )
);

-- 4. Tabel Komoditas & Katalog OPT (SCHEMA.md Â§3.4 & Â§3.5)
create table if not exists public.komoditas (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  kode_ikon text not null default 'sawit' check (
    kode_ikon in ('lada', 'sawit', 'kakao', 'karet', 'aren', 'kelapa_dalam', 'kopi')
  ),
  aktif boolean not null default true
);

create table if not exists public.opt (
  id uuid primary key default gen_random_uuid(),
  komoditas_id uuid not null references public.komoditas(id) on delete restrict,
  nama_lokal text not null check (char_length(btrim(nama_lokal)) >= 2),
  nama_ilmiah text not null check (char_length(btrim(nama_ilmiah)) >= 3),
  jenis public.jenis_opt not null,
  gejala text not null default '',
  rekomendasi text not null default '',
  dibuat_pada timestamptz not null default now()
);

-- 5. Tabel Konfigurasi Terpusat (SCHEMA.md Â§3.11)
create table if not exists public.konfigurasi (
  kunci text primary key check (
    kunci in (
      'ambang_sedang_min',
      'ambang_berat_min',
      'ambang_peringatan',
      'ambang_eksplosif'
    )
  ),
  nilai numeric(5,2) not null check (nilai >= 0 and nilai <= 100),
  diperbarui_pada timestamptz not null default now(),
  diperbarui_oleh uuid references public.profiles(id) on delete set null
);

-- 6. Sekuens & Tabel Laporan Observasi OPT (SCHEMA.md Â§3.6)
create sequence if not exists public.seq_kode_laporan start 100;

create table if not exists public.laporan (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,
  petugas_id uuid not null references public.profiles(id) on delete restrict,
  desa_id uuid not null references public.wilayah(id) on delete restrict,
  nama_blok text not null check (char_length(btrim(nama_blok)) >= 2),
  lat double precision not null check (lat between -2.6 and 2.5),
  lng double precision not null check (lng between 113.8 and 119.1),
  komoditas_id uuid not null references public.komoditas(id) on delete restrict,
  opt_id uuid not null references public.opt(id) on delete restrict,
  fase_tanaman public.fase_tanaman not null,
  tahun smallint not null check (tahun between 2020 and 2100),
  triwulan smallint not null check (triwulan between 1 and 4),
  semester smallint not null check (
    (triwulan in (1, 2) and semester = 1)
    or (triwulan in (3, 4) and semester = 2)
  ),
  luas_amatan numeric(12,2) not null check (luas_amatan > 0),
  luas_ringan numeric(12,2) not null default 0 check (luas_ringan >= 0),
  luas_berat numeric(12,2) not null default 0 check (luas_berat >= 0),
  luas_terkendali numeric(12,2) not null default 0 check (luas_terkendali >= 0),
  intensitas_persen numeric(5,2) not null default 0,
  tingkat public.tingkat_serangan not null default 'ringan',
  status public.status_laporan not null default 'draf',
  rekomendasi_kultur text not null default '',
  rekomendasi_hayati text not null default '',
  rekomendasi_kimiawi text not null default '',
  catatan_verifikasi text,
  dibuat_pada timestamptz not null default now(),
  diverifikasi_oleh uuid references public.profiles(id) on delete set null,
  diverifikasi_pada timestamptz,
  constraint chk_jumlah_luas_laporan check (
    luas_ringan + luas_berat + luas_terkendali <= luas_amatan
  )
);

-- 7. Tabel Foto Geotagging, Riwayat Laporan, Log Ekspor & Notifikasi (SCHEMA.md Â§3.7â€“Â§3.10)
create table if not exists public.laporan_foto (
  id uuid primary key default gen_random_uuid(),
  laporan_id uuid not null references public.laporan(id) on delete cascade,
  nama_berkas text not null default '',
  path_storage text not null,
  geotag_lat double precision not null check (geotag_lat between -2.6 and 2.5),
  geotag_lng double precision not null check (geotag_lng between 113.8 and 119.1),
  urutan smallint not null check (urutan between 1 and 3),
  dibuat_pada timestamptz not null default now(),
  unique (laporan_id, urutan)
);

create table if not exists public.laporan_riwayat (
  id uuid primary key default gen_random_uuid(),
  laporan_id uuid not null references public.laporan(id) on delete cascade,
  diubah_oleh uuid not null references public.profiles(id) on delete restrict,
  diubah_pada timestamptz not null default now(),
  catatan text not null check (char_length(btrim(catatan)) >= 5),
  sebelum jsonb,
  sesudah jsonb
);

create table if not exists public.log_ekspor (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  nama_berkas text not null,
  format text not null check (format in ('xlsx', 'pdf')),
  tipe_dokumen text not null default 'observasi' check (
    tipe_dokumen in ('rekap', 'geodata', 'berita_acara', 'observasi')
  ),
  filter_ringkas text not null default '',
  filter_json jsonb not null default '{}'::jsonb,
  dibuat_pada timestamptz not null default now()
);

create table if not exists public.notifikasi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  judul text not null,
  isi text not null,
  tipe public.tipe_notifikasi not null default 'info',
  laporan_id uuid references public.laporan(id) on delete set null,
  dibaca boolean not null default false,
  dibuat_pada timestamptz not null default now()
);

-- 8. Fungsi Bantu Hierarki & Keamanan (SECURITY.md Â§5.4: wajib set search_path = public)
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

-- 9. Trigger Validasi Relasi, Pembuatan Kode Otomatis & Kalkulasi Intensitas (SCHEMA.md Â§4 & Â§6)
create or replace function public.validasi_dan_hitung_laporan()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sedang numeric := 25;
  v_berat numeric := 50;
  v_kode_kab text;
begin
  -- Pastikan desa_id benar-benar bertipe desa
  if not exists (
    select 1 from public.wilayah where id = new.desa_id and tipe = 'desa'
  ) then
    raise exception 'Lokasi pengamatan harus mengacu pada wilayah bertipe desa/kelurahan.';
  end if;

  -- Pastikan OPT sesuai dengan komoditas yang dipilih
  if not exists (
    select 1
    from public.opt
    where id = new.opt_id
      and komoditas_id = new.komoditas_id
  ) then
    raise exception 'Jenis OPT tidak sesuai dengan komoditas yang dipilih.';
  end if;

  -- Buat kode laporan otomatis bila belum diisi
  if new.kode is null or btrim(new.kode) = '' then
    select upper(coalesce(replace(kab.kode, 'kab-', ''), 'KTM'))
      into v_kode_kab
    from public.wilayah d
    join public.wilayah kec on kec.id = d.parent_id
    join public.wilayah kab on kab.id = kec.parent_id
    where d.id = new.desa_id;

    v_kode_kab := regexp_replace(coalesce(v_kode_kab, 'KTM'), '[^A-Z0-9]', '', 'g');
    new.kode := substring(v_kode_kab from 1 for 4)
      || '-' || new.tahun::text
      || '-' || lpad(nextval('public.seq_kode_laporan')::text, 4, '0');
  end if;

  -- Hitung intensitas (%) dan tingkat serangan berdasarkan konfigurasi terpusat
  select coalesce(max(nilai), 25)
    into v_sedang
  from public.konfigurasi
  where kunci = 'ambang_sedang_min';

  select coalesce(max(nilai), 50)
    into v_berat
  from public.konfigurasi
  where kunci = 'ambang_berat_min';

  new.intensitas_persen := round(
    ((new.luas_ringan + new.luas_berat) / new.luas_amatan) * 100,
    2
  );

  new.tingkat := case
    when new.intensitas_persen > v_berat then 'berat'::public.tingkat_serangan
    when new.intensitas_persen >= v_sedang then 'sedang'::public.tingkat_serangan
    else 'ringan'::public.tingkat_serangan
  end;

  return new;
end;
$$;

drop trigger if exists trg_validasi_dan_hitung_laporan on public.laporan;
create trigger trg_validasi_dan_hitung_laporan
before insert or update on public.laporan
for each row execute function public.validasi_dan_hitung_laporan();

-- 10. Trigger Penjaga Status Verifikasi & Jejak Audit Riwayat (SCHEMA.md Â§4 & Â§6)
create or replace function public.jaga_status_laporan()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_peran public.peran;
begin
  v_peran := public.peran_saya();

  if v_peran = 'petugas' then
    if new.status in ('terverifikasi', 'ditolak') then
      raise exception 'Petugas tidak memiliki wewenang menetapkan status verifikasi.';
    end if;
    if tg_op = 'UPDATE' and old.status = 'terverifikasi' then
      raise exception 'Laporan yang sudah terverifikasi tidak dapat diubah oleh Petugas.';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.status = 'terverifikasi' then
    if char_length(btrim(coalesce(new.catatan_verifikasi, ''))) < 5 then
      raise exception 'Perubahan terhadap laporan terverifikasi wajib menyertakan catatan perubahan minimal 5 karakter.';
    end if;
  end if;

  if tg_op = 'UPDATE'
     and old.status <> new.status
     and new.status in ('terverifikasi', 'ditolak') then
    if new.status = 'ditolak'
       and char_length(btrim(coalesce(new.catatan_verifikasi, ''))) < 5 then
      raise exception 'Penolakan laporan wajib disertai alasan minimal 5 karakter.';
    end if;
    new.diverifikasi_oleh := coalesce(auth.uid(), new.diverifikasi_oleh);
    new.diverifikasi_pada := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_jaga_status_laporan on public.laporan;
create trigger trg_jaga_status_laporan
before insert or update on public.laporan
for each row execute function public.jaga_status_laporan();

create or replace function public.catat_riwayat_dan_notifikasi_laporan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kab_id uuid;
  v_nama_kab text;
  v_nama_opt text;
begin
  -- Catat jejak audit bila laporan terverifikasi diubah
  if tg_op = 'UPDATE' and old.status = 'terverifikasi' and auth.uid() is not null then
    insert into public.laporan_riwayat (
      laporan_id,
      diubah_oleh,
      catatan,
      sebelum,
      sesudah
    ) values (
      new.id,
      auth.uid(),
      coalesce(new.catatan_verifikasi, 'Perubahan oleh pejabat berwenang'),
      to_jsonb(old),
      to_jsonb(new)
    );
  end if;

  -- Kirim notifikasi otomatis saat laporan dipublikasikan (menunggu validasi)
  if new.status = 'menunggu' and (tg_op = 'INSERT' or old.status = 'draf') then
    v_kab_id := public.kabupaten_dari_desa(new.desa_id);
    select nama into v_nama_kab from public.wilayah where id = v_kab_id;
    select nama_lokal into v_nama_opt from public.opt where id = new.opt_id;

    insert into public.notifikasi (user_id, judul, isi, tipe, laporan_id)
    select
      p.id,
      case
        when new.tingkat = 'berat' then 'Peringatan Serangan Berat: ' || new.kode
        else 'Laporan Baru Menunggu Validasi: ' || new.kode
      end,
      coalesce(v_nama_opt, 'OPT') || ' di ' || coalesce(v_nama_kab, 'Kalimantan Timur')
        || ' (Intensitas ' || new.intensitas_persen::text || '%).',
      case
        when new.tingkat = 'berat' then 'peringatan_eksplosif'::public.tipe_notifikasi
        else 'menunggu_validasi'::public.tipe_notifikasi
      end,
      new.id
    from public.profiles p
    where p.aktif = true
      and p.id <> new.petugas_id
      and (
        p.peran = 'admin'
        or (p.peran = 'operator' and p.wilayah_id = v_kab_id)
      );
  end if;

  -- Kirim notifikasi ke petugas pelapor saat laporan diverifikasi / ditolak
  if tg_op = 'UPDATE'
     and old.status <> new.status
     and new.status in ('terverifikasi', 'ditolak') then
    insert into public.notifikasi (user_id, judul, isi, tipe, laporan_id)
    values (
      new.petugas_id,
      case
        when new.status = 'terverifikasi' then 'Laporan Terverifikasi: ' || new.kode
        else 'Laporan Perlu Revisi: ' || new.kode
      end,
      coalesce(new.catatan_verifikasi, 'Status laporan Anda telah diperbarui oleh verifikator.'),
      'info',
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_catat_riwayat_dan_notifikasi_laporan on public.laporan;
create trigger trg_catat_riwayat_dan_notifikasi_laporan
after insert or update on public.laporan
for each row execute function public.catat_riwayat_dan_notifikasi_laporan();

-- 11. Indeks Kinerja (SCHEMA.md Â§4)
create index if not exists idx_wilayah_parent on public.wilayah (parent_id);
create index if not exists idx_wilayah_tipe on public.wilayah (tipe);
create index if not exists idx_opt_komoditas on public.opt (komoditas_id);
create index if not exists idx_laporan_desa on public.laporan (desa_id);
create index if not exists idx_laporan_komoditas_periode on public.laporan (komoditas_id, tahun, triwulan);
create index if not exists idx_laporan_status on public.laporan (status);
create index if not exists idx_laporan_tingkat on public.laporan (tingkat);
create index if not exists idx_laporan_dibuat_pada on public.laporan (dibuat_pada desc);
create index if not exists idx_notifikasi_user_dibaca on public.notifikasi (user_id, dibaca, dibuat_pada desc);
create index if not exists idx_log_ekspor_user on public.log_ekspor (user_id, dibuat_pada desc);


-- ============================================================================
-- Migrasi 002: Kebijakan Row Level Security (RLS), Realtime & Bucket Storage
-- Sumber: SCHEMA.md Â§5 dan SECURITY.md Â§5
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

-- 3. Kebijakan Tabel profiles (SCHEMA.md Â§5)
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

drop policy if exists profiles_tambah_admin on public.profiles;
create policy profiles_tambah_admin on public.profiles
  for insert to authenticated
  with check (public.peran_saya() = 'admin');

drop policy if exists profiles_ubah_admin on public.profiles;
create policy profiles_ubah_admin on public.profiles
  for update to authenticated
  using (public.peran_saya() = 'admin')
  with check (public.peran_saya() = 'admin');

drop policy if exists profiles_hapus_admin on public.profiles;
create policy profiles_hapus_admin on public.profiles
  for delete to authenticated
  using (public.peran_saya() = 'admin');

-- 4. Kebijakan Tabel laporan (SCHEMA.md Â§5)
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

-- 6. Kebijakan Tabel log_ekspor (Append-Only â€” SCHEMA.md Â§3.8 & Â§5)
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

-- 7. Kebijakan Tabel notifikasi (SCHEMA.md Â§5)
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

-- 8. Bucket Privat Supabase Storage untuk Foto Geotagging (SECURITY.md Â§5.6 & SCHEMA.md Â§5)
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


-- ============================================================================
-- Migrasi 003: Seed Referensi Wilayah Kalimantan Timur, 7 Komoditas Baku,
-- Katalog OPT Awal & Konfigurasi Ambang Terpusat (SCHEMA.md Â§3 & Â§10.3)
-- Catatan: Tidak menyertakan data laporan atau profil fiktif produksi.
-- ============================================================================

-- 1. Konfigurasi Ambang Bawaan (AGENTS.md Â§8 & Â§11)
insert into public.konfigurasi (kunci, nilai)
values
  ('ambang_sedang_min', 25.00),
  ('ambang_berat_min', 50.00),
  ('ambang_peringatan', 15.00),
  ('ambang_eksplosif', 30.00)
on conflict (kunci) do nothing;

-- 2. Tiga UPTD Wilayah Proteksi Tanaman Perkebunan
insert into public.uptd (kode, nama, jumlah_pengamat_aktif)
values
  ('uptd-ppta', 'UPTD BPTP Wilayah Tengah (Samarinda, Kukar, Kubar, Mahulu)', 18),
  ('uptd-utara', 'UPTD Proteksi Wilayah Utara (Kutim, Berau, Bontang)', 14),
  ('uptd-selatan', 'UPTD Proteksi Wilayah Selatan (Paser, PPU, Balikpapan)', 12)
on conflict (kode) do nothing;

-- 3. Sepuluh Kabupaten/Kota Provinsi Kalimantan Timur (7 Kabupaten + 3 Kota)
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id, lat_pusat, lng_pusat)
select
  v.kode,
  'kabupaten'::public.tipe_wilayah,
  v.nama,
  null,
  u.id,
  v.lat_pusat,
  v.lng_pusat
from (
  values
    ('kab-paser', 'Kab. Paser', 'uptd-selatan', -1.9019::double precision, 116.1965::double precision),
    ('kab-ppu', 'Kab. Penajam Paser Utara', 'uptd-selatan', -1.3005, 116.7164),
    ('kab-kubar', 'Kab. Kutai Barat', 'uptd-ppta', -0.2367, 115.7764),
    ('kab-kukar', 'Kab. Kutai Kartanegara', 'uptd-ppta', -0.4402, 116.9814),
    ('kab-kutim', 'Kab. Kutai Timur', 'uptd-utara', 0.8531, 117.5906),
    ('kab-berau', 'Kab. Berau', 'uptd-utara', 2.1502, 117.4945),
    ('kab-mahulu', 'Kab. Mahakam Ulu', 'uptd-ppta', 0.5256, 115.2289),
    ('kota-balikpapan', 'Kota Balikpapan', 'uptd-selatan', -1.1502, 116.8689),
    ('kota-samarinda', 'Kota Samarinda', 'uptd-ppta', -0.4518, 117.1856),
    ('kota-bontang', 'Kota Bontang', 'uptd-utara', 0.1336, 117.4752)
) as v(kode, nama, uptd_kode, lat_pusat, lng_pusat)
join public.uptd u on u.kode = v.uptd_kode
on conflict (kode) do nothing;

-- Hubungkan kabupaten induk UPTD
update public.uptd u
set kabupaten_id = w.id
from public.wilayah w
where (u.kode = 'uptd-ppta' and w.kode = 'kab-kukar')
   or (u.kode = 'uptd-utara' and w.kode = 'kab-kutim')
   or (u.kode = 'uptd-selatan' and w.kode = 'kab-paser');

-- 4. Kecamatan Administratif Awal Kalimantan Timur
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id)
select
  v.kode,
  'kecamatan'::public.tipe_wilayah,
  v.nama,
  induk.id,
  induk.uptd_id
from (
  values
    ('kec-longikis', 'Long Ikis', 'kab-paser'),
    ('kec-tanahgrogot', 'Tanah Grogot', 'kab-paser'),
    ('kec-babulu', 'Babulu', 'kab-ppu'),
    ('kec-sepaku', 'Sepaku', 'kab-ppu'),
    ('kec-barong', 'Barong Tongkok', 'kab-kubar'),
    ('kec-melak', 'Melak', 'kab-kubar'),
    ('kec-loajanan', 'Loa Janan', 'kab-kukar'),
    ('kec-muarabadak', 'Muara Badak', 'kab-kukar'),
    ('kec-sangatta', 'Sangatta Utara', 'kab-kutim'),
    ('kec-muarawahau', 'Muara Wahau', 'kab-kutim'),
    ('kec-sambaliung', 'Sambaliung', 'kab-berau'),
    ('kec-talisayan', 'Talisayan', 'kab-berau'),
    ('kec-longbagun', 'Long Bagun', 'kab-mahulu'),
    ('kec-bpnutara', 'Balikpapan Utara', 'kota-balikpapan'),
    ('kec-bpntimur', 'Balikpapan Timur', 'kota-balikpapan'),
    ('kec-smdutara', 'Samarinda Utara', 'kota-samarinda'),
    ('kec-palaran', 'Palaran', 'kota-samarinda'),
    ('kec-bontangbarat', 'Bontang Barat', 'kota-bontang'),
    ('kec-bontangselatan', 'Bontang Selatan', 'kota-bontang')
) as v(kode, nama, induk_kode)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do nothing;

-- 5. Desa / Kelurahan Administratif Awal Kalimantan Timur
insert into public.wilayah (kode, tipe, nama, parent_id, uptd_id, lat_pusat, lng_pusat)
select
  v.kode,
  'desa'::public.tipe_wilayah,
  v.nama,
  induk.id,
  induk.uptd_id,
  v.lat_pusat,
  v.lng_pusat
from (
  values
    ('desa-pait', 'Pait', 'kec-longikis', -1.6124::double precision, 116.2981::double precision),
    ('desa-jone', 'Jone', 'kec-tanahgrogot', -1.8942, 116.2104),
    ('desa-babuludarat', 'Babulu Darat', 'kec-babulu', -1.4825, 116.5392),
    ('desa-bukitraya', 'Bukit Raya', 'kec-sepaku', -0.9524, 116.7745),
    ('desa-mencimai', 'Mencimai', 'kec-barong', -0.2548, 115.7412),
    ('desa-empaq', 'Empakuq', 'kec-melak', -0.2912, 115.8315),
    ('desa-loaduri', 'Loa Duri Ilir', 'kec-loajanan', -0.5841, 117.0582),
    ('desa-batuah', 'Batuah', 'kec-loajanan', -0.7124, 117.0411),
    ('desa-badakbaru', 'Badak Baru', 'kec-muarabadak', -0.3125, 117.4108),
    ('desa-swargabara', 'Swarga Bara', 'kec-sangatta', 0.5218, 117.5194),
    ('desa-nehesliah', 'Nehes Liah Bing', 'kec-muarawahau', 1.0785, 116.8622),
    ('desa-seibebanir', 'Sei Bebanir Bangun', 'kec-sambaliung', 2.1105, 117.5321),
    ('desa-bumijaya', 'Bumi Jaya', 'kec-talisayan', 1.5944, 118.1812),
    ('desa-ujohbilang', 'Ujoh Bilang', 'kec-longbagun', 0.5312, 115.2418),
    ('desa-batumajang', 'Batu Majang', 'kec-longbagun', 0.5485, 115.2184),
    ('desa-karangjoang', 'Karang Joang', 'kec-bpnutara', -1.1408, 116.8712),
    ('desa-teritip', 'Teritip', 'kec-bpntimur', -1.1965, 116.9682),
    ('desa-lempake', 'Lempake', 'kec-smdutara', -0.4315, 117.2041),
    ('desa-bukuan', 'Bukuan', 'kec-palaran', -0.5814, 117.1892),
    ('desa-kanaan', 'Kanaan', 'kec-bontangbarat', 0.1288, 117.4541),
    ('desa-bontanglestari', 'Bontang Lestari', 'kec-bontangselatan', 0.0615, 117.4412)
) as v(kode, nama, induk_kode, lat_pusat, lng_pusat)
join public.wilayah induk on induk.kode = v.induk_kode
on conflict (kode) do nothing;

-- 6. Delapan Komoditas Unggulan Perkebunan Kaltim (AGENTS.md §8)
insert into public.komoditas (nama, kode_ikon, aktif)
values
  ('Lada', 'lada', true),
  ('Kelapa Sawit', 'sawit', true),
  ('Kakao', 'kakao', true),
  ('Karet', 'karet', true),
  ('Aren', 'aren', true),
  ('Kelapa Dalam', 'kelapa_dalam', true),
  ('Kopi', 'kopi', true),
  ('Pala', 'pala', true)
on conflict (nama) do nothing;

-- 7. Katalog Master 40 OPT Utama Perkebunan Kalimantan Timur (SCHEMA.md §3.5)
insert into public.opt (komoditas_id, nama_lokal, nama_ilmiah, jenis, gejala, rekomendasi)
select
  k.id,
  v.nama_lokal,
  v.nama_ilmiah,
  v.jenis::public.jenis_opt,
  v.gejala,
  v.rekomendasi
from (
  values
    -- 1. KELAPA SAWIT (6 OPT)
    ('Kelapa Sawit', 'Busuk Pangkal Batang', 'Ganoderma boninense', 'penyakit',
      'Daun tombak tidak membuka lebih dari 3 pelepah, pelepah bawah mengering dan menggantung (sengkleh), muncul basidioma (tubuh buah jamur) di pangkal batang.',
      'Pembuatan parit isolasi 1x1 m mengelilingi pokok terserang, aplikasi agens hayati Trichoderma harzianum / T. virens, sanitasi dan pencacahan bonggol terinfeksi.'),
    ('Kelapa Sawit', 'Kumbang Tanduk', 'Oryctes rhinoceros', 'hama',
      'Pelepah daun muda yang baru membuka tampak terpotong berbentuk baji / segitiga menyerupai huruf V, terdapat gerekan serat pada titik tumbuh (pupus).',
      'Pemasangan perangkap feromon agregat (Feromonas) 1 unit/2 Ha, penaburan jamur entomopatogen Metarhizium anisopliae pada tumpukan tandan kosong/serasah.'),
    ('Kelapa Sawit', 'Ulat Api', 'Setora nitens', 'hama',
      'Helaian anak daun habis dimakan ulat menyisakan lidi, serangan bermula dari pelepah bawah merambat cepat ke tajuk atas hingga tajuk meranggas.',
      'Konservasi tanaman inang musuh alami Turnera subulata dan Antigonon leptopus, pelepasan predator Sycanus dichotomus, aplikasi biopestisida Bacillus thuringiensis.'),
    ('Kelapa Sawit', 'Ulat Kantung', 'Metisa plana', 'hama',
      'Daun berlubang-lubang kecil dan tampak bintik kantung ulat menggantung dari kerucut daun; tajuk tampak kering keabuan dari kejauhan.',
      'Pemanfaatan musuh alami Dolichogenidea metesae, pengutipan manual pada tanaman muda, injeksi batang bila tingkat serangan di atas ambang kritis.'),
    ('Kelapa Sawit', 'Tikus Pohon', 'Rattus tiomanicus', 'hama',
      'Buah sawit matang berlubang bekas keratan gigi seri, bunga jantan/betina muda hancur dikerat, berondolan berserakan di piringan.',
      'Pemasangan rumah burung hantu (Tyto alba) 1 unit per 20-25 Ha, sanitasi piringan kebun, penggunaan umpan rodentisida secara selektif.'),
    ('Kelapa Sawit', 'Busuk Daun Antraknosa', 'Colletotrichum gloeosporioides', 'penyakit',
      'Bercak kecil melingkar cokelat gelap dengan batas kuning cerah di ujung helaian daun bibit / TBM, bercak menyatu membuat daun layu terbakar.',
      'Pengurangan naungan pembibitan untuk sirkulasi udara, pemisahan bibit terinfeksi, aplikasi fungisida tembaga atau agens hayati Trichoderma.'),

    -- 2. LADA (5 OPT)
    ('Lada', 'Busuk Pangkal Batang Lada', 'Phytophthora capsici', 'penyakit',
      'Layu mendadak seluruh daun sulur tanaman dalam 3-7 hari, leher akar dan pangkal batang bawah tanah busuk basah berbau khas kehitaman.',
      'Pembuatan saluran drainase kebun yang dalam, pemangkasan sulur cacing dekat tanah, pemanfaatan agens hayati Trichoderma sp. dicampur pupuk kandang matang.'),
    ('Lada', 'Kepik Penghisap Buah Lada', 'Dasynus piperis', 'hama',
      'Tusukan pada tandan buah menyebabkan buah lada berbercak hitam, mengering keriput, kopong/hampa, dan rontok massal sebelum matang.',
      'Sanitasi gulma inang di sekitar tajar lada, penyemprotan agens entomopatogen Beauveria bassiana pada sore hari saat kepik aktif.'),
    ('Lada', 'Kepik Penghisap Bunga Lada', 'Diconocoris hewetti', 'hama',
      'Tandan bunga lada muda menghitam, mengering, membusuk, dan rontok sehingga tandan buah tidak terbentuk.',
      'Pemangkasan pohon panjat (tajar) agar kebun mendapat sinar matahari cukup, aplikasi minyak nimba (pestisida nabati) atau Beauveria bassiana.'),
    ('Lada', 'Penggerek Batang Lada', 'Lophobaris piperis', 'hama',
      'Pucuk dan cabang lada layu mendadak mengering, terdapat lubang gerek kecil pada ruas buku cabang disertai kotoran gerek kecokelatan.',
      'Pemotongan cabang terserang 5 cm di bawah lubang gerek lalu dibakar, pengolesan pasta Beauveria bassiana pada ruas buku berpotensi gerek.'),
    ('Lada', 'Penyakit Kuning Lada', 'Meloidogyne incognita / Radopholus similis', 'penyakit',
      'Pertumbuhan merana, daun menguning perlahan dari bawah ke atas, daun mengecil dan kaku, perakaran membengkak (puru akar) dan membusuk.',
      'Penaburan agens hayati nematoda mikoriza arbuskula (CMA) dan Paecilomyces lilacinus, penambahan bahan organik tinggi dan pengapuran tanah masam.'),

    -- 3. KAKAO (5 OPT)
    ('Kakao', 'Penggerek Buah Kakao (PBK)', 'Conopomorpha cramerella', 'hama',
      'Buah masak lebih awal dengan belang tidak merata (kuning-hijau), saat dibelah biji saling melekat, mengeras keriput, dan bobot merosot tajam.',
      'Penerapan PsPSP (Panen sering 1x seminggu, Pemangkasan pemeliharaan, Sanitasi kulit buah dibenamkan, Pemupukan seimbang) serta penyarungan (kondomisasi) buah 8 cm.'),
    ('Kakao', 'Busuk Buah Kakao', 'Phytophthora palmivora', 'penyakit',
      'Bercak cokelat basah berbatas tegas mulai dari ujung atau pangkal buah meluas cepat hingga buah membusuk hitam tertutup lapisan miselium putih bertepung.',
      'Pemetikan buah busuk lalu dikubur sedalam 30 cm, pemangkasan tunas air (wiwilan) dan tajuk untuk menurunkan kelembapan relatif tajuk kebun.'),
    ('Kakao', 'Kanker Batang Kakao (VSD)', 'Ceratobasidium theobromae', 'penyakit',
      'Daun kedua atau ketiga dari pucuk menguning dengan pulau-pulau hijau khas, daun gugur meninggalkan ranting gundul, pembuluh kayu berbintik cokelat bila diserut.',
      'Pemangkasan ranting sakit 30 cm di bawah batas gejala serutan cokelat, sanitasi alat pangkas dengan alkohol, pengolesan fungisida tembaga pada bekas pangkasan.'),
    ('Kakao', 'Kepik Penghisap Buah Kakao', 'Helopeltis antonii', 'hama',
      'Bercak cekung cokelat kehitaman berdiameter 2-3 mm pada kulit buah muda (cherelle) menyebabkan buah mengering (cherelle wilt) atau buah tua berkeropeng retak.',
      'Pengendalian semut hitam (Dolichoderus thoracicus) dan kutu putih sebagai musuh alami, penyemprotan ekstrak biji mimba atau Beauveria bassiana.'),
    ('Kakao', 'Penggerek Batang Merah Kakao', 'Zeuzera coffeae', 'hama',
      'Ranting atau cabang kakao layu, kering mendadak, patah tertiup angin; terdapat lubang gerek dengan kotoran silindris bulat merah kecokelatan di tanah.',
      'Penyuntikan larutan biopestisida Beauveria bassiana ke dalam lubang gerek aktif lalu lubang ditutup pasak kayu/lumpur tanah.'),

    -- 4. KARET (4 OPT)
    ('Karet', 'Gugur Daun Corynespora', 'Corynespora cassiicola', 'penyakit',
      'Bercak nekrotik kehitaman menyirip sepanjang tulang daun menyerupai duri ikan (herring bone), daun muda maupun tua gugur berulang hingga tajuk meranggas gundul.',
      'Aplikasi fungisida propikonazol atau heksakonazol sistemik pada kebun pembibitan/TBM, pemupukan ekstra hara K untuk mempertebal dinding sel kutikula daun.'),
    ('Karet', 'Jamur Akar Putih (JAP)', 'Rigidoporus microporus', 'penyakit',
      'Daun kanopi kusam menguning lalu gugur perlahan, pohon berbunga di luar musim; leher akar dan permukaan akar tunggang ditumbuhi benang miselium tebal putih menjalar.',
      'Pembongkaran leher akar, pengolesan belerang 100-200 gram per pohon atau pasta Trichoderma sp. pada perakaran, parit isolasi pemutus kontak akar sehat.'),
    ('Karet', 'Kering Alur Sadur (KAS)', 'Fisiologis (Over tapping)', 'penyakit',
      'Lateks tidak mengalir pada sebagian atau seluruh alur sadapan, alur sadur mengering berwarna kecokelatan dan timbul rekahan pecah kulit.',
      'Penghentian penyadapan sementara (istirahat sadap 3-6 bulan), perbaikan sistem sadap d/3 atau d/4, pemupukan berimbang hara NPKMg.'),
    ('Karet', 'Rayap Kayu Karet', 'Coptotermes curvignathus', 'hama',
      'Lorong kembara tanah menutupi permukaan kulit batang karet dari pangkal bawah hingga cabang, jaringan kambium dan kayu dimakan hingga pohon roboh.',
      'Pembongkaran sarang rayap di sekitar tunggul lapuk, aplikasi agens hayati jamur Metarhizium anisopliae pada alur lintasan rayap.'),

    -- 5. AREN (5 OPT)
    ('Aren', 'Ulat Daun Aren', 'Artona catoxantha', 'hama',
      'Helaian daun muda dan tua aren berlubang gerus memanjang seperti tangga di bawah permukaan daun, daun mengering cokelat kemerahan seperti terbakar api.',
      'Pemangkasan dan pemusnahan pelepah terserang berat, pelepasan parasitoid telur Trichogrammatoidea nana dan parasitoid larva Apanteles artonae.'),
    ('Aren', 'Kumbang Tanduk Aren', 'Oryctes rhinoceros', 'hama',
      'Titik tumbuh tanaman aren digerek, daun janur yang membuka menampilkan pola potongan segitiga terpotong berulang, pertumbuhan terhambat.',
      'Pemasangan perangkap feromon, aplikasi spora jamur Metarhizium anisopliae pada pangkal batang aren tua lapuk tempat perkembangbiakan lundi/larva.'),
    ('Aren', 'Kumbang Sagu / Moncong Aren', 'Rhynchophorus ferrugineus', 'hama',
      'Larva menggerek empulur batang aren hingga bagian dalam batang berlubang dan membusuk basah berbau masam, pelepah pucuk terkulai patah.',
      'Penutupan bekas luka pangkas atau bekas sadapan dengan ter atau bubur bordes, pemasangan perangkap feromon Ferolure di sudut kebun aren.'),
    ('Aren', 'Busuk Titik Tumbuh Aren', 'Thielaviopsis paradoxa', 'penyakit',
      'Titik tumbuh pelepah pucuk aren membusuk basah kecokelatan mengeluarkan cairan berlendir, tanaman mati dari bagian paling atas.',
      'Perbaikan drainase sekitar pokok aren, pemangkasan bagian sakit dan penyemprotan klorotalonil atau suspensi Trichoderma konidia.'),
    ('Aren', 'Bercak Daun Cercospora Aren', 'Cercospora sp.', 'penyakit',
      'Bercak bulat kecil cokelat dengan titik tengah kelabu keputihan dikelilingi halo kuning pada helaian daun aren bibit dan tanaman muda.',
      'Pengaturan jarak tanam bibit aren untuk pencahayaan optimal, pembuangan daun terinfeksi, aplikasi fungisida nabati rebusan daun sirih dan mimba.'),

    -- 6. KELAPA DALAM (5 OPT)
    ('Kelapa Dalam', 'Kumbang Janur Kelapa', 'Brontispa longissima', 'hama',
      'Larva dan kumbang memakan epidermis daun janur yang belum membuka, setelah membuka janur tampak kering cokelat bergaris-garis seperti terbakar.',
      'Pelepasan parasitoid larva Tetrastichus brontispae, penyemprotan agens hayati Metarhizium anisopliae pada tajuk janur belum membuka.'),
    ('Kelapa Dalam', 'Kumbang Tanduk Kelapa', 'Oryctes rhinoceros', 'hama',
      'Pelepah daun muda terpotong menyerupai huruf V, titik tumbuh tanaman kelapa mengalami kerusakan gerek silindris.',
      'Pemasangan feromon agregat 1 set/2 Ha, penaburan serbuk jamur Metarhizium anisopliae pada serasah busuk atau batang kelapa tumbang.'),
    ('Kelapa Dalam', 'Belalang Sexava Kelapa', 'Sexava nubila', 'hama',
      'Helaian daun kelapa dimakan habis dari pinggir menyisakan lidi pelepah; pada serangan eksplosif seluruh tajuk gundul menurunkan produksi kopra hingga 80%.',
      'Pelepasan parasitoid telur Doirania leefmansi, pemasangan perangkap lem pada pangkal batang pokok kelapa, sanitasi semak inang.'),
    ('Kelapa Dalam', 'Kutu Perisai Kelapa', 'Aspidiotus destructor', 'hama',
      'Permukaan bawah daun kelapa tertutup lapisan kutu berkerak kuning keputihan, cairan sel dihisap hingga daun menguning layu lalu mengering.',
      'Konservasi predator kumbang kubah Chilocorus politus, penyemprotan deterjen nabati encer atau minyak nimba untuk meluruhkan lapisan lilin kutu.'),
    ('Kelapa Dalam', 'Busuk Pucuk Kelapa', 'Phytophthora palmivora', 'penyakit',
      'Daun tombak pucuk layu terkulai patah dan busuk mengeluarkan bau busuk menusuk, pelepah lain menguning berangsur dari tengah ke luar.',
      'Pembersihan dan pembakaran jaringan busuk pucuk, aplikasi pasta bubur Bordeaux atau agens hayati Trichoderma pada pangkal pelepah pucuk.'),

    -- 7. KOPI (5 OPT)
    ('Kopi', 'Penggerek Buah Kopi (PBKo)', 'Hypothenemus hampei', 'hama',
      'Lubang bulat kecil diameter 1 mm pada bagian cakram (ujung) buah kopi; buah muda rontok dan buah tua berbiji keropos cacat menurunkan mutu cita rasa.',
      'Kutipan buah terserang (lelesan, racutan, rampasan pascapanen), pemasangan perangkap botol plastik dengan senyawa penarik (atraktan) metanol:etanol (3:1).'),
    ('Kopi', 'Karat Daun Kopi', 'Hemileia vastatrix', 'penyakit',
      'Bercak kuning muda di permukaan atas daun yang bertransisi menjadi serbuk oranye terang seperti tepung karat di permukaan bawah daun, daun rontok dini.',
      'Penanaman varietas tahan karat daun (Arabika Sigarar Utang / Robusta klon unggul), pemangkasan pohon naungan lamtoro untuk sirkulasi cahaya, fungisida tembaga.'),
    ('Kopi', 'Penggerek Ranting Kopi', 'Xylosandrus compactus', 'hama',
      'Ranting sekunder dan tersier kopi mengering dari ujung mundur ke pangkal daun layu cokelat kehitaman, terdapat lubang gerek di sisi bawah ranting.',
      'Pemotongan ranting terserang 5 cm di bawah batas gerek lalu dibakar, pemeliharaan kebersihan kebun dan pemanfaatan jamur entomopatogen Beauveria bassiana.'),
    ('Kopi', 'Kutu Dompolan Kopi', 'Planococcus citri', 'hama',
      'Kumpulan kutu putih bertepung berkoloni pada tangkai buah, bunga, dan tunas muda kopi; embun jelaga hitam tumbuh lebat menutupi fotosintesis daun.',
      'Pengendalian sarang semut hitam pendukung kutu, pemangkasan cabang ternaungi, penyemprotan air sabun lembut / pestisida nabati mimba.'),
    ('Kopi', 'Jamur Upas Kopi', 'Corticium salmonicolor', 'penyakit',
      'Lapisan kerak tipis mengkilap seperti perak di cabang/batang yang berkembang menjadi kerak merah muda (salmon) tebal mengelupas, cabang di atasnya mati ranting.',
      'Pengerokan kerak jamur pada cabang berkayu tebal lalu dilumuri ter atau bubur Bordeaux, pemangkasan ranting kecil terinfeksi berat.'),

    -- 8. PALA (5 OPT)
    ('Pala', 'Penggerek Batang Pala', 'Batocera hercules', 'hama',
      'Batang tanaman pala berlubang gerek mengeluarkan cairan getah merah kecokelatan bercampur serbuk kayu, daun tajuk atas menguning layu meranggas.',
      'Pembersihan lubang gerek dengan kawat lalu disuntik larutan Beauveria bassiana / minyak nimba kemudian lubang ditutup pasak kayu.'),
    ('Pala', 'Busuk Buah Kering Pala', 'Stigmina myristicae', 'penyakit',
      'Bercak nekrotik bulat kecil cokelat pada daging buah pala yang mengeras berkeriput, buah membelah sebelum matang fisiologis (pecah dini) merusak fuli.',
      'Pemangkasan sanitasi tajuk tanaman pala yang terlalu rimbun agar sinar matahari tembus, pengumpulan dan penguburan buah terserang sedalam 40 cm.'),
    ('Pala', 'Busuk Buah Basah Pala', 'Colletotrichum gloeosporioides', 'penyakit',
      'Bercak basah melekuk cokelat kehitaman meluas pada buah pala muda dan tua disertai gugur buah massal saat musim hujan basah berkepanjangan.',
      'Penyemprotan larutan suspensi Trichoderma harzianum pada permukaan buah, perbaikan parit pembuangan air di sekitar kebun pala.'),
    ('Pala', 'Kanker Batang Pala', 'Phytophthora sp.', 'penyakit',
      'Kulit batang pangkal bawah tampak memar basah kehitaman, mengeluarkan eksudat getah kental merah marun berbau busuk, tajuk daun menguning perlahan.',
      'Pengerokan kulit batang sakit hingga jaringan sehat terlihat, pengolesan pasta fungisida tembaga atau biopestisida Trichoderma, pembukaan leher akar.'),
    ('Pala', 'Rayap Pangkal Batang Pala', 'Coptotermes sp.', 'hama',
      'Pangkal akar dan batang bagian bawah tertutup lorong lumpur rayap; rayap menggerus jaringan empulur berkayu hingga pohon pala goyah dan tumbang.',
      'Pembersihan sisa tunggul lapuk di areal kebun pala, penaburan jamur entomopatogen Metarhizium anisopliae pada alur tanah perakaran.')
) as v(nama_komoditas, nama_lokal, nama_ilmiah, jenis, gejala, rekomendasi)
join public.komoditas k on k.nama = v.nama_komoditas
where not exists (
  select 1
  from public.opt o
  where o.komoditas_id = k.id
    and lower(o.nama_ilmiah) = lower(v.nama_ilmiah)
);



-- ============================================================================
-- 4. DAFTARKAN AKUN ADMIN DARI auth.users SECARA OTOMATIS
-- ============================================================================
insert into public.profiles (id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif)
select 
  id,
  'Admin Utama Disbun Kaltim',
  '198501012010011001',
  'Kepala Seksi Proteksi Tanaman',
  'admin',
  null,
  'Provinsi Kalimantan Timur',
  true
from auth.users 
order by created_at asc limit 1
on conflict (id) do update set
  peran = 'admin',
  aktif = true;

-- ============================================================================
-- 5. FUNGSI DATABASE PENDAFTARAN & PENGHAPUSAN AKUN LANGSUNG OLEH ADMIN
-- ============================================================================
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
    return jsonb_build_object('ok', false, 'pesan', 'Hanya Admin Provinsi yang berwenang menambah akun pengguna.');
  end if;

  if coalesce(trim(p_email), '') = '' or coalesce(trim(p_kata_sandi), '') = '' then
    return jsonb_build_object('ok', false, 'pesan', 'Alamat email dan kata sandi wajib diisi.');
  end if;

  if length(trim(p_kata_sandi)) < 6 then
    return jsonb_build_object('ok', false, 'pesan', 'Kata sandi minimal 6 karakter.');
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));
  v_encrypted_pw := extensions.crypt(trim(p_kata_sandi), extensions.gen_salt('bf'));

  if v_user_id is not null then
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
    v_user_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      lower(trim(p_email)), v_encrypted_pw, now(),
      '', '', '', '', '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', trim(p_nama), 'nip', nullif(trim(p_nip), '')),
      now(), now()
    );

    begin
      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', lower(trim(p_email))),
        'email', v_user_id::text, now(), now(), now()
      ) on conflict do nothing;
    exception when others then
      null;
    end;
  end if;

  insert into public.profiles (
    id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif
  ) values (
    v_user_id, trim(p_nama), nullif(trim(p_nip), ''),
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


