# DEPLOY.md — Deploy SIPUT-KALTIM ke Cloudflare Pages via GitHub

Panduan langkah demi langkah untuk menerbitkan SIPUT-KALTIM sebagai situs statis di **Cloudflare Pages** dengan sumber kode di **GitHub**, ditambah backend **Supabase** dan peta **Google Maps**.

> Status kode saat ini: Fase 2 (autentikasi dan repository Supabase sudah aktif di `src/services/supabaseRepositories.ts`). Selama data yang dipakai masih data uji, tetap tampilkan penanda simulasi dan jangan menyebutnya produksi resmi.
>
> Aturan yang berlaku: `AGENTS.md` §3 (jangan menulis rahasia, jangan commit/push tanpa perintah), `SECURITY.md` §3, §4, §8, §12.

---

## 0. Ringkasan alur

```
GitHub (repo)  --push main-->  Cloudflare Pages (npm run build -> dist)
                                     |
                                     +--> Supabase (Auth, Postgres+RLS, Storage, Edge Function)
                                     +--> Google Maps JavaScript API (kunci dibatasi referrer)
```

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `22` (dipatok oleh `.nvmrc`)
- SPA fallback: `public/_redirects` → `/* /index.html 200`
- Header keamanan: `public/_headers` (CSP, cache aset)
- Pemeriksaan pasca-build: `npm run periksa:deploy`
- CI: `.github/workflows/ci.yml` (typecheck, lint, test, build)

---

## 1. Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| Akun GitHub | Repo boleh privat; Cloudflare Pages dapat membaca repo privat lewat GitHub App. |
| Akun Cloudflare | Menu **Workers & Pages** → **Create application** → **Pages**. |
| Proyek Supabase | Untuk Auth, database, Storage, dan Edge Function. |
| Google Cloud | Hanya bila peta Google Maps nyata dipakai. Kunci **wajib** dibatasi referrer dan API. |
| Node.js 22 + npm | Untuk build lokal. Repo sudah memuat `.nvmrc`. |

Di Windows PowerShell, bila muncul galat `npm.ps1 cannot be loaded`, jalankan `npm.cmd` (mis. `npm.cmd run build`) atau setel `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

## 2. Siapkan backend Supabase (sekali saja)

Bagian ini dilakukan **oleh pemilik proyek**, bukan otomatis oleh Cloudflare. Agen tidak menjalankan migrasi ke basis data.

### 2.1 Terapkan skema, RLS, dan seed

Pilih salah satu cara.

**Cara A — SQL Editor (paling sederhana).** Buka Supabase Dashboard → **SQL Editor**, lalu jalankan berurutan:

1. `supabase/migrations/20261106000100_skema_inti_siput_kaltim.sql`
2. `supabase/migrations/20261106000200_rls_dan_storage.sql`
3. `supabase/migrations/20261106000300_seed_referensi_kaltim.sql`

**Cara B — Supabase CLI.**

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Migrasi ke-2 membuat bucket privat `laporan-foto` beserta kebijakan Storage, dan mengaktifkan Realtime untuk tabel yang dibutuhkan.

### 2.2 Deploy Edge Function undangan

```bash
npx supabase functions deploy undang-pengguna --project-ref <PROJECT_REF>
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` sudah disediakan otomatis oleh runtime Edge Functions. **Jangan** menyalin `SUPABASE_SERVICE_ROLE_KEY` ke variabel Cloudflare Pages.

### 2.3 Atur URL autentikasi

Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `https://<nama-proyek>.pages.dev`
- **Redirect URLs:** tambahkan
  - `https://<nama-proyek>.pages.dev/**`
  - `https://*.<nama-proyek>.pages.dev/**` (untuk preview deployment per branch)
  - domain kustom Anda, mis. `https://siput.kaltimprov.go.id/**`

Tanpa langkah ini, tautan undangan akan mengarah ke `localhost` atau ditolak.

### 2.4 Atur SMTP

Supabase Dashboard → **Authentication** → **SMTP Settings**. Layanan email bawaan Supabase sangat dibatasi dan sering tidak sampai ke email dinas. Gunakan SMTP resmi instansi (mis. Google Workspace dinas) sebelum mengundang pengguna sungguhan.

### 2.5 Buat Admin Provinsi pertama

Aplikasi menutup pendaftaran mandiri. Urutan bootstrap:

1. Supabase Dashboard → **Authentication** → **Users** → **Add user** → isi email dinas dan kata sandi → aktifkan **Auto Confirm User**.
2. Salin **UUID** pengguna tersebut.
3. Jalankan di SQL Editor:

```sql
insert into public.profiles (id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif)
values (
  '<UUID_DARI_AUTH_USERS>',
  'Nama Admin Provinsi',
  null,
  'Kepala Bidang Proteksi Perkebunan',
  'admin',
  null,
  'Provinsi Kalimantan Timur',
  true
);
```

4. Masuk ke aplikasi dengan akun itu. Admin kemudian mengundang Operator/Petugas lewat halaman **Manajemen Pengguna**.

### 2.6 Verifikasi RLS (sebelum data nyata)

Jalankan `supabase/tests/rls_verifikasi.sql` di SQL Editor dan pastikan hasilnya sesuai komentar di berkas. Uji juga login lintas peran: Petugas tidak boleh membaca data wilayah lain, dan `service_role` tidak pernah muncul di frontend.

### 2.7 Catat nilai publik

Dashboard → **Settings** → **API**:

- **Project URL** → menjadi `VITE_SUPABASE_URL`
- **anon public key** → menjadi `VITE_SUPABASE_ANON_KEY`

Keduanya boleh ada di frontend **hanya karena RLS aktif**. `service_role` tetap rahasia server.

---

## 3. Siapkan kunci Google Maps (jika peta nyata dipakai)

1. Google Cloud Console → aktifkan **Maps JavaScript API** saja.
2. Buat **kunci produksi terpisah** dari kunci pengembangan.
3. **Application restrictions → HTTP referrers**, isi hanya:
   - `https://<nama-proyek>.pages.dev/*`
   - `https://*.<nama-proyek>.pages.dev/*` (preview)
   - `https://siput.kaltimprov.go.id/*` (bila ada domain kustom)
4. **API restrictions** → hanya Maps JavaScript API.
5. Atur **kuota harian** dan **budget alert**.
6. Tanpa kunci, aplikasi tetap aman: `PetaOPT` memakai kanvas GIS simulasi.

---

## 4. Unggah kode ke GitHub

Repo ini belum berupa repositori Git. Jalankan dari akar proyek:

```bash
git init -b main
git add .
git status
```

**Periksa `git status`:** `.env` tidak boleh muncul. Berkas yang di-ignore sudah mencakup `.env`, `.env.*` (kecuali `.env.example`), `node_modules/`, dan `dist/`.

```bash
git commit -m "chore: siapkan deploy Cloudflare Pages"
```

Buat repo di GitHub (lewat web atau `gh`), lalu:

```bash
git remote add origin https://github.com/<akun>/<repo>.git
git push -u origin main
```

Jika memakai `gh`:

```bash
gh repo create <repo> --private --source=. --remote=origin --push
```

> Jangan pernah menjalankan `git add -f .env`. Jika `.env` terlanjur ter-commit, rotasi kunci Supabase/Google dan bersihkan riwayat sebelum repo dibagikan.

---

## 5. Buat proyek Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Otorisasi GitHub App Cloudflare, pilih repo, klik **Begin setup**.
3. Isi konfigurasi build:

| Kolom | Nilai |
|---|---|
| Project name | `siput-kaltim` (menentukan `<nama>.pages.dev`; sulit diubah setelah jadi) |
| Production branch | `main` |
| Framework preset | `React (Vite)` — bila tidak ada, pilih **None** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | kosong / `/` |

4. **Environment variables** — tambahkan untuk **Production** *dan* **Preview**:

| Nama | Nilai | Wajib |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<PROJECT_REF>.supabase.co` | Ya |
| `VITE_SUPABASE_ANON_KEY` | anon public key | Ya |
| `VITE_GOOGLE_MAPS_KEY` | kunci Maps terbatas | Hanya bila peta nyata |

**Jangan** menambahkan `SUPABASE_SERVICE_ROLE_KEY`, token Cloudflare, atau kata sandi apa pun sebagai variabel build — semua variabel `VITE_` ikut terbaca di bundel publik.

5. **Save and Deploy**. Build pertama berjalan beberapa menit; pantau log sampai status **Success**.

> Variabel `VITE_` dibekukan saat build. Setelah mengubah nilainya, lakukan **Deployments → Retry deployment** atau push commit baru agar bundel diperbarui.

---

## 6. Wajib: sesuaikan CSP dengan domain Supabase

Build pertama akan tampil, tetapi **login akan gagal** bila langkah ini dilewati karena `connect-src` masih mengizinkan Google Maps saja.

Edit `public/_headers`, ganti baris `Content-Security-Policy` dengan versi yang sudah memuat domain proyek Supabase (ganti `<PROJECT_REF>`):

```text
Content-Security-Policy: default-src 'self'; script-src 'self' https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com https://<PROJECT_REF>.supabase.co; connect-src 'self' https://maps.googleapis.com https://<PROJECT_REF>.supabase.co wss://<PROJECT_REF>.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

