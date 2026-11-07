# Product Requirements Document (PRD)
## SIPUT-KALTIM — Sistem Informasi Proteksi Tanaman Perkebunan Provinsi Kalimantan Timur

| Item | Keterangan |
|---|---|
| Versi dokumen | 1.0 (Draft) |
| Tanggal | 5 November 2026 |
| Pemilik produk | Dinas Perkebunan Provinsi Kalimantan Timur |
| Tagline | *Ruhui Rahayu* — Proteksi Perkebunan |
| Status | Fase 1: Frontend (data simulasi) → Fase 2: Integrasi Supabase |
| Referensi | 4 desain UI (Dashboard Eksekutif, Peta Sebaran & GIS OPT, Formulir Input Laporan, Rekapitulasi Triwulan & Semester) |

---

## 1. Ringkasan Eksekutif

SIPUT-KALTIM adalah aplikasi web responsif untuk mencatat, memetakan, merekap, dan melaporkan serangan **Organisme Pengganggu Tumbuhan (OPT)** pada tanaman perkebunan di Provinsi Kalimantan Timur. Aplikasi dipakai oleh tiga peran: **Admin Provinsi**, **Operator UPTD/Wilayah**, dan **Petugas POPT Lapangan** (Pengamat Hama dan Penyakit).

Setiap laporan serangan yang diinput (desa, kecamatan, kabupaten/kota, komoditas, jenis OPT, luas serangan) otomatis muncul sebagai titik pada **peta Google**, masuk ke grafik tren dan tingkat serangan, serta ke daftar rekap yang dapat diekspor ke **Excel** dan **PDF** (termasuk Berita Acara resmi).

## 2. Latar Belakang dan Masalah

- Pelaporan serangan OPT berjenjang (lapangan → UPTD → kabupaten → provinsi) rawan lambat, tidak seragam, dan sulit direkap per triwulan/semester.
- Sebaran serangan belum terlihat secara spasial sehingga prioritas bantuan (pestisida nabati, agens hayati, brigade proteksi) sulit ditentukan cepat.
- Penyusunan Berita Acara dan rekap periodik masih manual.

## 3. Tujuan dan Indikator Keberhasilan

| Tujuan | Indikator (target awal, dapat disesuaikan) |
|---|---|
| Input laporan terstandar dan cepat | Formulir selesai diisi < 5 menit; validasi wajib lengkap sebelum simpan |
| Visibilitas real-time bagi pimpinan | Laporan baru tampil di dashboard dan peta < 5 detik setelah disimpan |
| Rekap otomatis | Rekap triwulan/semester dihasilkan satu klik tanpa input ulang |
| Ekspor siap pakai | Excel dan PDF terunduh sesuai filter aktif |
| Dapat dipakai di lapangan | Seluruh layar berfungsi baik di ponsel (lebar ≥ 360 px) |

**Di luar cakupan Fase 1:** database sungguhan, autentikasi produksi, tanda tangan elektronik sungguhan (BSrE), integrasi SMS/WhatsApp, mode offline penuh.

## 4. Pengguna dan Peran

| Peran | Deskripsi | Hak akses utama |
|---|---|---|
| **Admin (Provinsi)** | Koordinator POPT Provinsi / pimpinan bidang | Seluruh modul, seluruh wilayah; validasi laporan; kelola pengguna; kelola master komoditas & OPT; ekspor semua data |
| **Operator UPTD / Wilayah** | Pengelola data tingkat UPTD/kabupaten | Lihat dan ekspor data wilayahnya; verifikasi laporan petugas wilayahnya; input/ubah laporan wilayahnya |
| **Petugas POPT Lapangan** | Pengamat di lapangan | Input laporan; lihat/ubah laporan miliknya (selama belum diverifikasi); lihat peta dan rekap wilayah kerjanya |

Penjelasan lintas peran: portal dipilih melalui *segmented tab* di header ("Portal Admin (Provinsi)", "Operator UPTD / Wilayah", "Petugas POPT Lapangan"). Pada Fase 1 pemilihan ini hanya mensimulasikan peran; pada Fase 2 peran ditentukan oleh akun yang login, bukan oleh tab.

## 5. Ruang Lingkup Fungsional

