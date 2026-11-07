-- ============================================================================
-- Migrasi 001: Skema Inti SIPUT-KALTIM (Fase 2)
-- Sumber: SCHEMA.md §2–§4, §6 dan SECURITY.md §5, §7
-- Catatan: Jalankan secara sadar oleh pemilik proyek pada Supabase SQL Editor / CLI.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Tipe Enumerasi (SCHEMA.md §2)
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

-- 2. Tabel UPTD & Wilayah Administratif (SCHEMA.md §3.2 & §3.3)
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

-- 3. Tabel Profil Pengguna Terautentikasi (SCHEMA.md §3.1)
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
    or (peran in ('operator', 'petugas') and wilayah_id is not null)
  )
);

-- 4. Tabel Komoditas & Katalog OPT (SCHEMA.md §3.4 & §3.5)
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

-- 5. Tabel Konfigurasi Terpusat (SCHEMA.md §3.11)
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

-- 6. Sekuens & Tabel Laporan Observasi OPT (SCHEMA.md §3.6)
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

-- 7. Tabel Foto Geotagging, Riwayat Laporan, Log Ekspor & Notifikasi (SCHEMA.md §3.7–§3.10)
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

-- 8. Fungsi Bantu Hierarki & Keamanan (SECURITY.md §5.4: wajib set search_path = public)
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

-- 9. Trigger Validasi Relasi, Pembuatan Kode Otomatis & Kalkulasi Intensitas (SCHEMA.md §4 & §6)
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

-- 10. Trigger Penjaga Status Verifikasi & Jejak Audit Riwayat (SCHEMA.md §4 & §6)
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

-- 11. Indeks Kinerja (SCHEMA.md §4)
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