- Hanya domain proyek Anda, **jangan** wildcard `*.supabase.co`.
- `wss://` diperlukan untuk Realtime (notifikasi dan pembaruan laporan).
- `img-src` diperlukan untuk foto laporan dari Storage.
- Catat pelonggaran CSP ini di `CHANGELOG.md` bagian **Keamanan**.

Commit dan push; Cloudflare akan membangun ulang otomatis:

```bash
git add public/_headers
git commit -m "fix(deploy): izinkan domain Supabase pada CSP"
git push
```

---

## 7. Verifikasi setelah deploy

Ganti `<nama-proyek>` sesuai proyek Anda.

### 7.1 Header dan SPA

```bash
curl.exe -sI https://<nama-proyek>.pages.dev
curl.exe -sI https://<nama-proyek>.pages.dev/rekapitulasi
```

Yang harus terlihat:

- `content-security-policy` memuat `supabase.co` dan `wss://`
- `x-frame-options: DENY`, `x-content-type-options: nosniff`
- `/rekapitulasi` mengembalikan `200` (bukan `404`) berkat `_redirects`

### 7.2 Aplikasi

- [ ] Halaman masuk tampil tanpa peringatan “Konfigurasi Lingkungan Supabase Belum Terbaca”.
- [ ] Login Admin berhasil; dashboard memuat data.
- [ ] Muat ulang langsung di `/dashboard`, `/peta`, `/rekapitulasi` tidak 404.
- [ ] Console browser tidak memblokir permintaan `supabase.co` (cek tab **Network**/**Console**).
- [ ] Notifikasi berubah tanpa muat ulang (Realtime).
- [ ] Simpan laporan + unggah 3 foto berhasil; foto tampil dari URL bertanda tangan.
- [ ] Ekspor Excel dan PDF terunduh serta tercatat di log ekspor.
- [ ] Peta Google tampil dengan atribusi; tanpa kunci, kanvas simulasi tampil.
- [ ] Lebar 360 px: navigasi drawer, tabel kartu, tombol ≥ 44 px berfungsi.
- [ ] Undang satu pengguna uji; email sampai dan tautannya kembali ke domain Pages.

### 7.3 Pemeriksaan lokal sebelum push

```bash
npm.cmd run build
npm.cmd run periksa:deploy
```

`periksa:deploy` memeriksa `dist/_headers`, `_redirects`, pola terlarang, `.gitignore`, dan kecocokan CSP dengan `VITE_SUPABASE_URL`. Peringatan kuning wajar bila variabel lingkungan belum diisi di terminal lokal.

---

## 8. Alur kerja setelah deploy

- **Setiap push ke `main`** → deployment produksi.
- **Push branch lain / pull request** → preview URL `https://<hash>.<nama-proyek>.pages.dev`; memakai variabel scope **Preview**.
- **Rollback:** Cloudflare Dashboard → proyek → **Deployments** → pilih deployment sukses sebelumnya → **Rollback**.
- **Domain kustom:** Pages → **Custom domains** → tambahkan domain, ikuti instruksi DNS. Lalu perbarui:
  - HTTP referrer kunci Google Maps,
  - Site URL dan Redirect URLs Supabase.
- **Preview berbagi database yang sama** dengan produksi. Untuk uji yang berisiko mengubah data, buat proyek Supabase staging terpisah dan isi variabel Preview dengan proyek staging.
- **Jangan** mengedit langsung di dashboard Cloudflare untuk hal yang ada di repo; repo adalah sumber kebenaran.

### Alternatif deploy manual (opsional)

```bash
npm run build
npx wrangler pages deploy dist --project-name=siput-kaltim
```

Gunakan hanya untuk hotfix darurat. Alur utama tetap GitHub → Pages agar riwayat build dapat diaudit.

---

## 9. Perkiraan biaya dan kuota

- **Cloudflare Pages (Free):** 500 build per bulan, permintaan dan bandwidth statis tidak dibatasi; cocok untuk aplikasi ini. Cek ulang angka di dashboard karena kebijakan dapat berubah.
- **Supabase (Free):** proyek dapat dijeda setelah lama tidak aktif; untuk operasional jangka panjang pertimbangkan paket berbayar.
- **Google Maps:** ditagih per pemuatan peta. Wajib kuota harian + budget alert.
- Tidak ada server aplikasi; seluruh frontend statis.

---

## 10. Pemecahan masalah

| Gejala | Penyebab umum | Tindakan |
|---|---|---|
| Build gagal `npm ci` | `package-lock.json` tidak sinkron | Jalankan `npm install`, commit lockfile, push ulang. |
| Build gagal karena versi Node | Build image memakai versi lain | Pastikan `.nvmrc` berisi `22`, atau set `NODE_VERSION=22`. |
| Halaman 404 saat refresh | `_redirects` tidak tersalin | Pastikan `public/_redirects` ada dan build menyalinnya ke `dist`. |
| Layar kosong / CSP error di console | Domain Supabase belum ada di CSP | Selesaikan §6, push ulang. |
| Login: “Konfigurasi Lingkungan Supabase Belum Terbaca” | Variabel tidak diisi pada scope yang dipakai | Isi Production dan Preview, lalu retry deployment. |
| Login: `Failed to fetch` | CSP `connect-src` salah atau URL proyek salah | Cocokkan `VITE_SUPABASE_URL` dengan CSP. |
| Undangan tidak sampai | SMTP bawaan/ Site URL salah | Atur SMTP resmi dan URL autentikasi (§2.3–2.4). |
| Peta: `RefererNotAllowedMapError` | Referrer kunci tidak memuat domain Pages | Tambahkan `https://<nama-proyek>.pages.dev/*` dan domain kustom. |
| Peta kosong tanpa error | Maps JavaScript API belum aktif / billing mati | Aktifkan API dan penagihan di Google Cloud. |
| Foto gagal diunggah | Bucket/policy belum dibuat atau CSP `img-src` kurang | Pastikan migrasi ke-2 dijalankan dan CSP memuat domain Supabase. |
| `npm` diblokir PowerShell | Kebijakan eksekusi skrip | Pakai `npm.cmd` atau `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |
| Supabase tidak merespons | Proyek free dijeda | Pulihkan proyek di dashboard Supabase. |

---

## 11. Daftar periksa rilis (ringkasan `SECURITY.md` §12)

- [ ] Tidak ada rahasia di repo, riwayat Git, `.env.example`, atau log.
- [ ] `.env` di-ignore dan tidak pernah di-commit.
- [ ] Kunci Google Maps dibatasi referrer + API; kuota dan budget alert aktif.
- [ ] `_headers` dan `_redirects` terverifikasi di domain produksi.
- [ ] CSP hanya mengizinkan domain Supabase proyek ini.
- [ ] RLS aktif dan diuji per peran; `service_role` hanya di sisi server.
- [ ] Unggah foto dibatasi tipe, ukuran, dan jumlah; bucket privat.
- [ ] Ekspor Excel menetralkan awalan rumus.
- [ ] Log ekspor mencatat setiap unduhan.
- [ ] Teks “Data Simulasi”/penanda non-produksi masih sesuai status data.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` lolos.
- [ ] `npm run periksa:deploy` tanpa masalah.

---

## 12. Berkas terkait

| Berkas | Fungsi |
|---|---|
| `public/_headers` | Header keamanan + cache aset Cloudflare Pages |
| `public/_redirects` | Fallback SPA agar rute React Router tidak 404 |
| `.nvmrc` | Mematok Node.js 22 pada build Cloudflare Pages |
| `scripts/periksa-deploy.mjs` | Pemeriksaan kesiapan deploy pasca-build |
| `.github/workflows/ci.yml` | CI GitHub: typecheck, lint, test, build |
| `supabase/migrations/` | Skema, RLS, Storage, seed (dijalankan pemilik) |
| `supabase/functions/undang-pengguna/` | Edge Function undangan akun |
| `SECURITY.md` §8 | Sumber kebijakan header dan CSP |