### 5.1 Layout Umum (Semua Halaman)
- **Header:** logo Pemprov Kaltim di kiri; teks "SIPUT KALTIM — Pemprov Kalimantan Timur – Dinas Perkebunan"; pemilih portal (3 peran); indikator "Sistem Real-Time" + lokasi/zona waktu (Samarinda, WITA); ikon notifikasi dengan penanda belum dibaca; profil pengguna (nama, jabatan, peran).
- **Sidebar:** Wilayah Kerja Utama (Provinsi Kalimantan Timur); menu: Dashboard Eksekutif, Peta Sebaran & GIS OPT, Input Laporan Serangan, Data Komoditas & OPT, Rekapitulasi Triwulan & Semester, Ekspor Laporan (Excel & PDF), Manajemen Pengguna; status "Server SIPUT Aktif v2.4.0"; tombol "Keluar Sistem".
- **Responsif:** desktop (sidebar tetap), tablet/ponsel (sidebar menjadi *drawer*/hamburger, tabel dapat di-scroll horizontal atau berubah menjadi kartu, filter menjadi panel lipat).
- **Bahasa:** seluruh antarmuka Bahasa Indonesia; format angka Indonesia (titik ribuan, koma desimal, mis. `3.840,50 Ha`); format tanggal `5 Nov 2026`, waktu dengan label `WITA`.
- **Tema visual:** hijau tua sebagai warna utama, aksen kuning/emas, merah untuk bahaya; sesuai desain.

### 5.2 Dashboard Eksekutif ("Ringkasan Eksekutif Serangan OPT")
| ID | Kebutuhan |
|---|---|
| DSH-01 | Menampilkan jam, hari, tanggal, dan tahun real-time (mis. "Kamis, 05 Nov 2026 \| 14:14:09 WITA") yang berjalan tiap detik. |
| DSH-02 | Filter periode: Semester I/II dan TW I–TW IV (satu pilihan aktif), serta filter wilayah ("Seluruh Wilayah (Kaltim)" atau kabupaten/kota). |
| DSH-03 | Lima kartu KPI: **Total Laporan Lapangan** (dengan persen perubahan vs periode sebelumnya), **Total Luas Serangan OPT** (Ha, jumlah kab/kota terdampak), **Serangan Berat/Eksplosif** (Ha, lencana "Ambang Darurat Tinggi" bila melewati ambang), **Serangan Ringan & Sedang** (Ha), **Komoditas Pantauan Utama** (jumlah komoditas unggulan). |
| DSH-04 | **Grafik garis** tren serangan bulanan (Ha): seri *Total Serangan* dan *Serangan Berat*; sumbu X Jan–Des, tooltip nilai, keterangan puncak lonjakan dan tingkat penanganan POPT (%). |
| DSH-05 | **Grafik intensitas per komoditas:** batang bertumpuk Ringan/Sedang vs Berat (Ha) per komoditas, plus label "komoditas paling rentan" dan tautan "Detail OPT". |
| DSH-06 | Peta mini sebaran spasial dengan legenda Merah (Berat), Kuning (Sedang), Hijau (Aman), panel Indeks Kerentanan Wilayah, tombol "Buka Peta Penuh". |
| DSH-07 | Panel peringatan dini: *Peringatan Eksplosif OPT* (kritis), *Waspada Penyakit*, dan *Rekomendasi Kebijakan* (mis. alokasi bantuan agens hayati) dengan aksi (Intervensi Masif, Kirim Fungisida, Disposisi). Aksi pada Fase 1 hanya simulasi + notifikasi sukses. |
| DSH-08 | Tabel **Laporan Observasi Lapangan Real-Time**: waktu & tanggal, petugas (nama, NIP), lokasi, komoditas, jenis OPT, luas (Ha), tingkat serangan, status verifikasi, aksi cepat (lihat detail, verifikasi). Dilengkapi pencarian (OPT, petugas, wilayah), tombol "Input Laporan", dan paginasi. |

### 5.3 Input Laporan Serangan ("Formulir Laporan Pengamatan Serangan OPT Perkebunan")
Formulir bertahap dalam 5 bagian, dengan panel **Ringkasan Validasi (Live Preview)** di kanan dan **Panduan Petugas POPT**.

