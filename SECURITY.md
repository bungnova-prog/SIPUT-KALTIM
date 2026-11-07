# SECURITY.md — SIPUT-KALTIM

Kebijakan keamanan. Sumber: PRD §9.2, §13. Bila bertentangan dengan dokumen lain, **berkas ini yang menang**.

## 1. Prinsip

1. Frontend adalah lingkungan publik: semua yang ada di dalamnya dianggap terbaca siapa pun.
2. Keamanan data ditegakkan di server (Row Level Security), bukan di UI.
3. Rahasia tidak pernah masuk repositori, log, atau percakapan.
4. Fase 1 adalah simulasi; belum boleh dipakai dengan data nyata.

## 2. Klasifikasi Nilai

| Jenis | Contoh | Boleh di frontend/repo? |
|---|---|---|
| **Publik** | `VITE_GOOGLE_MAPS_KEY` (dibatasi), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Boleh di variabel `VITE_` (nilai tidak masuk repo; hanya nama di `.env.example`) |
| **Rahasia** | Supabase `service_role` key, token Cloudflare, token API apa pun, password basis data, kunci pribadi, kunci BSrE | **Tidak pernah** |
| **Data pribadi** | NIP, nama petugas, koordinat dan foto geotag | Hanya sesuai peran; tidak ada di data simulasi yang berasal dari orang sungguhan |

Anon key Supabase bersifat publik **hanya aman bila RLS aktif dan benar**. Tanpa RLS, anon key = akses penuh.

## 3. Aturan Rahasia dan Environment

1. `.env`, `.env.*` (kecuali `.env.example`) masuk `.gitignore` **sebelum** berkas pertama dibuat.
2. `.env.example` hanya memuat nama variabel dan nilai kosong atau contoh jelas palsu:
   ```
   VITE_GOOGLE_MAPS_KEY=
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
3. Hanya variabel berawalan `VITE_` yang terbaca frontend dan hanya untuk nilai publik. Jangan pernah menamai rahasia dengan awalan `VITE_`.
4. Rahasia sisi server (Fase 2) disimpan di pengelola rahasia platform (Supabase Edge Function secrets, Cloudflare Workers secrets / variabel terenkripsi Pages), bukan di berkas.
5. Pasang pemindaian rahasia (mis. `gitleaks`) sebagai pemeriksaan sebelum commit dan di CI.
6. **Bila kunci bocor:** cabut/rotasi segera di penyedia, tinjau penggunaan, bersihkan riwayat git bila perlu, catat di `CHANGELOG.md` (bagian *Keamanan*) tanpa menuliskan nilai kuncinya.

### Aturan khusus untuk agen AI
- Jangan membuka, mencetak, menyalin, atau mengirim isi `.env`.
- Bila pengguna menempelkan kunci di percakapan, jangan menyalinnya ke berkas; arahkan memakai `.env` lokal dan sarankan merotasinya.
- Jangan menaruh kunci contoh yang tampak asli (pola `AIza…`, `eyJ…`, `sbp_…`).
- Jangan menjalankan perintah yang mengunggah repositori atau isi lingkungan ke layanan luar.
- Jangan menambahkan telemetri, analitik, atau skrip pihak ketiga tanpa persetujuan.

## 4. Google Maps

Kunci Google Maps JavaScript API terlihat di peramban, sehingga **wajib dibatasi**:

1. **Pembatasan aplikasi:** *HTTP referrers* ke domain produksi dan pratinjau Cloudflare Pages (mis. `https://<proyek>.pages.dev/*`, domain kustom), plus `localhost` hanya untuk kunci pengembangan terpisah.
2. **Pembatasan API:** hanya *Maps JavaScript API* (tambah API lain hanya bila benar-benar dipakai).
3. **Kuota dan peringatan biaya:** atur kuota harian dan *budget alert* di Google Cloud.
4. Gunakan **kunci terpisah** untuk pengembangan dan produksi.
5. Kunci tanpa pembatasan **tidak boleh** dipakai. Bila kunci belum dibatasi, peta tidak diaktifkan; tampilkan pesan jelas, bukan memakai kunci terbuka.
6. Muat peta secara *lazy*; jangan memuat skrip Maps di halaman yang tidak membutuhkannya.
7. Atribusi Google pada peta tidak boleh disembunyikan.
8. Pemilik produk belum memastikan pilihan "Google OSD"; jika diganti OpenStreetMap/Leaflet (tanpa kunci), bagian ini disesuaikan.

## 5. Supabase (Fase 2)

1. Frontend memakai **anon key** saja. `service_role` **tidak boleh** ada di frontend, repo, `.env.example`, atau log.
2. RLS aktif di semua tabel dan bucket sebelum ada data nyata; rancangannya di `SCHEMA.md` §5.
3. Operasi berhak tinggi (undang pengguna, notifikasi massal, laporan massal) lewat Edge Function/Worker dengan secret di sisi server. Fungsi memeriksa JWT dan peran pemanggil.
4. Fungsi `security definer` wajib `set search_path = public` dan hanya mengembalikan data minimum.
5. Auth: aktifkan kebijakan password kuat, batasi pendaftaran bebas (undangan oleh admin), tinjau kedaluwarsa sesi.
6. Bucket foto **privat**; akses lewat URL bertanda tangan berumur pendek.
7. Uji RLS untuk setiap peran dan wilayah; akses lintas wilayah harus ditolak.
8. Migrasi dijalankan secara sadar oleh pemilik; agen tidak menjalankan migrasi ke basis data produksi.

## 6. Autentikasi dan Peran

