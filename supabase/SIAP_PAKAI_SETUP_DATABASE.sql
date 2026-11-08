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

-- 6. Tujuh Komoditas Baku Terpisah (AGENTS.md Â§8)
insert into public.komoditas (nama, kode_ikon, aktif)
values
  ('Lada', 'lada', true),
  ('Kelapa Sawit', 'sawit', true),
  ('Kakao', 'kakao', true),
  ('Karet', 'karet', true),
  ('Aren', 'aren', true),
  ('Kelapa Dalam', 'kelapa_dalam', true),
  ('Kopi', 'kopi', true)
on conflict (nama) do nothing;

-- 7. Katalog OPT Utama Perkebunan Kalimantan Timur (SCHEMA.md Â§3.5)
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
    ('Kelapa Sawit', 'Busuk Pangkal Batang', 'Ganoderma boninense', 'penyakit',
      'Daun tombak tidak membuka lebih dari 3 pelepah, pelepah bawah mengering dan menggantung, muncul tubuh buah jamur di pangkal batang.',
      'Parit isolasi 1x1 m pada pokok terserang, aplikasi agens hayati Trichoderma harzianum, sanitasi bonggol terinfeksi.'),
    ('Kelapa Sawit', 'Kumbang Tanduk', 'Oryctes rhinoceros', 'hama',
      'Pelepah daun muda terpotong berbentuk segitiga seperti huruf V dan terdapat gerekan pada titik tumbuh.',
      'Pemasangan feromon agregat (Feromonas), aplikasi jamur entomopatogen Metarhizium anisopliae pada tumpukan tandan kosong.'),
    ('Kelapa Sawit', 'Ulat Api', 'Setora nitens', 'hama',
      'Helaian anak daun habis dimakan hingga menyisakan lidi dari pelepah bawah merambat ke tajuk atas.',
      'Penanaman tanaman bermanfaat Turnera subulata, konservasi musuh alami Sycanus sp., pengutipan kepompong.'),
    ('Lada', 'Busuk Pangkal Batang Lada', 'Phytophthora capsici', 'penyakit',
      'Layu mendadak seluruh sulur, bercak hitam berlendir pada leher akar, daun menguning lalu gugur cepat.',
      'Pembuatan saluran drainase kebun, pemangkasan sulur cacing, pemberian bubur Bordeaux dan Trichoderma sp.'),
    ('Lada', 'Kepik Penghisap Buah Lada', 'Dasynus piperis', 'hama',
      'Buah lada menghitam, kosong (hampa), dan rontok sebelum masak fisiologis.',
      'Sanitasi gulma inang, pemanfaatan jamur Beauveria bassiana pada pagi/sore hari.'),
    ('Kakao', 'Penggerek Buah Kakao (PBK)', 'Conopomorpha cramerella', 'hama',
      'Buah masak awal belang kuning-hijau, biji saling melekat dan berwarna kehitaman saat dibelah.',
      'PsPSP (Panen sering, Pemangkasan teratur, Sanitasi kulit buah, Pemupukan berimbang) serta sarungisasi buah.'),
    ('Kakao', 'Busuk Buah Kakao', 'Phytophthora palmivora', 'penyakit',
      'Bercak cokelat kehitaman berbatas tegas dimulai dari ujung atau pangkal buah dan tertutup miselium putih.',
      'Pemangkasan penaung untuk menurunkan kelembapan, pemetikan dan penguburan buah busuk sedalam 30 cm.'),
    ('Karet', 'Gugur Daun Corynespora', 'Corynespora cassiicola', 'penyakit',
      'Bercak nekrotik menyirip seperti tulang ikan sepanjang tulang daun diikuti gugur daun berulang.',
      'Pemupukan ekstra K pada awal pembentukan daun baru, aplikasi fungisida selektif pada kebun pembibitan.'),
    ('Karet', 'Jamur Akar Putih (JAP)', 'Rigidoporus microporus', 'penyakit',
      'Daun kusam menguning lalu meranggas, terdapat rizomorfa putih menjalar kuat pada permukaan akar tunggang.',
      'Pembukaan leher akar, pengolesan belerang/Trichoderma konidia pada perakaran sehat di sekeliling pohon sakit.'),
    ('Aren', 'Ulat Daun Aren', 'Artona catoxantha', 'hama',
      'Bercak transparan memanjang seperti tangga pada helaian daun tua yang mengering seperti terbakar.',
      'Pemangkasan pelepah tua terserang berat dan pelepasan parasitoid Apanteles artonae.'),
    ('Kelapa Dalam', 'Kumbang Janur Kelapa', 'Brontispa longissima', 'hama',
      'Janur yang belum membuka tampak cokelat mengering dan berkerut akibat gerekan larva dan imago.',
      'Pelepasan parasitoid Tetrastichus brontispae dan aplikasi Metarhizium anisopliae pada pucuk kelapa.'),
    ('Kopi', 'Penggerek Buah Kopi (PBKo)', 'Hypothenemus hampei', 'hama',
      'Lubang kecil di cakram ujung buah kopi; buah muda gugur dan buah tua berlubang-lubang menurunkan mutu biji.',
      'Lelesan, racutan, rampasan buah tersisa pascapanen serta pemasangan perangkap atraktan alkohol-metanol.')
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