| Bagian | Isi dan aturan |
|---|---|
| Header form | Kode formulir; waktu input real-time (hari, jam, tanggal, tahun, WITA); NIP, nama, dan WKPP petugas (terisi otomatis dari akun); status integritas data. |
| **I. Periode Pelaporan** | Triwulan berjalan (TW I–IV), **Semester** (1/2), Tahun Anggaran. Semester dan triwulan harus konsisten (TW I–II ⇒ Semester 1; TW III–IV ⇒ Semester 2); sistem memberi nilai bawaan dari tanggal sistem namun dapat diubah. |
| **II. Lokasi Geografis & Administrasi** | Kabupaten/Kota → Kecamatan → Desa/Kelurahan (dropdown bertingkat), nama blok/poktan, koordinat titik observasi WGS 84 (lintang/bujur), tombol "Ambil Koordinat Otomatis" (Geolocation API), pratinjau pin pada peta. Koordinat divalidasi berada dalam wilayah Kaltim. |
| **III. Komoditas & OPT** | Pilih komoditas: **Lada, Kelapa Sawit, Kakao, Karet, Aren, Kelapa Dalam, Kopi**; jenis hama/OPT dari katalog khusus Kaltim (bergantung komoditas); fase tanaman (TBM, TM, TTM/TR). |
| **IV. Luas & Intensitas** | Luas pengamatan, serangan ringan, serangan berat, terkendali (Ha). Kalkulasi otomatis total terdampak, persen intensitas, dan status (Ringan/Sedang/Berat). Validasi: ringan + berat + terkendali ≤ luas pengamatan; angka tidak negatif. |
| **V. Dokumentasi & Rekomendasi** | Unggah maksimal 3 foto (PNG/JPG, ≤ 8 MB, dikompres di sisi klien); catatan rekomendasi: kultur teknis, pengendalian hayati, kimiawi/eradikasi. |
| Aksi | **Simpan Draf** (lokal di peramban), **Batal**, **Simpan & Publikasikan ke GIS**. Draf tersimpan otomatis. Setelah publikasi, laporan langsung muncul di peta, dashboard, dan rekap. |

Notifikasi: toast **sukses** ("Laporan berhasil dipublikasikan ke peta") atau **gagal** (menjelaskan field yang bermasalah / kegagalan simpan, dengan opsi coba lagi).

### 5.4 Peta Sebaran & GIS OPT
| ID | Kebutuhan |
|---|---|
| GIS-01 | Peta **Google Maps** (pilihan lapisan: Citra Satelit, Peta Tematik, Kontur Topografi) berpusat pada Kalimantan Timur. |
| GIS-02 | Setiap laporan terpublikasi menjadi penanda berwarna: **Merah** (berat/eksplosif), **Kuning** (sedang/waspada), **Hijau** (ringan/terkendali). Penanda dikelompokkan (*clustering*) saat zoom jauh. |
| GIS-03 | Klik penanda membuka kartu detail: zona, ID laporan, lokasi + koordinat, foto geotagging, komoditas, OPT, luas serangan, intensitas, petugas, waktu, rekomendasi tindakan, tombol "Detail Berita Acara" dan navigasi arah. |
| GIS-04 | Panel filter spasial: (1) wilayah administratif bertingkat, (2) komoditas target (centang ganda), (3) tingkat keparahan, (4) periode pengamatan (Real-Time, Triwulan, Semester), tombol "Terapkan Filter Spasial" dan "Reset". |
| GIS-05 | Header menampilkan jumlah titik bahaya kritis, titik waspada, dan total Ha terdampak sesuai filter aktif. Sistem referensi WGS84 / EPSG:4326. |
| GIS-06 | Daftar UPTD wilayah terpilih beserta pengamat aktif. |
| GIS-07 | Tabel **Rekapitulasi Wilayah Paling Rentan OPT**: kabupaten, kecamatan terparah, komoditas utama, OPT dominan, luas serangan, status ancaman, tindakan lapangan; diurutkan berdasarkan luas serangan aktif. Tombol "Unduh Geodata Excel" dan "Cetak Peta Spasial PDF". |
| GIS-08 | Legenda tematik peta (Merah/Kuning/Hijau/Batas karantina) dan atribusi peta Google. |