- **Fase 1:** peran dipilih lewat tab portal sebagai simulasi. Ini **bukan** kontrol keamanan. Aplikasi tidak boleh dipublikasikan sebagai produksi dengan data nyata.
- **Fase 2:** peran berasal dari `profiles.peran` pengguna yang login. Pembatasan menu di UI hanya kenyamanan; otorisasi sebenarnya di RLS.
- Tombol "Keluar Sistem" harus menghapus sesi dan cache data pribadi di peramban.
- Jangan menyimpan token atau data pribadi di `localStorage` kecuali yang diperlukan (draf laporan tanpa foto sensitif).

## 7. Validasi dan Sanitasi Input

- Validasi di klien dengan skema Zod **dan** ulang di server (CHECK constraint, trigger, RLS) pada Fase 2.
- Jangan menulis HTML dari data pengguna; **dilarang** `dangerouslySetInnerHTML`. Teks catatan dan nama ditampilkan sebagai teks.
- Koordinat harus berada di wilayah Kaltim; angka tidak negatif; jumlah luas ≤ luas amatan.
- **Ekspor Excel:** netralkan sel yang dimulai dengan `=`, `+`, `-`, `@` (injeksi rumus) dengan awalan tanda kutip tunggal atau menulis sebagai teks.
- **Unggah foto:** hanya PNG/JPG; periksa tipe MIME **dan** ekstensi; maksimal 8 MB per berkas dan 3 foto per laporan; kompres di klien; hapus metadata EXIF yang tidak diperlukan kecuali geotag yang sengaja disimpan; jangan pernah menyajikan berkas unggahan dengan tipe yang dapat dieksekusi.
- Hindari `eval`, `new Function`, dan `innerHTML`.

## 8. Header Keamanan (Cloudflare Pages)

`public/_headers` — **titik awal**, wajib diuji bersama Google Maps dan disesuaikan:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(self), camera=(), microphone=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com; connect-src 'self' https://maps.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

Catatan:
- `geolocation=(self)` diperlukan untuk tombol "Ambil Koordinat Otomatis".
- Pada Fase 2 tambahkan domain Supabase ke `connect-src` (dan `img-src` bila foto disajikan darinya) dan **hanya** domain proyek itu.
- Setiap pelonggaran CSP dicatat di `CHANGELOG.md`.
- `public/_redirects` untuk SPA: `/* /index.html 200`.

## 9. Privasi dan Data Pribadi

- NIP dan identitas petugas hanya tampil sesuai peran (mis. Petugas melihat NIP-nya sendiri, bukan NIP seluruh petugas).
- Koordinat dan foto geotag dapat mengungkap lokasi kebun; akses mengikuti wilayah.
- Log ekspor mencatat siapa mengunduh apa, kapan, dan filternya; tidak dapat diubah oleh pengguna biasa.
- Berkas ekspor yang berisi NIP mengikuti peran pengunduh.
- Data simulasi tidak boleh berisi orang, NIP, atau foto sungguhan.
- Jangan menaruh data pribadi di URL, `console.log`, atau pesan galat.

## 10. Rantai Pasok dan Build

- Kunci versi dependensi dengan *lockfile*; jalankan `npm audit` dan tinjau sebelum rilis.
- Hindari paket yang tidak terawat atau memiliki izin berlebihan; tambahan paket dicatat di `CHANGELOG.md`.
- Jangan menjalankan skrip `postinstall` dari paket yang tidak dikenal tanpa meninjau.
- Build produksi tanpa *source map* publik kecuali diperlukan.
- Cloudflare Pages: variabel lingkungan publik di pengaturan proyek; **jangan** memasukkan rahasia sebagai variabel build yang dibenamkan ke bundel.

## 11. Pelabelan dan Dokumen Resmi

- Tampilkan banner "DATA SIMULASI — bukan data resmi" selama Fase 1.
- Berita Acara, barcode, e-Sign BSrE, nomor surat, dan sertifikat pada Fase 1 hanya simulasi dan harus berlabel "Simulasi". **Dilarang** menghasilkan dokumen yang dapat disalahartikan sebagai dokumen resmi tertandatangan.
- Integrasi pengesahan sungguhan memerlukan keputusan dan akses dari instansi penerbit; tidak dikerjakan agen tanpa itu.

## 12. Daftar Periksa Sebelum Rilis / Deploy

- [ ] Tidak ada rahasia di kode, riwayat git, `.env.example`, atau log (hasil pemindaian bersih).
- [ ] `.env` di `.gitignore`.
- [ ] Kunci Google Maps dibatasi referrer dan API, kuota dan peringatan biaya aktif.
- [ ] `_headers` dan `_redirects` ada dan diuji; CSP tidak memblokir peta/foto/ekspor.
- [ ] Tidak ada `dangerouslySetInnerHTML`, `eval`, atau `innerHTML` dari input pengguna.
- [ ] Ekspor Excel menetralkan awalan rumus.
- [ ] Unggah foto dibatasi tipe, ukuran, dan jumlah.
- [ ] Banner "Data Simulasi" tampil (Fase 1).
- [ ] `npm audit` ditinjau.
- [ ] (Fase 2) RLS aktif dan teruji per peran; `service_role` hanya di sisi server; login simulasi dihapus.
- [ ] Log ekspor mencatat setiap unduhan.

## 13. Pelaporan Kerentanan

Temuan keamanan dilaporkan ke pemilik produk (Dinas Perkebunan Provinsi Kalimantan Timur) lewat saluran internal yang ditetapkan pemilik; jangan membuka isu publik yang memuat rincian kerentanan. Pemilik perlu menetapkan kontak resmi sebelum rilis produksi.
