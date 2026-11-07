# SCHEMA.md — SIPUT-KALTIM

Model data dan kontrak lapisan data. Sumber: PRD §7 dan §8.

> **STATUS: RANCANGAN. SQL di bawah belum dijalankan di mana pun.** Jangan membuat proyek Supabase, menjalankan migrasi, atau memanggil basis data sungguhan sebelum pengguna memerintahkan Fase 2 secara eksplisit. Pada Fase 1, data berasal dari `src/mocks/` melalui antarmuka repository (§9).

Tabel dan kolom berasal dari PRD §7. Tambahan di luar PRD ditandai **[USUL]** dan perlu persetujuan pemilik sebelum dibuat.

## 1. Gambaran

```
auth.users 1─1 profiles ──> wilayah (kabupaten) 
wilayah (kabupaten → kecamatan → desa), wilayah.uptd_id → uptd [USUL]
komoditas 1─* opt
laporan *─1 profiles (petugas)   laporan *─1 wilayah (desa)
laporan *─1 komoditas            laporan *─1 opt
laporan 1─* laporan_foto
laporan 1─* laporan_riwayat [USUL]
profiles 1─* log_ekspor          profiles 1─* notifikasi
konfigurasi [USUL] (ambang klasifikasi dan peringatan)
```

## 2. Tipe Enumerasi

| Nama | Nilai |
|---|---|
| `peran` | `admin`, `operator`, `petugas` |
| `tipe_wilayah` | `kabupaten`, `kecamatan`, `desa` |
| `jenis_opt` | `hama`, `penyakit` |
| `tingkat_serangan` | `ringan`, `sedang`, `berat` |
| `status_laporan` | `draf`, `menunggu`, `terverifikasi`, `ditolak` |
| `fase_tanaman` | `tbm`, `tm`, `ttm_tr` |
| `tipe_notifikasi` | `laporan_baru`, `peringatan_eksplosif`, `menunggu_validasi`, `info` |

Catatan: PRD menulis `jenis (hama/penyakit)` dan `tingkat`/`status` sebagai nilai tetap; penambahan `fase_tanaman` dan `tipe_notifikasi` sebagai enum adalah penegasan atas kolom `fase_tanaman` dan `tipe` di PRD.

## 3. Tabel

### 3.1 `profiles`
| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | uuid PK | = `auth.users.id`, `on delete cascade` |
| `nama` | text | wajib |
| `nip` | text | unik, nullable; sensitif |
| `jabatan` | text | |
| `peran` | `peran` | wajib |
| `wilayah_id` | uuid FK → `wilayah.id` | kabupaten kerja; null untuk admin |
| `aktif` | boolean | bawaan `true` |

### 3.2 `wilayah`
| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | uuid PK | |
| `tipe` | `tipe_wilayah` | |
| `nama` | text | |
| `parent_id` | uuid FK → `wilayah.id` | kabupaten: null; kecamatan → kabupaten; desa → kecamatan |
| `uptd_id` | uuid FK → `uptd.id` | **[USUL]**, nullable (PRD menyebut kolom ini tanpa tabel) |

Seed: 7 kabupaten (Paser, Penajam Paser Utara, Kutai Barat, Kutai Kartanegara, Kutai Timur, Berau, Mahakam Ulu) dan 3 kota (Balikpapan, Samarinda, Bontang). Data kecamatan/desa resmi harus dari sumber pemerintah; jangan mengarang.

### 3.3 `uptd` **[USUL]**
`id`, `nama`, `kabupaten_id`. Dipakai untuk kartu "UPTD Wilayah … — n Pengamat Aktif" dan filter Rekap "Wilayah Kerja/UPTD".

### 3.4 `komoditas`
`id`, `nama` (unik), `aktif`. Seed: Lada, Kelapa Sawit, Kakao, Karet, Aren, Kelapa Dalam, Kopi.

### 3.5 `opt`
`id`, `komoditas_id` FK, `nama_lokal`, `nama_ilmiah`, `jenis`, `gejala`, `rekomendasi`. Contoh dari PRD: *Ganoderma boninense* dan *Oryctes rhinoceros* (Kelapa Sawit), *Phytophthora capsici* (Lada), *Conopomorpha cramerella* (Kakao), *Corynespora cassiicola* dan *Rigidoporus microporus* (Karet).

