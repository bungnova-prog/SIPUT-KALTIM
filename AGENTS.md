# AGENTS.md — SIPUT-KALTIM

Aturan kerja untuk agen AI (Antigravity Desktop, OpenCode Desktop, atau agen lain) yang mengerjakan repositori ini. Baca seluruh berkas ini sebelum mengubah apa pun.

## 1. Proyek dan Status

- **Nama:** SIPUT-KALTIM — Sistem Informasi Proteksi Tanaman Perkebunan Provinsi Kalimantan Timur (*Ruhui Rahayu*).
- **Pemilik:** Dinas Perkebunan Provinsi Kalimantan Timur.
- **Fungsi:** mencatat, memetakan, merekap, dan melaporkan serangan Organisme Pengganggu Tumbuhan (OPT). Tiga peran: Admin (Provinsi), Operator UPTD/Wilayah, Petugas POPT Lapangan.
- **Status saat ini:** dokumen panduan selesai; lapisan domain/services/mock, uji domain/repository, dan kerangka Fase 0 (routing/layout/halaman placeholder) sudah ada. Fitur UI lengkap, peta GIS nyata, dan autentikasi produksi masih dikerjakan bertahap. **Belum untuk data nyata/produksi.**
- **Fase 1** = frontend dengan data simulasi. **Fase 2** = integrasi Supabase. Fase 2 tidak boleh dimulai tanpa persetujuan tertulis pengguna (lihat §3).

## 2. Urutan Baca dan Prioritas Dokumen

| Berkas | Isi | Menang untuk hal |
|---|---|---|
| `PRD-SIPUT-KALTIM.md` | Kebutuhan, alur, aturan bisnis, kriteria penerimaan | Perilaku fungsional |
| `AGENTS.md` | Aturan kerja agen (berkas ini) | Cara bekerja |
| `DESIGN.md` | Token visual, layout, komponen, responsif | Tampilan |
| `SCHEMA.md` | Model data, RLS, kontrak repository | Struktur data |
| `SECURITY.md` | Kebijakan keamanan dan rahasia | Keamanan (mengalahkan semua yang lain) |
| `CHANGELOG.md` | Riwayat perubahan | Catatan perubahan |

Bila dua dokumen bertentangan: keamanan mengikuti `SECURITY.md`; perilaku mengikuti PRD; tampilan mengikuti `DESIGN.md` dan gambar desain. **Jangan memilih diam-diam**; catat pertentangan di `CHANGELOG.md` (bagian *Catatan*) dan beri tahu pengguna.

Gambar desain (4 layar: Dashboard Eksekutif, Peta Sebaran & GIS OPT, Formulir Input Laporan, Rekapitulasi Triwulan & Semester) adalah acuan **visual**. Angka dan teks contoh di gambar adalah data contoh, bukan spesifikasi (lihat PRD §14).

## 3. Larangan Keras

1. **Jangan membuat proyek Supabase**, menjalankan migrasi, atau memanggil API Supabase/Google Cloud/Cloudflare dengan kredensial sungguhan selama Fase 1. Fase 2 butuh instruksi eksplisit pengguna di percakapan.
2. **Jangan menulis secret** (service_role key, token, password, kunci pribadi) ke kode, `.env.example`, log, commit, atau percakapan. Detail di `SECURITY.md`.
3. **Jangan membaca atau mencetak isi `.env`** kecuali pengguna memintanya secara eksplisit.
4. **Jangan memakai kunci Google Maps tanpa pembatasan.** Kunci tidak ada di repositori; pengguna mengisinya sendiri di `.env` lokal.
5. **Jangan menjalankan perintah destruktif** (`rm -rf`, `git reset --hard`, `git push --force`, menghapus branch, menimpa berkas yang bukan buatan Anda) tanpa persetujuan.
6. **Jangan commit atau push** kecuali pengguna memintanya.
7. **Jangan mengarang** logo, nomor surat, NIP, tanda tangan elektronik, barcode, sertifikat BSrE, atau data resmi. Semuanya simulasi dan wajib berlabel "Simulasi" / "Data Simulasi".
8. **Jangan menambah fitur di luar PRD.** Usulan tambahan ditulis sebagai catatan, bukan diimplementasikan.
9. **Jangan memakai `dangerouslySetInnerHTML`**, `eval`, atau memuat skrip pihak ketiga selain Google Maps.

## 4. Stack (tetap, sesuai PRD §9.1)

React + Vite + TypeScript (mode `strict`) · Tailwind CSS · Google Maps JavaScript API (dimuat *lazy*) · Recharts (atau Chart.js) · SheetJS (xlsx) + jsPDF/pdfmake · React Router · Zustand atau Context · React Hook Form + Zod · Supabase (Fase 2) · Cloudflare Pages.

Menambah dependensi baru: hanya bila perlu, pilih yang terawat dan ringan, sebutkan alasannya di `CHANGELOG.md`.

## 5. Perintah (didefinisikan di `package.json` pada Fase 0)