### 5.5 Rekapitulasi Triwulan & Semester
| ID | Kebutuhan |
|---|---|
| REK-01 | Parameter: **Tahun Anggaran**, **Pilihan Triwulan** (TW I–IV) / **Semester** / **Tahunan Penuh**, **Komoditas**, **Wilayah Kerja/UPTD**; tombol "Terapkan Filter" dan "Reset Filter"; baris keterangan filter aktif. |
| REK-02 | Pusat ekspor: **Unduh Microsoft Excel (.xlsx)** (format tabular) dan **Cetak Berita Acara PDF** (kop resmi + ruang tanda tangan). |
| REK-03 | Kartu ringkasan: Total Luas Amatan, Total Serangan OPT (+ intensitas rata-rata), Serangan Berat/Kritis, Pengendalian & Eradikasi (+ efektivitas capaian). Disertai persen perubahan dari periode sebelumnya. |
| REK-04 | **Matriks rekap tingkat kabupaten/kota:** wilayah (beserta kecamatan terdampak), komoditas utama, OPT dominan, luas tanam, serangan ringan (Ha/%), berat (Ha/%), total serangan, pengendalian; baris **Total Konsolidasi Provinsi**; pencarian wilayah/OPT, paginasi. |
| REK-05 | Grafik **Tren Fluktuasi Serangan per Komoditas** antar triwulan (garis, tiap komoditas satu seri) dan **Proporsi Serangan Berat vs Ringan** per sentra. |
| REK-06 | **Standar Berita Acara:** pratinjau lembar dokumen (kop, nomor dokumen, tanggal pengesahan, status, penandatangan). Pada Fase 1 pengesahan/barcode hanya tampilan simulasi dan diberi label jelas "Simulasi". |
| REK-07 | **Log Ekspor & Riwayat Unduhan:** berkas, format/tipe, petugas/operator, waktu unduh, aksi unduh ulang; lihat semua log. |

### 5.6 Data Komoditas & OPT (Master Data)
- Daftar 7 komoditas: Lada, Kakao, Karet, Kelapa Sawit, Aren, Kelapa Dalam, Kopi.
- Katalog OPT per komoditas (nama lokal, nama ilmiah, jenis hama/penyakit, gejala, rekomendasi pengendalian). Contoh: *Ganoderma boninense* (Kelapa Sawit), *Oryctes rhinoceros* (Kelapa Sawit), *Phytophthora capsici* (Lada), *Conopomorpha cramerella* (Kakao), *Corynespora cassiicola* (Karet), *Rigidoporus microporus* (Karet).
- CRUD hanya untuk Admin.

### 5.7 Ekspor Laporan (Excel & PDF)
- Ekspor mengikuti filter aktif (periode, wilayah, komoditas, status).
- **Excel:** lembar Rekap, Detail Laporan, dan Ringkasan; format angka dan tanggal Indonesia.
- **PDF:** Berita Acara resmi (kop, tabel rekap, grafik ringkas, ruang tanda tangan) dan peta spasial.
- Pembuatan berkas dilakukan di sisi klien (SheetJS / jsPDF) pada Fase 1. Tidak ada kunci rahasia yang diperlukan.
- Setiap ekspor tercatat pada Log Ekspor; sukses/gagal ditampilkan sebagai notifikasi.

### 5.8 Manajemen Pengguna (Admin)
- Daftar pengguna: nama, NIP, jabatan, peran, wilayah kerja, status aktif.
- Tambah/ubah/nonaktifkan pengguna, atur peran dan wilayah (Fase 1: simulasi pada data lokal; Fase 2: Supabase Auth).

### 5.9 Notifikasi
- **Toast** sukses/gagal/peringatan/info untuk seluruh aksi (simpan, publikasi, ekspor, validasi, gagal jaringan).
- **Pusat notifikasi** (ikon lonceng): laporan baru, peringatan eksplosif, laporan menunggu validasi; penanda "belum dibaca".

## 6. Alur Pengguna Utama