### 3.6 `laporan`
| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | uuid PK | |
| `kode` | text unik | mis. `KKR-2024-058`; dibuat otomatis |
| `petugas_id` | uuid FK → `profiles.id` | wajib |
| `desa_id` | uuid FK → `wilayah.id` | harus bertipe `desa` |
| `nama_blok` | text | blok/poktan |
| `lat`, `lng` | double precision | WGS 84; di dalam Kaltim |
| `komoditas_id` | uuid FK | |
| `opt_id` | uuid FK | OPT harus milik komoditas yang sama |
| `fase_tanaman` | `fase_tanaman` | |
| `tahun` | smallint | |
| `triwulan` | smallint | 1–4 |
| `semester` | smallint | 1–2; konsisten dengan triwulan |
| `luas_amatan` | numeric(12,2) | > 0 |
| `luas_ringan`, `luas_berat`, `luas_terkendali` | numeric(12,2) | ≥ 0 |
| `intensitas_persen` | numeric(5,2) | dihitung trigger |
| `tingkat` | `tingkat_serangan` | dihitung trigger dari `konfigurasi` |
| `status` | `status_laporan` | bawaan `draf` |
| `rekomendasi_kultur`, `rekomendasi_hayati`, `rekomendasi_kimiawi` | text | |
| `catatan_verifikasi` | text | **[USUL]** alasan tolak/ubah |
| `dibuat_pada` | timestamptz | bawaan `now()` |
| `diverifikasi_oleh` | uuid FK → `profiles.id` | |
| `diverifikasi_pada` | timestamptz | **[USUL]** |

Batasan: `luas_ringan + luas_berat + luas_terkendali <= luas_amatan`; `(triwulan in (1,2) and semester=1) or (triwulan in (3,4) and semester=2)`.

### 3.7 `laporan_foto`
`id`, `laporan_id` FK (cascade), `path_storage`, `geotag_lat`, `geotag_lng`, `urutan` (1–3). Maksimal 3 foto per laporan (unik `(laporan_id, urutan)`, `urutan between 1 and 3`).

### 3.8 `log_ekspor`
`id`, `user_id` FK, `nama_berkas`, `format` (`xlsx`/`pdf`), `filter_json` jsonb, `dibuat_pada`. Hanya tambah (*append-only*).

### 3.9 `notifikasi`
`id`, `user_id` FK, `judul`, `isi`, `tipe`, `dibaca` (bawaan `false`), `dibuat_pada`.

### 3.10 `laporan_riwayat` **[USUL]**
`id`, `laporan_id`, `diubah_oleh`, `diubah_pada`, `catatan`, `sebelum` jsonb, `sesudah` jsonb. Memenuhi aturan PRD §8 "perubahan laporan terverifikasi dengan catatan perubahan".

### 3.11 `konfigurasi` **[USUL]**
Satu baris kunci–nilai: `ambang_sedang_min` (25), `ambang_berat_min` (50), `ambang_peringatan` (15), `ambang_eksplosif` (30). Dipakai agar ambang dapat diubah tanpa rilis ulang (PRD §14 no. 1). Hanya Admin yang boleh mengubah.

## 4. Rancangan SQL (referensi, belum dijalankan)

```sql
-- Enum
create type peran as enum ('admin','operator','petugas');
create type tipe_wilayah as enum ('kabupaten','kecamatan','desa');
create type jenis_opt as enum ('hama','penyakit');
create type tingkat_serangan as enum ('ringan','sedang','berat');
create type status_laporan as enum ('draf','menunggu','terverifikasi','ditolak');
create type fase_tanaman as enum ('tbm','tm','ttm_tr');

-- Fungsi bantu (security definer agar tidak memicu rekursi RLS)
create function public.peran_saya() returns peran
language sql stable security definer set search_path = public as $$
  select peran from profiles where id = auth.uid() and aktif
$$;

create function public.kabupaten_saya() returns uuid
language sql stable security definer set search_path = public as $$
  select wilayah_id from profiles where id = auth.uid() and aktif
$$;

create function public.kabupaten_dari_desa(p_desa uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select kab.id
  from wilayah d
  join wilayah kec on kec.id = d.parent_id
  join wilayah kab on kab.id = kec.parent_id
  where d.id = p_desa
$$;

-- Trigger penghitung intensitas dan tingkat (ambang dari konfigurasi)
create function public.hitung_laporan() returns trigger
language plpgsql set search_path = public as $$
declare v_sedang numeric; v_berat numeric;
begin
  select (nilai)::numeric into v_sedang from konfigurasi where kunci='ambang_sedang_min';
  select (nilai)::numeric into v_berat  from konfigurasi where kunci='ambang_berat_min';
  new.intensitas_persen := round((new.luas_ringan + new.luas_berat) / new.luas_amatan * 100, 2);
  new.tingkat := case
    when new.intensitas_persen > v_berat  then 'berat'
    when new.intensitas_persen >= v_sedang then 'sedang'
    else 'ringan' end;
  return new;
end $$;
create trigger trg_hitung_laporan before insert or update on laporan
  for each row execute function hitung_laporan();

-- Petugas tidak boleh menetapkan status verifikasi
create function public.jaga_status() returns trigger
language plpgsql set search_path = public as $$
begin
  if public.peran_saya() = 'petugas' then
    if new.status in ('terverifikasi','ditolak') then
      raise exception 'Petugas tidak boleh mengubah status verifikasi';
    end if;
    if tg_op = 'UPDATE' and old.status = 'terverifikasi' then
      raise exception 'Laporan terverifikasi tidak dapat diubah petugas';
    end if;
  end if;
  return new;
end $$;
create trigger trg_jaga_status before insert or update on laporan
  for each row execute function jaga_status();
```