Gunakan nama skrip berikut agar sama di semua alat:

| Skrip | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan Vite |
| `npm run build` | Build produksi (harus lolos tanpa galat) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Uji unit (Vitest, disarankan untuk `src/lib`) |

Sebelum menyatakan pekerjaan selesai, jalankan `typecheck`, `lint`, dan `build`. Bila gagal, perbaiki atau laporkan penyebabnya; jangan menyatakan selesai.

## 6. Struktur Proyek

Ikuti PRD §10:

```
siput-kaltim/
├─ public/            # logo (disediakan pemilik), _redirects, _headers
├─ src/
│  ├─ components/     # layout, kartu KPI, tabel, grafik, peta, toast
│  ├─ pages/          # Dashboard, PetaGIS, InputLaporan, Rekap, Komoditas, Ekspor, Pengguna
│  ├─ services/       # repository data (mock → Supabase)
│  ├─ mocks/          # data simulasi wilayah, komoditas, OPT, laporan
│  ├─ lib/            # format angka/tanggal ID, klasifikasi, ekspor
│  └─ types/
├─ .env.example       # hanya variabel publik
├─ tailwind.config.js
└─ vite.config.ts
```

## 7. Konvensi Kode

- **Bahasa:** seluruh teks antarmuka, pesan galat, dan komentar dalam Bahasa Indonesia. Nama berkas, komponen, dan fungsi boleh Inggris untuk istilah teknis; istilah domain memakai Indonesia yang sama dengan `SCHEMA.md` (`laporan`, `komoditas`, `wilayah`, `triwulan`).
- **TypeScript:** `strict`, tanpa `any` kecuali dijelaskan. Kolom basis data `snake_case`; objek TypeScript `camelCase`; pemetaan dilakukan **hanya** di lapisan `services/`.
- **Lapisan data:** komponen UI **tidak boleh** mengimpor `mocks/` atau Supabase langsung. UI hanya memanggil antarmuka repository di `services/` (kontrak di `SCHEMA.md` §9). Pergantian mock → Supabase tidak boleh mengubah komponen UI.
- **Satu sumber data:** Dashboard, Peta, dan Rekap menghitung dari repository yang sama. Total harus konsisten antarhalaman (PRD §8, kriteria penerimaan).
- **Komponen:** fungsional, kecil, tanpa logika bisnis di JSX. Logika bisnis ke `src/lib/` dan wajib bisa diuji.
- **Gaya:** Tailwind dengan token dari `DESIGN.md`; jangan menulis warna heksadesimal langsung di komponen.
- **Aksesibilitas:** label pada setiap input, fokus terlihat, target sentuh ≥ 44 px, status tidak hanya dengan warna (selalu ikon + teks).
- **Kinerja:** *code splitting* per halaman, peta di-*lazy load*, tabel berpaginasi, penanda peta di-*cluster*.

## 8. Aturan Domain yang Wajib Tepat

Letakkan di `src/lib/` dan beri uji unit.

- **Intensitas (%)** = (luas ringan + luas berat) ÷ luas pengamatan × 100. Bila luas pengamatan = 0, intensitas = 0 dan form menolak simpan.
- **Klasifikasi tingkat:** Ringan < 25%; Sedang 25–50% (batas bawah dan atas termasuk); Berat > 50%. Ambang **harus berupa konfigurasi** (satu berkas), bukan angka di tengah komponen.
- **Ambang peringatan form** (> 15% pemberitahuan, > 30% laporan eksplosif) disimpan sebagai konfigurasi **terpisah** dari klasifikasi. Keduanya belum final (PRD §14 no. 1); jangan menyatukannya sendiri.
- **Validasi luas:** semua angka ≥ 0; ringan + berat + terkendali ≤ luas pengamatan.
- **Triwulan:** TW I Jan–Mar, TW II Apr–Jun, TW III Jul–Sep, TW IV Okt–Des. Semester 1 = TW I–II; Semester 2 = TW III–IV. Form menolak kombinasi yang tidak konsisten. Nilai bawaan diambil dari tanggal sistem.
- **Koordinat:** WGS 84 (EPSG:4326), harus berada dalam wilayah Kaltim. Untuk Fase 1 boleh memakai kotak batas kasar (lintang −2,6 sampai 2,5; bujur 113,8 sampai 119,1) yang ditandai sementara; ganti dengan poligon batas saat tersedia.
- **Status laporan:** `draf` → `menunggu` → `terverifikasi` atau `ditolak`. Laporan `terverifikasi` tidak bisa diubah Petugas; perubahan oleh Operator/Admin wajib disertai catatan.
- **Format Indonesia:** gunakan `Intl.NumberFormat('id-ID')` dan zona waktu `Asia/Makassar`. Contoh: `3.840,50 Ha`, `5 Nov 2026`, `14:14:09 WITA`. Jam di header dan dashboard berjalan tiap detik.
- **Tujuh komoditas terpisah:** Lada, Kelapa Sawit, Kakao, Karet, Aren, Kelapa Dalam, Kopi. Jangan menggabungkan "Aren & Kopi" atau "Kelapa / Aren / Kopi" seperti pada beberapa teks gambar.
- **Peran di Fase 1** hanya simulasi lewat tab portal. Pembatasan menu di UI hanya kenyamanan, bukan keamanan.