1. **Petugas** login → Input Laporan → isi bagian I–V → Simpan & Publikasikan → toast sukses → titik muncul di peta dan dashboard → status "Menunggu Validasi".
2. **Operator UPTD** membuka dashboard wilayah → memeriksa laporan "Menunggu Validasi" → verifikasi atau tolak dengan catatan.
3. **Admin/Pimpinan** membuka Dashboard → melihat peringatan eksplosif → membuka peta → memilih tindakan (intervensi, disposisi) → menyusun rekap triwulan → mencetak Berita Acara PDF.

## 7. Model Data (Rancangan untuk Fase 2 – Supabase)

| Tabel | Kolom utama |
|---|---|
| `profiles` | id (uuid, = auth.users.id), nama, nip, jabatan, peran (`admin`/`operator`/`petugas`), wilayah_id, aktif |
| `wilayah` | id, tipe (`kabupaten`/`kecamatan`/`desa`), nama, parent_id, uptd_id |
| `komoditas` | id, nama, aktif |
| `opt` | id, komoditas_id, nama_lokal, nama_ilmiah, jenis (`hama`/`penyakit`), gejala, rekomendasi |
| `laporan` | id, kode, petugas_id, desa_id, nama_blok, lat, lng, komoditas_id, opt_id, fase_tanaman, tahun, triwulan, semester, luas_amatan, luas_ringan, luas_berat, luas_terkendali, intensitas_persen, tingkat (`ringan`/`sedang`/`berat`), status (`draf`/`menunggu`/`terverifikasi`/`ditolak`), rekomendasi_kultur, rekomendasi_hayati, rekomendasi_kimiawi, dibuat_pada, diverifikasi_oleh |
| `laporan_foto` | id, laporan_id, path_storage, geotag_lat, geotag_lng, urutan |
| `log_ekspor` | id, user_id, nama_berkas, format, filter_json, dibuat_pada |
| `notifikasi` | id, user_id, judul, isi, tipe, dibaca, dibuat_pada |

Fase 1: data disimulasikan melalui satu **lapisan data (repository/service)** dengan antarmuka yang sama seperti rencana Supabase, sehingga penggantian ke Supabase tidak mengubah komponen UI.

## 8. Aturan Bisnis

- **Intensitas serangan (%)** = (luas ringan + luas berat) ÷ luas pengamatan × 100.
- **Klasifikasi tingkat serangan** (mengikuti panel filter GIS pada desain): Ringan/Waspada < 25%; Sedang/Menjalar 25–50%; Berat/Eksplosif > 50%. Ambang dibuat sebagai konfigurasi agar mudah diubah (lihat Pertanyaan Terbuka).
- Triwulan: TW I (Jan–Mar), TW II (Apr–Jun), TW III (Jul–Sep), TW IV (Okt–Des). Semester 1 = TW I–II, Semester 2 = TW III–IV.
- Laporan berstatus "Terverifikasi" tidak dapat diubah petugas; perubahan hanya oleh Operator/Admin dengan catatan perubahan.
- Total rekap provinsi = penjumlahan seluruh baris wilayah terfilter (harus konsisten antara dashboard, peta, dan rekap).

## 9. Kebutuhan Non-Fungsional

### 9.1 Teknologi
| Aspek | Keputusan |
|---|---|
| Frontend | **React** + **Vite** (TypeScript disarankan) |
| Gaya | **Tailwind CSS** (token warna sesuai desain) |
| Peta | Google Maps JavaScript API (lihat §9.2) |
| Grafik | Pustaka grafik ringan (mis. Recharts / Chart.js) |
| Ekspor | SheetJS (Excel) dan jsPDF/pdfmake (PDF), sisi klien |
| Routing & state | React Router; state sederhana (Context/Zustand); *form* dengan validasi skema (mis. React Hook Form + Zod) |
| Database (Fase 2) | **Supabase** (PostgreSQL, Auth, Storage, Row Level Security) |
| Hosting | **Cloudflare Pages** (build Vite, SPA fallback `_redirects`) |

