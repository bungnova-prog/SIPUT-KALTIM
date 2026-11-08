# CHANGELOG — SIPUT-KALTIM

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan [Semantic Versioning](https://semver.org/lang/id/). Seluruh catatan dalam Bahasa Indonesia. Tanggal dalam zona WITA.

## Aturan untuk Agen

1. **Setiap perubahan bermakna** (fitur, perbaikan, dependensi, konfigurasi, keamanan, keputusan) dicatat di bagian `[Belum Dirilis]` pada sesi yang sama dengan perubahannya.
2. Gunakan kategori: **Ditambahkan**, **Diubah**, **Diperbaiki**, **Dihapus**, **Keamanan**, **Catatan** (asumsi dan pertentangan dokumen).
3. Satu baris per perubahan, dimulai dengan kata kerja, merujuk ID PRD bila ada (mis. `DSH-03`, `GIS-02`, `REK-04`).
4. Catat asumsi saat memakai nilai bawaan untuk Pertanyaan Terbuka PRD §14.
5. Catat dependensi baru beserta alasannya, dan setiap pelonggaran CSP.
6. **Jangan menulis nilai rahasia** (kunci, token, password) di sini. Untuk kebocoran kunci, tulis kejadian dan tindakan, bukan nilainya.
7. Versi aplikasi: `0.x.y` selama Fase 0–1; `1.0.0` saat produksi dengan autentikasi sungguhan (Fase 2 selesai). Versi sidebar diambil dari `package.json`.
8. Jangan menulis ulang entri lama; koreksi dengan entri baru.
9. Bila beberapa agen bekerja, tambahkan entri secara berurutan agar tidak terjadi konflik penggabungan.

## [Belum Dirilis]

### Ditambahkan
- Menyediakan master data lengkap Kampung/Desa/Kelurahan se-Kalimantan Timur pada `supabase/LENGKAPI_SEMUA_KAMPUNG_DESA_KALTIM.sql` dengan kueri garansi sistem agar setiap kecamatan dipastikan memiliki minimal 1 pilihan Kampung/Desa resmi.
- Menambahkan integrasi terminologi lokal "Kampung / Desa / Kelurahan" (khas Kutai Barat, Berau, Mahakam Ulu) pada Formulir Input Laporan (`src/pages/HalamanInputLaporan.tsx`), dilengkapi kotak peringatan ramah dan tombol cepat "Tambah Sekarang" jika pilihan belum terisi.
- Menyediakan master data 105 Kecamatan resmi seluruh 10 Kabupaten/Kota Kalimantan Timur beserta ratusan desa/kelurahan sentra komoditas perkebunan dalam skrip database `supabase/SEMPURNAKAN_WILAYAH_KECAMATAN_DESA.sql`.
- Menambahkan tombol interaktif `+ Tambah Baru` pada pilihan Kecamatan dan Desa/Kelurahan di Formulir Input Laporan (`src/pages/HalamanInputLaporan.tsx`), dilengkapi modal pendaftaran mandiri dengan validasi form dan notifikasi toast sukses.
- Menambahkan metode `tambahDesa` dan `tambahKecamatan` pada `WilayahRepository` (`src/services/kontrak.ts`, `src/services/mockRepositories.ts`, dan `src/services/supabaseRepositories.ts`) dengan dukungan pemanggilan RPC `admin_tambah_desa` / `admin_tambah_kecamatan` dan fallback direct insert.
- Menambahkan fungsi database berkeamanan tinggi (`security definer`) `public.admin_tambah_desa` dan `public.admin_tambah_kecamatan` serta izin kebijakan RLS `wilayah_tambah` dan `wilayah_baca` untuk pengguna terautentikasi.

### Diperbaiki
- Memperbaiki ketiadaan opsi Kecamatan dan Desa/Kelurahan pada form pelaporan OPT ketika pengguna memilih Kabupaten/Kota tertentu akibat belum terisinya data relasional bertingkat pada basis data Supabase.
- Menambahkan menu dan modal konfirmasi Hapus Akun Pengguna pada Manajemen Pengguna (`src/pages/HalamanPengguna.tsx`) khusus peran Admin Provinsi dengan perlindungan audit (mencegah penghapusan akun pemilik laporan OPT).
- Menambahkan komponen `ModalUbahKataSandi` (`src/components/ModalUbahKataSandi.tsx`) untuk penggantian kata sandi mandiri oleh setiap pengguna terautentikasi (petugas/operator/admin), dapat diakses melalui header profil, sidebar, drawer navigasi ponsel, dan baris sesi pengguna.
- Menambahkan skrip SQL kebijakan penghapusan dan penambahan baris `public.profiles` (`supabase/TAMBAH_KEBIJAKAN_HAPUS_PROFIL.sql` dan pembaruan `SIAP_PAKAI_SETUP_DATABASE.sql`).
- Menambahkan metode `ubahKataSandi` pada `authService` dan `hapus` pada `penggunaRepository`.
- Menambahkan aset resmi logo Pemerintah Provinsi Kalimantan Timur (*Ruhui Rahayu*) (`src/assets/logo-kaltim.png`, `public/logo-kaltim.png`, dan `public/logo-simulasi.svg`) dengan hashing aset Vite pada header tata letak utama, drawer navigasi ponsel, dan halaman masuk.
- Menambahkan input kata sandi akun petugas pada form Manajemen Pengguna (`src/pages/HalamanPengguna.tsx`) sehingga Admin dapat langsung menentukan kata sandi petugas saat mendaftar.
- Menambahkan `DEPLOY.md`: panduan lengkap deploy Cloudflare Pages via GitHub (persiapan repo, konfigurasi build `dist`, variabel lingkungan Production/Preview, CSP Supabase, Google Maps, bootstrap Admin pertama, verifikasi pasca-deploy, rollback, domain kustom, biaya, dan pemecahan masalah).
- Menambahkan `.nvmrc` berisi Node.js `22` agar build Cloudflare Pages memakai versi runtime yang konsisten dengan `vite@6`.
- Menambahkan `scripts/periksa-deploy.mjs` dan skrip `npm run periksa:deploy` untuk memeriksa `dist/_headers`, `dist/_redirects`, pola terlarang (`dangerouslySetInnerHTML`/`eval`), `.gitignore`, dan kecocokan CSP dengan `VITE_SUPABASE_URL` sebelum rilis.
- Menambahkan alur CI GitHub `.github/workflows/ci.yml` yang menjalankan `typecheck`, `lint`, `test`, `build`, dan `periksa:deploy` pada push/PR ke `main`.
- Menambahkan aturan cache aset ber-hash (`/assets/*` immutable) dan revalidasi `index.html` pada `public/_headers`.
- Mengimplementasikan Fase 2 penuh integrasi Supabase (`src/services/klienSupabase.ts`, `src/services/supabaseRepositories.ts`, `src/lib/agregasiRekap.ts`, `src/lib/drafLokal.ts`): autentikasi sesi `authService`, repository PostgreSQL terpetakan `snake_case` → `camelCase` untuk 8 kontrak layanan, unggah foto dokumentasi ke bucket privat `laporan-foto` dengan URL bertanda tangan berumur pendek, serta langganan Supabase Realtime pada tabel `laporan`, `notifikasi`, `log_ekspor`, `opt`, dan `profiles`.
- Menambahkan halaman autentikasi resmi (`src/pages/HalamanMasuk.tsx`) dan gerbang proteksi rute (`GerbangTerautentikasi` & `GerbangTamu` di `src/App.tsx`).
- Menambahkan berkas migrasi SQL bernomor dan seed referensi Kalimantan Timur di `supabase/migrations/` (`20261106000100_skema_inti_siput_kaltim.sql`, `20261106000200_rls_dan_storage.sql`, `20261106000300_seed_referensi_kaltim.sql`), Edge Function undangan akun `supabase/functions/undang-pengguna/index.ts`, skrip verifikasi RLS lintas peran `supabase/tests/rls_verifikasi.sql`, serta uji unit `src/services/__tests__/supabaseRepositories.test.ts`.
- Menambahkan dependensi `@supabase/supabase-js` untuk koneksi resmi klien autentikasi, basis data PostgREST, Realtime, Edge Functions, dan Storage pada Fase 2 (`AGENTS.md` §4).
- Mengimplementasikan Fase 1e penuh pada Data Komoditas & OPT (`src/pages/HalamanKomoditasOpt.tsx`): ubin filter interaktif 7 komoditas baku terpisah lengkap dengan metrik luas terdampak real-time, pencarian & filter kategori OPT (`hama`/`penyakit`/`gulma`), kartu katalog berpaginasi dengan nama ilmiah miring (`<em>`) serta pedoman gejala & rekomendasi PHT, dan formulir Admin `Tambah OPT Simulasi` ke repository terpusat.
- Mengimplementasikan Fase 1e penuh pada Manajemen Pengguna & Konfigurasi Sistem (`src/pages/HalamanPengguna.tsx`): daftar profil simulasi berpaginasi dengan kartu responsif ponsel `360px` & tabel desktop, pergantian sesi profil simulasi (`pilihProfilSimulasi`), formulir Admin `Tambah Pengguna Simulasi`, pengaktifan/penonaktifan akun simulasi, serta panel Admin untuk mengonfigurasi terpusat `Ambang Tingkat Serangan GIS` terpisah dari `Ambang Peringatan Dini Formulir` (`konfigurasiRepository.perbarui`).
- Mengimplementasikan Fase 1d penuh pada Rekapitulasi Triwulan & Semester (`src/pages/HalamanRekapitulasi.tsx`) dan Pusat Ekspor Laporan (`src/pages/HalamanEkspor.tsx`): banner hero hijau tua dengan kartu `Sinkronisasi Data UPTD`, panel parameter 3 skala periode (`Triwulan`, `Semester`, `Tahunan Penuh`), 4 kartu KPI dengan persen perubahan antarperiode, matriks Kabupaten/Kota berpaginasi dengan header kolom kuning/merah muda dan baris akhir biru muda `Total Konsolidasi Provinsi` (`src/components/rekap/TabelMatriksKabupaten.tsx`), 2 grafik Recharts fluktuasi triwulanan & proporsi berat vs ringan dengan tabel aksesibilitas (`src/components/rekap/GrafikRekapitulasi.tsx`), serta lembar pratinjau `Standar Berita Acara` berlabel `Simulasi` dan `Log Ekspor & Riwayat Unduhan` lengkap dengan fitur unduh ulang (`src/components/rekap/PanelBeritaAcaraDanLog.tsx`).
- Menambahkan logika kalkulasi konsolidasi matriks, proporsi komoditas, periode pembanding, dan unduh ulang log (`src/lib/analitikRekap.ts`) beserta uji unit `src/lib/__tests__/analitikRekap.test.ts`.
- Mengimplementasikan Fase 1c penuh pada Peta Sebaran & GIS OPT (`src/pages/HalamanPeta.tsx`): kepala `WGS84 EPSG:4326` dengan 3 lencana metrik real-time (titik kritis, titik waspada, total Ha terdampak), panel kiri `Filter Spasial & Komoditas` 4 langkah + kartu UPTD pengamat aktif (`src/components/peta/PanelFilterSpasial.tsx`), komponen pembungkus tunggal `<PetaOPT>` (`src/components/peta/PetaOPT.tsx`) dengan pemilih 3 lapisan dasar (`Citra Satelit`, `Peta Tematik`, `Kontur Topografi`), pengelompokan penanda (*clustering*), simbol berbeda per tingkat keparahan, popup geotagging 2×2 + modal Berita Acara simulasi, legenda tematik dengan ruang aman atribusi Google, serta tabel `Rekapitulasi Wilayah Paling Rentan OPT` beserta ekspor Geodata Excel & Peta Spasial PDF (`src/components/peta/TabelKerentananWilayah.tsx`).
- Menambahkan logika pengelompokan klaster spasial, proyeksi kanvas GIS Kaltim, dan ringkasan UPTD (`src/lib/petaGis.ts`), pemuat *lazy* Google Maps JavaScript API tanpa dependensi tambahan (`src/lib/pemuatGoogleMaps.ts`), serta uji unit `src/lib/__tests__/petaGis.test.ts`.
- Mengimplementasikan Fase 1b penuh pada Formulir Input Laporan 5 Bagian (`src/pages/HalamanInputLaporan.tsx`): kepala formulir `FORM-POPT-04` dengan jam real-time WITA dan 4 kartu identitas petugas sesuai privasi NIP peran, Bagian I (Periode TW/Semester/Tahun sistem WITA), Bagian II (lokasi bertingkat Kabupaten/Kecamatan/Desa, pengambilan koordinat GPS/simulasi otomatis, dan peta pratinjau pin interaktif `src/components/formulir/PetaPratinjauPin.tsx`), Bagian III (7 ubin komoditas baku terpisah, pilihan OPT Katalog Khusus Kaltim, tombol fase `TBM`/`TM`/`TTM-TR`), Bagian IV (kalkulasi intensitas real-time, kartu cincin persen & pemisahan ambang GIS vs peringatan form di `src/components/formulir/KartuCincinIntensitas.tsx`), serta Bagian V (3 slot foto geotagging dengan kompresi klien + 3 rekomendasi pengendalian di `src/components/formulir/BagianDokumentasiFoto.tsx`).
- Menambahkan panel kanan menempel/lipat ponsel `Ringkasan Validasi (Live Preview)`, kotak `Klasifikasi Bahaya OPT Kaltim`, kartu laboratorium simulasi, dan panduan POPT (`src/components/formulir/PanelPratinjauLaporan.tsx`).
- Menambahkan skema validasi Zod formulir laporan, pemetaan balik koordinat peta pratinjau, label kondisi kebun, dan kompresi foto `<canvas>` (`src/lib/skemaFormLaporan.ts`) beserta uji unit `src/lib/__tests__/skemaFormLaporan.test.ts` dan helper `buatContohFotoSimulasi` di `src/services/mockRepositories.ts`.
- Mengimplementasikan Fase 1a penuh pada Dashboard Eksekutif (`src/pages/HalamanDashboard.tsx`): filter Semester/Triwulan/Wilayah, ekspor cepat Excel & PDF, 5 kartu KPI lengkap, 2 grafik Recharts (`src/components/dashboard/GrafikDashboard.tsx`) dengan tabel aksesibilitas & dukungan `prefers-reduced-motion`, peta mini sebaran WGS84 + indeks kerentanan + 3 kartu peringatan/disposisi (`src/components/dashboard/PetaMiniDanPeringatan.tsx`), serta tabel observasi real-time berpaginasi dengan kartu responsif ponsel, modal detail, dan verifikasi/penolakan cepat (`src/components/dashboard/TabelObservasiRealtime.tsx`).
- Menambahkan helper analitik & paginasi Dashboard (`src/lib/analitikDashboard.ts`), komponen lencana tingkat serangan & status verifikasi berikon (`src/components/LencanaStatus.tsx`), serta uji unit `src/lib/__tests__/analitikDashboard.test.ts`.
- Menambahkan komponen status data terstandar (`KerangkaMuat`, `KotakGalatData` dengan tombol coba lagi, `KotakDataKosong`) di `src/components/StatusMuatData.tsx`.
- Menambahkan pusat notifikasi lonceng interaktif, kartu profil pengguna aktif di header, pemilih portal peran untuk layar `< 1280px` (`360px` responsif), dan footer status koneksi simulasi di `src/components/TataLetakUtama.tsx`.
- Menambahkan `eksporService` di `src/services/mockRepositories.ts` agar setiap unduhan `.xlsx`/`.pdf` otomatis tercatat ke `logEksporRepository`.
- Lapisan domain (`src/lib`), tipe (`src/types`), mock simulasi (`src/mocks`), dan repository terpusat (`src/services`) untuk Fase 1.
- Kerangka aplikasi Fase 0: `src/main.tsx`, `src/App.tsx`, layout utama, routing, dan 7 halaman placeholder (Dashboard, Peta, Input Laporan, Komoditas & OPT, Rekapitulasi, Ekspor, Pengguna) dengan banner "DATA SIMULASI".
- Utilitas ekspor Excel/PDF simulasi berlabel bukan dokumen resmi, netralisasi rumus Excel, dan log ekspor simulasi.
- Uji unit aturan domain dan uji repository simulasi (`vitest`, lingkungan `node`).
- Helper transisi status laporan (`src/lib/alurLaporan.ts`) dan perhitungan bulan WITA (`src/lib/waktuWita.ts`).

### Diubah
- Mengizinkan peran Operator untuk memilih wilayah "Provinsi Kalimantan Timur (Lintas Wilayah)" pada formulir pendaftaran pengguna, memperbarui validasi backend agar hanya Petugas Lapangan yang wajib terikat pada satu Kabupaten/Kota, serta menyesuaikan batasan database `chk_wilayah_peran` dan kebijakan RLS agar Operator Lintas Wilayah dapat membaca dan memverifikasi laporan di seluruh wilayah Kaltim.
- Mengubah kata sandi awal bawaan pendaftaran petugas menjadi `Perlindungan.1!` (pada formulir pendaftaran Admin dan fallback layanan backend) serta menyediakan alur perubahan kata sandi secara mandiri oleh setiap petugas/operator.
- Mengubah kepanjangan nama SIPUT menjadi **Sistem Informasi Pelaporan OPT** di seluruh halaman antarmuka (`HalamanMasuk`, `TataLetakUtama`), judul dokumen HTML (`index.html`), deskripsi `package.json`, dan lembar ekspor laporan (`src/lib/ekspor.ts`).
- Mengubah alur pendaftaran pengguna baru di `src/services/supabaseRepositories.ts` dan `src/pages/HalamanPengguna.tsx`: Admin dapat langsung mendaftarkan dan menyimpan akun petugas/operator beserta kata sandinya ke Supabase Auth dan tabel `profiles` tanpa memerlukan Edge Function atau tautan undangan email.
- Menaikkan versi aplikasi di `package.json` menjadi `1.0.0` dan mengalihkan `src/services/index.ts` ke `supabaseRepositories` atas persetujuan tertulis pengguna untuk memulai Fase 2 penuh (termasuk persetujuan tabel `[USUL]`: `uptd`, `laporan_riwayat`, `konfigurasi`, serta kolom `catatan_verifikasi` dan `diverifikasi_pada`).
- Memperbarui `src/pages/HalamanPengguna.tsx` agar undangan akun baru dikirim melalui Edge Function `undang-pengguna` dengan alamat email dinas.
- Menaikkan versi aplikasi di `package.json` menjadi `0.6.0` untuk menandai penyelesaian sub-fase Fase 1e (penyempurnaan layar pendukung, responsif ponsel `360px`, QA keamanan & aksesibilitas, dan kesiapan statis Cloudflare Pages).
- Menyeragamkan target sentuh minimum `44×44 px` dan dukungan tombol `Escape` untuk penutupan laci navigasi, panel notifikasi, serta dialog modal pada `src/components/TataLetakUtama.tsx`, `src/pages/HalamanDashboard.tsx`, `src/components/dashboard/GrafikDashboard.tsx`, `src/components/dashboard/PetaMiniDanPeringatan.tsx`, `src/components/dashboard/TabelObservasiRealtime.tsx`, `src/components/peta/TabelKerentananWilayah.tsx`, dan `src/pages/HalamanPengguna.tsx`.
- Menaikkan versi aplikasi di `package.json` menjadi `0.5.0` untuk menandai penyelesaian sub-fase Fase 1d (Rekapitulasi Triwulan/Semester, ekspor Excel/PDF, log ekspor).
- Menaikkan versi aplikasi di `package.json` menjadi `0.4.0` untuk menandai penyelesaian sub-fase Fase 1c (Peta Sebaran & GIS OPT, filter spasial, rekap kerentanan wilayah).
- Menaikkan versi aplikasi di `package.json` menjadi `0.3.0` untuk menandai penyelesaian sub-fase Fase 1b (Formulir 5 bagian, validasi domain, draf lokal otomatis).
- Menaikkan versi aplikasi di `package.json` menjadi `0.2.0` untuk menandai penyelesaian sub-fase Fase 1a (Dashboard, grafik, notifikasi).
- Menerapkan *code splitting* per halaman dengan `React.lazy` dan `Suspense` di `src/App.tsx` sesuai aturan kinerja Fase 0.
- Memperbarui tab portal desktop menjadi *segmented control* dengan indikator aktif, target sentuh minimum `44px`, dan pembatasan kenyamanan menu sesuai peran di `src/components/TataLetakUtama.tsx`.
- Status proyek di `AGENTS.md` diperbarui agar mencerminkan kode Fase 0/1 parsial yang sudah ada; produksi/data nyata tetap belum diizinkan.
- Versi `package.json` disesuaikan ke `0.1.0` untuk menandai kerangka Fase 0 (bukan rilis produksi).

### Diperbaiki
- Memperbaiki `beritahuLaporan` di `src/services/mockRepositories.ts` agar penolakan laporan (`ditolak`) atau perubahan keluar filter tetap memicu pembaruan pelanggan UI.
- Memperbaiki fallback `komoditasUtama` menjadi `'-'` saat filter menghasilkan `0` laporan, pemanggilan ganda `bersihkanSesiSimulasi()`, auto-close toast keluar sistem, pemulihan seed `dbLogEkspor`, serta tombol `Coba lagi` dan posisi ponsel pada Toast.
- Menghapus pemotongan `.slice(0, 12)` pada `HalamanKomoditasOpt.tsx`, melengkapi langganan reaktif serta penanganan galat `!hasil.ok` di `HalamanDashboard.tsx`, `HalamanRekapitulasi.tsx`, `HalamanKomoditasOpt.tsx`, dan `HalamanPengguna.tsx`.
- Transisi status laporan: mencegah `simpanDraf`/`publikasikan` mengubah laporan terverifikasi tanpa alur khusus; verifikasi hanya dari status valid; perubahan terverifikasi->ditolak wajib catatan.
- Validasi repository: konfigurasi ambang menolak `NaN`/nilai terbalik; tambah OPT menolak komoditas tidak valid; tambah pengguna simulasi memvalidasi wilayah non-admin dan membuat NIP simulasi unik saat duplikat.
- Rekap: tren bulanan memakai bulan WITA dan tidak menandai "Aktif" saat data tahun kosong; metrik `laporanDitolak` menghormati `statusList` eksplisit.
- Langganan laporan menerapkan filter; draft lokal browser divalidasi saat dimuat; `bersihkanSesiSimulasi` mereset log ekspor simulasi.
- Kode laporan simulasi memakai singkatan kabupaten/kota yang tidak ambigu dan urut berbasis awalan kode.

### Dihapus
- Menghapus pemilih portal peran simulasi di header (`TataLetakUtama.tsx`), tombol penyamaran profil simulasi (`HalamanPengguna.tsx`), tombol pembangkit foto SVG simulasi (`BagianDokumentasiFoto.tsx` & `HalamanInputLaporan.tsx`), serta ketergantungan bundel produksi terhadap `src/mocks/` sesuai daftar periksa Fase 2 (`SECURITY.md` §6 & §12).

### Keamanan
- Menyesuaikan Content-Security-Policy (CSP) di `public/_headers` dengan domain proyek Supabase pengguna (`https://nrhrbvnzcrnlajzrpcgb.supabase.co` dan `wss://nrhrbvnzcrnlajzrpcgb.supabase.co`) pada `img-src` dan `connect-src` (`SECURITY.md` §8).
- Menyiapkan baris CSP siap-tempel pada `public/_headers` untuk domain Supabase spesifik proyek (https dan wss, tanpa wildcard) serta menegaskan bahwa login akan diblokir bila langkah ini dilewati.
- Menerapkan kebijakan Row Level Security (RLS) pada seluruh 11 tabel domain & bucket privat `laporan-foto`, fungsi `security definer` dengan `set search_path = public`, pemisahan `SUPABASE_SERVICE_ROLE_KEY` khusus di Edge Function `undang-pengguna`, pembersihan sesi & cache pada `keluarSistem()`, serta petunjuk penyesuaian domain spesifik proyek Supabase pada CSP `public/_headers` (`SECURITY.md` §5 & §8).
- Menyelesaikan audit QA statis Fase 1e (`SECURITY.md` §12): memastikan nol impor `mocks/` di komponen UI, nol warna heksadesimal mentah di `.tsx`, nol pemakaian `dangerouslySetInnerHTML`/`eval`, `sourcemap: false` pada `vite.config.ts`, serta penyalinan berkas keamanan `dist/_headers` (CSP ketat) dan `dist/_redirects` untuk kesiapan deploy Cloudflare Pages.
- Menjaga pemuatan Google Maps JavaScript API (`src/lib/pemuatGoogleMaps.ts`) hanya aktif secara *lazy* pada `<PetaOPT>` setelah konfirmasi kunci terbatas pada `.env` lokal dan mempertahankan kanvas GIS simulasi aman saat `VITE_GOOGLE_MAPS_KEY` kosong (`SECURITY.md` §4).
- Menambahkan kompresi ulang citra unggahan melalui `<canvas>` di sisi klien (`kompresFotoKlien`) untuk membersihkan metadata EXIF pribadi secara otomatis serta menjaga berkas foto tetap di memori sesi (tidak pernah disimpan ke draf `localStorage`).
- Menegakkan validasi kepemilikan `petugas_id === peminta.id` pada `simpanDraf` dan `publikasikan`, serta penyamaran NIP dan pembatasan daftar profil berdasarkan `peminta` langsung di tingkat repository (`src/services/mockRepositories.ts`).
- Memperketat `netralkanSelExcel` terhadap awalan rumus dengan spasi/baris baru di awal, menambahkan escaping XML pada `buatFotoSvgSimulasi`, batas kedaluwarsa 24 jam pada draf `localStorage`, serta pagar penggunaan hanya-tulis untuk paket `xlsx`.
- Helper draf lokal/laporan aman dijalankan tanpa `window` (uji Node) dan tidak menyimpan foto sensitif di draf browser.

### Catatan
- Deploy Cloudflare Pages wajib mengganti `<PROJECT_REF>` pada baris CSP `public/_headers` sebelum login Supabase dapat berfungsi; prosedur dan verifikasinya ada di `DEPLOY.md` §6–§7.
- PRD (`PRD-SIPUT-KALTIM.md`) belum ada di repositori; detail perilaku fungsional PRD belum dapat diverifikasi penuh.
- `design-references/*.png` tidak ditemukan; tampilan belum dibandingkan dengan aset referensi gambar.
- Belum ada proyek Supabase. Proyek tidak boleh dibuat sebelum pengguna memerintahkan Fase 2 secara eksplisit.
- Nilai bawaan yang berlaku sampai ada keputusan pemilik (lihat `AGENTS.md` §11): ambang klasifikasi 25/50 sebagai konfigurasi; ambang peringatan form 15/30 sebagai konfigurasi terpisah; tujuh komoditas terpisah; peta memakai Google Maps; pengesahan dokumen hanya simulasi; laporan langsung tampil berstatus "Menunggu Validasi".
- Berkas logo resmi Pemprov Kaltim belum tersedia; placeholder simulasi dipakai di `public/logo-simulasi.svg`.

## [0.0.1] — 2026-11-05 (dokumen)

Rilis dokumen saja; bukan rilis aplikasi.

### Ditambahkan
- `PRD-SIPUT-KALTIM.md` v1.0 (Draft) sebagai sumber kebutuhan.
- `AGENTS.md`: aturan kerja agen untuk Antigravity Desktop dan OpenCode Desktop (larangan keras, urutan fase, konvensi, aturan domain, nilai bawaan pertanyaan terbuka).
- `DESIGN.md`: token visual, layout global, rincian empat layar, komponen, format Indonesia, aksesibilitas, dan daftar ketidakkonsistenan gambar desain.
- `SCHEMA.md`: model data (tabel PRD §7), enum, rancangan SQL, rancangan RLS, kontrak repository, rencana migrasi; seluruhnya berstatus rancangan.
- `SECURITY.md`: kebijakan rahasia, pembatasan kunci Google Maps, aturan Supabase Fase 2, validasi input, `_headers` Cloudflare Pages, daftar periksa rilis.
- `CHANGELOG.md` ini.

### Catatan
- Usulan di luar PRD (perlu persetujuan pemilik): tabel `uptd`, `laporan_riwayat`, `konfigurasi`; kolom `catatan_verifikasi` dan `diverifikasi_pada` pada `laporan`. Alasan: PRD menyebut `wilayah.uptd_id`, catatan perubahan laporan terverifikasi, dan ambang yang dapat dikonfigurasi, tetapi belum mendefinisikan tabelnya.
- Ketidakkonsistenan pada gambar desain didokumentasikan di `DESIGN.md` §7 (tahun 2024/2025 vs tanggal sistem 2026, jumlah kab/kota, penggabungan komoditas, label ambang, label "Resmi" pada Berita Acara, versi "v2.4.0").
- Tiga layar tidak punya gambar desain (Data Komoditas & OPT, Ekspor Laporan, Manajemen Pengguna); dibangun mengikuti komponen yang ada.
- Kotak batas koordinat Kaltim pada `AGENTS.md` §8 bersifat kasar dan sementara.

## Rencana Rilis (dari PRD §12)

| Versi | Isi |
|---|---|
| 0.1.0 | Fase 0 — setup, token, layout, routing, data simulasi |
| 0.2.0 | Fase 1a — Dashboard, grafik, notifikasi |
| 0.3.0 | Fase 1b — formulir, validasi, draf lokal |
| 0.4.0 | Fase 1c — peta Google, filter spasial, rekap wilayah |
| 0.5.0 | Fase 1d — rekap TW/Semester, ekspor Excel/PDF, log |
| 0.6.0 | Fase 1e — responsif ponsel, QA, deploy Cloudflare Pages |
| 1.0.0 | Fase 2 — Supabase, autentikasi, RLS (produksi) |

[Belum Dirilis]: #
[0.0.1]: #