Indeks yang disarankan: `laporan (desa_id)`, `laporan (komoditas_id, tahun, triwulan)`, `laporan (status)`, `laporan (tingkat)`, `laporan (dibuat_pada desc)`, `wilayah (parent_id)`, `notifikasi (user_id, dibaca)`.

## 5. Row Level Security (rancangan)

RLS diaktifkan di **semua** tabel (`alter table … enable row level security`). Tanpa kebijakan = tidak ada akses. Otorisasi ditegakkan di sini, bukan di UI.

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | admin: semua; lainnya: dirinya sendiri (operator: pengguna di kabupatennya) | admin (lewat Edge Function) | admin; pengguna biasa hanya kolom tak sensitif miliknya | tidak ada (nonaktifkan lewat `aktif`) |
| `wilayah`, `uptd`, `komoditas`, `opt` | semua pengguna terautentikasi | admin | admin | admin |
| `laporan` | admin: semua; operator: `kabupaten_dari_desa(desa_id) = kabupaten_saya()`; petugas: miliknya + laporan kabupaten kerjanya | petugas: `petugas_id = auth.uid()` dan status `draf`/`menunggu`; operator: di kabupatennya | petugas: miliknya dan status bukan `terverifikasi`; operator: kabupatennya; admin: semua | admin saja |
| `laporan_foto` | mengikuti `laporan` induk | pemilik laporan induk | pemilik laporan induk (selama belum terverifikasi) | pemilik laporan induk (selama belum terverifikasi) |
| `log_ekspor` | admin: semua; lainnya: miliknya | `user_id = auth.uid()` | tidak ada | tidak ada |
| `notifikasi` | `user_id = auth.uid()` | sistem/Edge Function | `user_id = auth.uid()` hanya kolom `dibaca` | `user_id = auth.uid()` |
| `konfigurasi` | semua terautentikasi | admin | admin | admin |

Contoh kebijakan `laporan` (referensi):

```sql
alter table laporan enable row level security;

create policy laporan_baca on laporan for select using (
  public.peran_saya() = 'admin'
  or (public.peran_saya() in ('operator','petugas')
      and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya())
);

create policy laporan_tambah_petugas on laporan for insert with check (
  public.peran_saya() = 'petugas'
  and petugas_id = auth.uid()
  and status in ('draf','menunggu')
);

create policy laporan_ubah_petugas on laporan for update
using (public.peran_saya() = 'petugas' and petugas_id = auth.uid() and status <> 'terverifikasi')
with check (petugas_id = auth.uid() and status in ('draf','menunggu'));

create policy laporan_kelola on laporan for all using (
  public.peran_saya() = 'admin'
  or (public.peran_saya() = 'operator'
      and public.kabupaten_dari_desa(desa_id) = public.kabupaten_saya())
);
```

Aturan tambahan:
- Penyimpanan foto: bucket **privat**, jalur `laporan/{laporan_id}/{urutan}.jpg`; kebijakan Storage mengikuti kebijakan `laporan_foto`. Batasi tipe (PNG/JPG) dan ukuran (≤ 8 MB) di klien **dan** di kebijakan/ketentuan bucket.
- Operasi berhak tinggi (undang pengguna, laporan massal, pengiriman notifikasi) hanya lewat Edge Function atau Cloudflare Worker dengan secret di sisi server. Lihat `SECURITY.md`.
- Pengujian RLS wajib: untuk tiap peran, uji bahwa akses di luar wilayah ditolak.