## 9. Alur Kerja per Fase

Kerjakan **satu sub-fase sekali**, sesuai PRD §12. Setelah setiap sub-fase: jalankan pemeriksaan §5, perbarui `CHANGELOG.md`, lalu berhenti dan laporkan.

| Fase | Isi | Selesai bila |
|---|---|---|
| 0 | Setup Vite+React+Tailwind, token desain, layout, routing, data simulasi | `build` lolos, layout dan 3 portal tampil |
| 1a | Dashboard, grafik, notifikasi | Kriteria PRD §11 butir dashboard terpenuhi |
| 1b | Formulir 5 bagian, validasi, draf lokal | Validasi §8 berjalan, draf tersimpan otomatis |
| 1c | Peta Google, filter spasial, rekap wilayah | Laporan baru muncul di peta tanpa muat ulang |
| 1d | Rekap TW/Semester, ekspor Excel/PDF, log ekspor | Berkas sesuai filter aktif dan tercatat di log |
| 1e | Responsif ponsel, QA, deploy Cloudflare Pages | Seluruh layar berfungsi di lebar 360 px |
| 2 | Supabase (Auth, skema, RLS, Storage) | Hanya atas instruksi eksplisit pengguna |

**Definisi selesai (setiap tugas):** berfungsi di desktop dan lebar 360 px; teks Indonesia; format angka/tanggal Indonesia; tanpa secret; typecheck/lint/build lolos; `CHANGELOG.md` diperbarui; label "Data Simulasi" terlihat.

## 10. Cara Melapor dan Bertanya

- Awali pekerjaan dengan satu kalimat: apa yang akan dikerjakan.
- Akhiri dengan ringkas: apa yang berubah, berkas yang disentuh, hasil pemeriksaan, dan satu langkah berikutnya.
- Bila ada pertanyaan terbuka (PRD §14) yang menghalangi: pakai **nilai bawaan PRD**, jadikan konfigurasi, catat asumsi di `CHANGELOG.md`, lalu lanjutkan. Hanya berhenti dan bertanya untuk keputusan yang tidak bisa dibatalkan atau menyangkut keamanan/biaya.
- Jangan menyatakan sesuatu "sudah diuji" bila tidak dijalankan.

## 11. Nilai Bawaan untuk Pertanyaan Terbuka PRD §14

| No | Pertanyaan | Bawaan sampai ada keputusan |
|---|---|---|
| 1 | Ambang tingkat serangan | Ambang GIS (25/50), konfigurasi terpusat |
| 2 | Daftar wilayah | 7 kabupaten + 3 kota; matriks Rekap boleh mengelompokkan kota, tetapi data mock memakai 10 entri |
| 3 | Total berbeda antarhalaman | Hitung dari satu sumber data |
| 4 | Nama komoditas | Tujuh nama baku: Lada, Kelapa Sawit, Kakao, Karet, Aren, Kelapa Dalam, Kopi |
| 5 | "Google OSD" | Google Maps; arsitektur peta dibungkus satu komponen agar bisa diganti Leaflet+OSM |
| 6 | Pengesahan dokumen | Simulasi berlabel jelas |
| 7 | Verifikasi sebelum tampil | Langsung tampil dengan status "Menunggu Validasi" |
| 8 | Versi sidebar | Ambil dari `package.json`; jangan menulis "v2.4.0" |

## 12. Kompatibilitas Alat

Berkas ini ditulis netral agar dapat dibaca oleh alat apa pun.

- **OpenCode Desktop:** membaca `AGENTS.md` di akar proyek sebagai instruksi proyek. Bila ingin memuat dokumen lain otomatis, tambahkan daftar `instructions` di `opencode.json` (mis. `DESIGN.md`, `SCHEMA.md`, `SECURITY.md`). Jangan menaruh kunci apa pun di berkas itu.
- **Antigravity Desktop:** gunakan `AGENTS.md` ini sebagai aturan proyek. Bila versi yang dipakai tidak memuatnya otomatis, buat aturan proyek singkat (mis. di `.agent/rules/`) yang hanya berisi: "Baca dan patuhi `AGENTS.md` di akar repositori sebelum bekerja." Jangan menyalin isi berkas agar tidak terjadi dua versi.
- **Satu sumber kebenaran:** semua aturan hidup di berkas dokumen ini. Konfigurasi khusus alat hanya berisi penunjuk ke sini.
- **Bila ada beberapa agen berjalan:** masing-masing mengerjakan sub-fase atau direktori berbeda, dan tidak mengedit berkas yang sama. `CHANGELOG.md` diperbarui secara berurutan untuk menghindari konflik.
- Perintah di terminal harus yang umum (`npm`, `git`); jangan bergantung pada fitur khusus satu alat.