### 9.2 Keamanan (Wajib)
1. **Dilarang menyimpan secret key di frontend/repo.** Berkas `.env` masuk `.gitignore`; hanya variabel berawalan `VITE_` yang boleh berisi nilai *publik*.
2. **Kunci Google Maps** secara desain bersifat publik di peramban, sehingga wajib dibatasi (*HTTP referrer restriction* ke domain Cloudflare Pages/produksi dan batasan API ke Maps JavaScript API saja) serta diberi kuota/peringatan biaya. Kunci tanpa pembatasan tidak boleh dipakai.
3. **Supabase (Fase 2):** frontend hanya memakai **anon key** (publik); **service_role key tidak boleh ada di frontend**. Keamanan data ditegakkan oleh **Row Level Security** per peran dan wilayah, bukan oleh logika UI. Operasi yang butuh hak tinggi (undang pengguna, laporan massal) dijalankan lewat Supabase Edge Function / Cloudflare Worker dengan secret di sisi server.
4. Pembatasan menu berdasarkan peran di UI hanya kenyamanan; otorisasi sebenarnya di server (RLS).
5. Fase 1 memakai login/peran simulasi; **tidak boleh** dipublikasikan sebagai produksi dengan data nyata sebelum autentikasi Supabase aktif.
6. Validasi dan sanitasi input; hindari `dangerouslySetInnerHTML`; batasi tipe dan ukuran unggahan foto; header keamanan (CSP, X-Content-Type-Options) lewat berkas `_headers` Cloudflare Pages.
7. Data pribadi petugas (NIP) hanya ditampilkan sesuai peran; log ekspor mencatat siapa mengunduh apa.

### 9.3 Kinerja, Responsif, dan Aksesibilitas
- Muat awal < 3 detik pada jaringan 4G; *code splitting* per halaman; pemuatan peta *lazy*.
- Tabel besar memakai paginasi; peta memakai *clustering*.
- Responsif: breakpoint ponsel (≥ 360 px), tablet, desktop; target sentuh ≥ 44 px; formulir dapat diisi nyaman di ponsel.
- Aksesibilitas dasar: kontras warna memadai, label formulir, navigasi keyboard, status tidak hanya bergantung warna (ikon/teks pada lencana Merah/Kuning/Hijau).
- Peramban: versi terbaru Chrome, Edge, Firefox, Safari (iOS/Android).

### 9.4 Ketersediaan
- Penyimpanan draf lokal (localStorage/IndexedDB) agar tidak hilang saat koneksi terputus; pesan jelas saat offline.

## 10. Struktur Proyek yang Disarankan

```
siput-kaltim/
├─ public/            # logo Pemprov Kaltim, _redirects, _headers
├─ src/
│  ├─ components/     # layout, kartu KPI, tabel, grafik, peta, toast
│  ├─ pages/          # Dashboard, PetaGIS, InputLaporan, Rekap, Komoditas, Ekspor, Pengguna
│  ├─ services/       # repository data (mock → Supabase)
│  ├─ mocks/          # data simulasi wilayah, komoditas, OPT, laporan
│  ├─ lib/            # format angka/tanggal ID, klasifikasi, ekspor
│  └─ types/
├─ .env.example       # hanya variabel publik (VITE_GOOGLE_MAPS_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├─ tailwind.config.js
└─ vite.config.ts
```

## 11. Kriteria Penerimaan (Fase 1)

- [ ] Header, sidebar, dan 3 portal peran tampil sesuai desain; logo Pemprov Kaltim di kiri.
- [ ] Dashboard menampilkan 5 KPI, jam real-time (hari, jam, tanggal, tahun), grafik garis tren, grafik batang intensitas, peta mini, peringatan, dan tabel laporan real-time.
- [ ] Formulir memuat Triwulan, Semester, Tahun, Kabupaten/Kecamatan/Desa, tujuh komoditas, jenis OPT, luas serangan, dan foto; validasi berjalan.
- [ ] Laporan yang disimpan langsung muncul sebagai penanda di peta Google dan memperbarui dashboard serta rekap tanpa muat ulang halaman.
- [ ] Filter peta dan rekap bekerja; total antara dashboard, peta, dan rekap konsisten.
- [ ] Ekspor Excel dan PDF menghasilkan berkas sesuai filter aktif; tercatat di Log Ekspor.
- [ ] Notifikasi sukses dan gagal muncul untuk simpan, publikasi, ekspor, dan kesalahan.
- [ ] Seluruh layar berfungsi di lebar ponsel dan desktop; seluruh teks Bahasa Indonesia.
- [ ] Tidak ada secret key di kode/repo; kunci Google Maps dibatasi referrer; build dapat di-deploy ke Cloudflare Pages.