## 6. Aturan Bisnis di Lapisan Data

| Aturan | Penegak |
|---|---|
| Intensitas = (ringan + berat) ÷ amatan × 100 | Trigger + fungsi `src/lib` (harus menghasilkan nilai sama) |
| Klasifikasi: < 25 ringan; 25–50 sedang; > 50 berat | Trigger memakai `konfigurasi`; mirror di `src/lib/klasifikasi.ts` |
| Triwulan ↔ Semester konsisten | `check` constraint |
| Jumlah luas ≤ luas amatan | `check` constraint |
| Laporan terverifikasi tidak dapat diubah petugas | RLS + trigger `jaga_status` |
| OPT harus sesuai komoditas | Trigger atau FK komposit (keputusan saat Fase 2) |
| Total provinsi = jumlah baris terfilter | Dihitung dari satu sumber; uji konsistensi Dashboard/Peta/Rekap |

## 7. Pemetaan Nama (DB ↔ TypeScript)

Kolom `snake_case` di basis data dipetakan menjadi `camelCase` hanya di `src/services/`. Contoh: `luas_amatan` → `luasAmatan`, `desa_id` → `desaId`, `dibuat_pada` → `dibuatPada`. Komponen UI hanya melihat `camelCase`.

## 8. Data Simulasi Fase 1

- Dibuat di `src/mocks/` dengan struktur yang **sama** dengan tabel di atas.
- Wajib mencakup 7 komoditas, 10 kabupaten/kota, minimal beberapa desa per kabupaten, dan laporan di semua tingkat dan status.
- Koordinat harus di dalam Kaltim.
- Nama petugas dan NIP fiktif; **jangan memakai NIP, nama, atau foto orang sungguhan.** Nama yang muncul di gambar desain adalah contoh.
- Penyimpanan perubahan Fase 1 (laporan baru, draf, log ekspor) boleh di memori/`localStorage`; diberi label simulasi.

## 9. Kontrak Repository (antarmuka yang dipertahankan saat pindah ke Supabase)

Antarmuka, bukan implementasi. Nama final ditetapkan saat Fase 0, tetapi bentuknya harus mempertahankan hal berikut:

```ts
// Rancangan kontrak — hanya tipe, belum ada implementasi
interface LaporanRepository {
  daftar(filter: FilterLaporan, halaman: Halaman): Promise<Hasil<LaporanRingkas[]>>;
  detail(id: string): Promise<Hasil<Laporan>>;
  simpanDraf(input: LaporanInput): Promise<Hasil<Laporan>>;
  publikasikan(input: LaporanInput): Promise<Hasil<Laporan>>;   // status → menunggu
  verifikasi(id: string, keputusan: 'terverifikasi' | 'ditolak', catatan?: string): Promise<Hasil<Laporan>>;
  langganan(filter: FilterLaporan, cb: (e: PerubahanLaporan) => void): () => void; // real-time
}
// Repository lain: Komoditas, Opt, Wilayah, Rekap, LogEkspor, Notifikasi, Pengguna.
```

Aturan kontrak:
- Setiap metode mengembalikan `Hasil<T>` (sukses atau galat berpesan Indonesia), bukan melempar galat mentah ke UI.
- Filter yang sama (`FilterLaporan`: periode, wilayah, komoditas, tingkat, status) dipakai Dashboard, Peta, Rekap, dan Ekspor.
- `langganan` pada Fase 1 disimulasikan (event lokal); pada Fase 2 memakai Supabase Realtime.
- Pembaruan setelah `publikasikan` harus tampil di Dashboard, Peta, dan Rekap tanpa muat ulang halaman.

## 10. Migrasi (Fase 2, rencana)

1. Pengguna menyetujui Fase 2 dan menyediakan proyek Supabase sendiri.
2. Tulis migrasi SQL bernomor dari §4–§5 di folder `supabase/migrations/` (agen tidak menjalankannya ke produksi tanpa izin).
3. Seed wilayah, komoditas, OPT.
4. Implementasikan repository Supabase di `src/services/` dengan kontrak §9; bandingkan dengan repository mock lewat uji kontrak yang sama.
5. Aktifkan Auth, hapus login simulasi.
6. Uji RLS per peran sebelum data nyata dimasukkan.