## 12. Rencana Rilis

| Fase | Isi | Perkiraan |
|---|---|---|
| **0** | Setup Vite + React + Tailwind, token desain, layout, routing, data simulasi | Minggu 1 |
| **1a** | Dashboard + grafik + notifikasi | Minggu 2 |
| **1b** | Formulir input + validasi + draf lokal | Minggu 3 |
| **1c** | Peta Google + filter spasial + rekap wilayah | Minggu 4 |
| **1d** | Rekap Triwulan/Semester + ekspor Excel/PDF + log | Minggu 5 |
| **1e** | Responsif ponsel, QA, deploy Cloudflare Pages | Minggu 6 |
| **2** | Supabase: Auth, skema, RLS, Storage foto, migrasi repository | Tahap berikutnya |
| **3** | Verifikasi berjenjang penuh, pengesahan dokumen resmi, notifikasi eksternal | Tahap lanjutan |

## 13. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Biaya/penyalahgunaan Google Maps API | Pembatasan referrer + API, kuota harian, peringatan billing |
| Data simulasi disalahartikan sebagai data resmi | Label "Data Simulasi" terlihat jelas selama Fase 1 |
| Koneksi buruk di lapangan | Draf lokal, unggah foto dikompres, pesan galat jelas |
| Ketidakkonsistenan definisi (ambang, wilayah) | Konfigurasi terpusat dan konfirmasi pemilik produk (lihat §14) |
| Kebocoran kunci | Kebijakan §9.2, `.env.example`, pemindaian rahasia di repositori |

## 14. Pertanyaan Terbuka dan Catatan Konsistensi Desain

Hasil telaah keempat desain; mohon konfirmasi sebelum implementasi:

1. **Ambang tingkat serangan tidak seragam.** Panel GIS menyebut Berat > 50%, Sedang 25–50%, Ringan < 25%; panel Input menyebut intensitas > 15% memicu pemberitahuan dan > 30% sebagai laporan eksplosif; contoh formulir menandai 18,8% sebagai "Sedang/Waspada". Perlu satu definisi resmi (PRD ini memakai ambang GIS sebagai bawaan, dapat dikonfigurasi).
2. **Jumlah wilayah:** teks desain menyebut "10/10 Kab/Kota" tetapi matriks hanya menampilkan 8 baris (satu baris "Kawasan Perkotaan"), dan dashboard menyebut "8 Kab/Kota". Perlu daftar wilayah resmi (Kaltim saat ini terdiri dari 7 kabupaten dan 3 kota).
3. **Angka total berbeda antarhalaman** (Dashboard 3.840,50 Ha; Rekap 32.418 Ha; GIS 2.840,4 Ha). Dianggap data contoh; pada implementasi seluruhnya dihitung dari satu sumber data.
4. **Komoditas:** desain memakai "Lada Malonan Kaltim" di dashboard dan "Lada" pada formulir; nama baku komoditas perlu ditetapkan. Pada dashboard "Aren" dan "Kelapa" digabung; PRD ini menampilkan tujuh komoditas terpisah.
5. **"Google OSD"** pada prompt diasumsikan Google Maps (sesuai desain). Bila yang dimaksud OpenStreetMap, Leaflet + OSM dapat menjadi alternatif tanpa biaya dan tanpa kunci API.
6. **Pengesahan dokumen** (barcode, e-Sign BSrE, nomor surat resmi) pada Fase 1 hanya tampilan simulasi; integrasi nyata memerlukan keputusan dan akses dari instansi penerbit sertifikat.
7. Apakah laporan petugas wajib diverifikasi Operator sebelum tampil di peta publik/pimpinan, atau langsung tampil dengan status "Menunggu Validasi" (asumsi PRD ini)?
8. Penamaan versi pada sidebar ("v2.4.0") untuk Fase 1 diganti sesuai versi rilis yang sebenarnya.
