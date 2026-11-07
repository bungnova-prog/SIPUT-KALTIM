# DESIGN.md — SIPUT-KALTIM

Panduan visual dan antarmuka. Sumber: 4 gambar desain (Dashboard Eksekutif, Peta Sebaran & GIS OPT, Formulir Input Laporan, Rekapitulasi Triwulan & Semester) dan PRD §5.1, §9.3.

> **Catatan nilai:** nilai warna dan ukuran di bawah diperkirakan dari gambar, bukan dari berkas ekspor desain. Bila pemilik menyediakan token resmi (Stitch/Figma), ganti nilai di §2 dan catat di `CHANGELOG.md`. Komponen memakai **nama token**, bukan nilai langsung.

## 1. Prinsip

1. **Resmi dan tenang:** instansi pemerintah; hijau tua dominan, kuning/emas sebagai aksen, merah hanya untuk bahaya.
2. **Padat tetapi terbaca:** banyak data; gunakan kartu putih, jarak lega, dan tabel berpaginasi.
3. **Status tidak hanya warna:** setiap lencana Merah/Kuning/Hijau memiliki ikon dan teks.
4. **Ponsel dahulu untuk formulir:** petugas bekerja di lapangan.
5. **Jujur soal simulasi:** selama Fase 1, label "Data Simulasi" selalu terlihat.

## 2. Token

### 2.1 Warna (nama token Tailwind → nilai perkiraan)

| Token | Nilai | Pemakaian |
|---|---|---|
| `brand-900` | `#0B4A22` | Menu aktif sidebar, tombol utama, header popup peta, banner hero Rekap |
| `brand-700` | `#116B31` | Hover tombol utama, garis grafik "Total" |
| `brand-100` | `#DCF2E3` | Latar lencana hijau, kartu ringkas |
| `gold-500` | `#F5B800` | Lencana "KALTIM", aksen, serangan sedang |
| `gold-100` | `#FFF3CC` | Latar lencana sedang/waspada |
| `danger-600` | `#C8161D` | Serangan berat/eksplosif, tombol Cetak PDF |
| `danger-100` | `#FDE3E3` | Latar lencana kritis |
| `ok-500` | `#2E9E57` | Ringan/terkendali/aman |
| `ok-100` | `#DDF5E5` | Latar lencana aman |
| `info-100` | `#E3ECFB` | Lencana "Menunggu Validasi", "Terverifikasi" netral |
| `surface` | `#FFFFFF` | Kartu |
| `canvas` | `#F3F5FA` | Latar halaman |
| `ink-900` | `#111827` | Teks utama |
| `ink-600` | `#4B5563` | Teks sekunder |
| `line` | `#E5E7EB` | Garis dan border |

Kontras teks harus memenuhi WCAG AA (≥ 4,5:1). Teks kuning di atas putih **tidak** memenuhi; gunakan `ink-900` pada latar `gold-100`.

### 2.2 Tipografi
- Keluarga: sans-serif geometris (mis. **Inter**), dengan *fallback* sistem. Angka KPI memakai `tabular-nums`.
- Skala: judul halaman 28–32 px tebal; judul kartu 16–18 px; label kecil huruf kapital 11–12 px dengan *letter-spacing* lebar (label KPI, header tabel); isi 14 px.
- Kode formulir dan koordinat memakai font monospasi.

### 2.3 Bentuk dan Jarak
- Radius kartu 12–16 px; tombol dan lencana 8 px / pil penuh; ikon kartu KPI dalam kotak 32–40 px.
- Bayangan sangat halus; mengandalkan border `line`.
- Jarak dasar 4 px; padding kartu 16–24 px; jarak antarkartu 16–24 px.

## 3. Layout Global

| Area | Spesifikasi |
|---|---|
| **Header** (menempel di atas) | Kiri: logo Pemprov Kaltim (**berkas disediakan pemilik**; gambar desain menampilkan placeholder rusak "logo") + "SIPUT" + lencana emas "KALTIM" + teks "PEMPROV KALIMANTAN TIMUR – DINAS PERKEBUNAN". Tengah: *segmented tab* tiga portal (Portal Admin (Provinsi), Operator UPTD / Wilayah, Petugas POPT Lapangan), tab aktif putih dengan titik hijau. Kanan: indikator "Sistem Real-Time · Samarinda, WITA", ikon notifikasi dengan titik merah, profil (nama, jabatan, peran) dengan avatar bulat hijau. |
| **Sidebar** (lebar sekitar 220–250 px) | Kotak "WILAYAH KERJA UTAMA — Provinsi Kalimantan Timur". Menu (ikon + teks): Dashboard Eksekutif, Peta Sebaran & GIS OPT, Input Laporan Serangan, Data Komoditas & OPT, Rekapitulasi Triwulan & Semester, Ekspor Laporan (Excel & PDF), Manajemen Pengguna. Menu aktif: latar `brand-900`, teks putih. Bawah: kartu status "Server SIPUT Aktif" + versi (diambil dari `package.json`), tautan merah "Keluar Sistem". |
| **Konten** | Latar `canvas`, kartu `surface` bersusun vertikal. |
| **Footer** | Pada Dashboard: kartu "SIPUT KALTIM • Ruhui Rahayu Proteksi Perkebunan" dengan status koneksi data. |

**Responsif:** ≥ 1024 px sidebar tetap; < 1024 px sidebar menjadi *drawer* lewat tombol hamburger; header memadatkan tab portal menjadi menu pilihan. Sasaran minimum lebar 360 px. Tabel: gulir horizontal atau berubah menjadi kartu; panel filter menjadi bagian lipat.

## 4. Layar

### 4.1 Dashboard Eksekutif
Urutan dari atas:
1. **Judul** "Ringkasan Eksekutif Serangan OPT" (hijau tua), label dinas di atasnya, jam real-time berformat `Kamis, 05 Nov 2026 | 14:14:09 WITA` dengan titik merah. Kanan: tab Semester I/II, TW I–IV (satu aktif, hijau), pilihan wilayah, tombol `Excel (.xlsx)` dan `Cetak PDF` (merah).
2. **Lima kartu KPI** sebaris (ponsel: 1–2 kolom): Total Laporan Lapangan (+ persen naik hijau), Total Luas Serangan OPT, Serangan Berat/Eksplosif (angka merah + lencana "Ambang Darurat Tinggi"), Serangan Ringan & Sedang, Komoditas Pantauan Utama.
3. **Dua grafik berdampingan:** garis area "Tren Laju Serangan OPT Bulanan (Ha)" (hijau = total, merah = berat; sumbu Jan–Des; titik terakhir bertanda "Aktif"), dan "Intensitas per Komoditas" (batang horizontal bertumpuk hijau = Ringan/Sedang, merah = Berat, total di kanan). Di bawah masing-masing: keterangan puncak dan "komoditas paling rentan" dengan tautan "Detail OPT".
4. **Baris peta dan peringatan:** kiri peta mini dengan legenda Merah/Kuning/Hijau, panel "Indeks Kerentanan Wilayah", tombol hijau "Buka Peta Penuh"; kanan tumpukan kartu: Peringatan Eksplosif OPT (lencana "Kritis"), Waspada Penyakit (lencana "Waspada"), Rekomendasi Kebijakan (kartu hijau tua, tombol "Disposisi").
5. **Tabel Laporan Observasi Lapangan Real-Time:** kolom Waktu & Tanggal, Petugas POPT (nama + NIP), Lokasi & Wilayah, Komoditas, Jenis OPT, Luas (Ha), Tingkat Serangan, Status Verifikasi, Aksi Cepat; pencarian, tombol "Input Laporan", paginasi `1 2 3 … 75`.

### 4.2 Peta Sebaran & GIS OPT
- **Kepala halaman:** ikon peta hijau, judul "GIS & Peta Sebaran Spasial OPT", lencana `WGS84 EPSG:4326`, tiga lencana ringkas (titik bahaya kritis merah, titik waspada kuning, total Ha terdampak biru).
- **Dua kolom:** kiri panel "Filter Spasial & Komoditas" (empat langkah bernomor: wilayah bertingkat, komoditas dengan kotak centang dua kolom, tingkat keparahan dengan lencana zona, periode dengan tab Real-Time / Triwulan / Semester), tombol penuh "Terapkan Filter Spasial", lalu kartu "UPTD Wilayah … — n Pengamat Aktif". Kanan: peta Google dengan pemilih lapisan di kiri atas (Citra Satelit, Peta Tematik, Kontur Topografi).
- **Popup penanda:** header hijau tua dengan lencana zona (mis. "ZONA MERAH: EKSPLOSIF"), ID laporan, nama desa/kabupaten, koordinat; foto bertanda "Foto Geotagging"; kisi 2×2 (Komoditas, Hama/OPT, Luas Serangan, Intensitas); baris petugas + waktu; kotak "Rekomendasi Tindakan"; tombol "Detail Berita Acara" dan tombol navigasi arah.
- **Legenda tematik** di pojok bawah kanan peta; atribusi Google wajib terlihat dan tidak boleh ditutup.
- **Di bawah:** tabel "Rekapitulasi Wilayah Paling Rentan OPT" (Kabupaten/Wilayah, Kecamatan Terparah, Komoditas Utama, Nama OPT Dominan (miring untuk nama ilmiah), Luas Serangan, Status Ancaman berupa lencana, Tindakan Lapangan) dengan tombol "Unduh Geodata Excel" dan "Cetak Peta Spasial PDF".

### 4.3 Formulir Input Laporan
- **Kepala:** ikon hijau, kode formulir (mis. `SIPUT KALTIM · FORM-POPT-04`), judul "Formulir Laporan Pengamatan Serangan OPT Perkebunan", waktu input real-time (kanan), empat info petugas (NIP, nama, WKPP, status integritas data).
- **Dua kolom:** kiri lima kartu bernomor I–V; kanan (menempel) panel **Ringkasan Validasi (Live Preview)** dengan foto, lencana tingkat, ringkasan isian, kotak "Klasifikasi Bahaya OPT Kaltim", kartu kontak laboratorium, dan **Panduan Petugas POPT**. Pada ponsel panel kanan turun ke bawah form atau menjadi bagian lipat.
- **I Periode:** pilihan Triwulan, tombol Semester 1/2, Tahun Anggaran.
- **II Lokasi:** empat isian (Kabupaten/Kota, Kecamatan, Desa/Kelurahan, Nama Blok/Poktan), kotak koordinat (Lintang, Bujur), tombol "Ambil Koordinat Otomatis", peta pratinjau dengan pin.
- **III Komoditas & OPT:** tujuh ubin komoditas bergambar ikon (satu terpilih = hijau tua); pilihan Jenis Hama/OPT dengan lencana "Katalog Khusus Kaltim"; tiga tombol fase (TBM, TM, TTM/TR).
- **IV Luas & Intensitas:** empat kolom angka (Luas Pengamatan, Ringan, Berat, Terkendali) dengan satuan Ha; kartu hasil: cincin persen, lencana status, luas terdampak, "Kondisi Kebun: Sehat".
- **V Dokumentasi:** tiga slot foto (dua terisi, satu area unggah), tiga kotak teks rekomendasi (Kultur Teknis, Pengendalian Hayati, Kimiawi/Eradikasi).
- **Bilah aksi** di bawah (menempel di ponsel): teks "Laporan tersimpan otomatis dalam draf lokal browser", tombol Batal, Simpan Draf, dan **Simpan & Publikasikan GIS** (hijau).
- **Validasi:** galat inline di bawah field dan ringkasan di atas bilah aksi; field wajib bertanda `*`.

### 4.4 Rekapitulasi Triwulan & Semester
- **Banner hijau tua** di atas dengan judul "Rekapitulasi Triwulan, Semester & Pusat Ekspor Laporan" dan kartu "Sinkronisasi Data UPTD".
- **Kartu parameter:** tab Triwulan / Semester / Tahunan Penuh; empat pilihan (Tahun Anggaran, Pilihan Triwulan, Komoditas, Wilayah Kerja/UPTD); baris keterangan filter aktif; tombol "Reset Filter" dan "Terapkan Filter".
- **Pusat Ekspor:** tombol "Unduh Microsoft Excel" (hijau muda) dan "Cetak Berita Acara PDF" (hijau tua).
- **Empat kartu ringkasan:** Total Luas Amatan, Total Serangan OPT, Serangan Berat/Kritis, Pengendalian & Eradikasi, masing-masing dengan persen perubahan.
- **Matriks Kabupaten/Kota:** kolom No, Wilayah Administratif (+ kecamatan), Komoditas Utama, OPT Dominan, Luas Tanam, Ringan (Ha/%), Berat (Ha/%), Total Serangan, Pengendalian. Header kolom Ringan berlatar kuning, Berat berlatar merah muda. Baris akhir "Total Konsolidasi Provinsi" berlatar biru muda. Pencarian dan paginasi.
- **Dua grafik:** "Tren Fluktuasi Serangan per Komoditas" (garis per triwulan) dan "Proporsi Serangan Berat vs Ringan" (batang horizontal persen).
- **Dua kartu bawah:** "Standar Berita Acara" (lembar pratinjau bertanda "Resmi" pada desain; **pada Fase 1 label wajib "Simulasi"**) dan "Log Ekspor & Riwayat Unduhan" (Berkas, Format/Tipe, Petugas/Operator, Waktu Unduh, tombol unduh ulang).

### 4.5 Layar yang belum ada gambarnya
Data Komoditas & OPT, Ekspor Laporan, dan Manajemen Pengguna **tidak ada di gambar desain**. Bangun dengan komponen yang sama (kartu, tabel, form, lencana) tanpa menciptakan gaya baru. Daftar harus mengikuti PRD §5.6–§5.8.

## 5. Komponen

| Komponen | Aturan |
|---|---|
| **Kartu KPI** | Label huruf kapital kecil, angka besar tabular, satuan kecil, ikon di kanan atas dalam kotak berwarna pudar. |
| **Lencana tingkat** | Berat: `danger-100` + ikon peringatan + teks "Berat (Darurat)"; Sedang: `gold-100` + ikon segitiga + "Sedang (Waspada)"; Ringan: `ok-100` + ikon daun/centang + "Ringan". Teks selalu ada. |
| **Lencana status verifikasi** | Menunggu Validasi, Terverifikasi, Ditolak (merah muda). Ikon + teks. |
| **Tabel** | Header huruf kapital kecil, baris dengan jarak lega, *zebra* tidak wajib; paginasi "Menampilkan a–b dari n"; pada ponsel jadi kartu. |
| **Tombol** | Utama `brand-900` teks putih; sekunder berlatar `brand-100`; bahaya `danger-600`. Tinggi ≥ 44 px pada ponsel. Status *loading* dan *disabled* wajib ada. |
| **Toast** | Empat jenis: sukses (hijau), gagal (merah, memuat penyebab dan tombol "Coba lagi"), peringatan (kuning), info (biru). Muncul pojok kanan atas desktop, atas-tengah ponsel; dapat ditutup; `role="status"`/`alert`. |
| **Pusat notifikasi** | Ikon lonceng dengan titik merah bila ada belum dibaca; daftar laporan baru, peringatan eksplosif, menunggu validasi. |
| **Peta** | Pembungkus tunggal `<PetaOPT>`; lapisan, *clustering*, popup, dan legenda ada di dalamnya. Penanda: lingkaran berwarna dengan simbol berbeda per tingkat (agar tidak hanya bergantung warna). |
| **Grafik** | Seri total = hijau, berat = merah; tooltip menampilkan nilai berformat Indonesia; sediakan ringkasan teks atau tabel alternatif untuk pembaca layar. |
| **Banner simulasi** | Pita tipis di atas konten: "DATA SIMULASI — bukan data resmi" selama Fase 1. |
| **Keadaan kosong/galat/muat** | Setiap daftar, grafik, dan peta punya kerangka *skeleton*, pesan kosong, dan pesan galat berbahasa Indonesia. |

## 6. Bahasa dan Format

- Seluruh teks Bahasa Indonesia. Istilah baku: Ha, WITA, POPT, UPTD, OPT, TBM/TM/TTM-TR.
- Angka: titik ribuan, koma desimal (`3.840,50 Ha`); persen `18,8%`.
- Tanggal `5 Nov 2026`; tanggal panjang `Kamis, 05 Nov 2026`; waktu `14:14:09 WITA`.
- Nama ilmiah OPT ditulis miring (*Ganoderma boninense*).
- Nama komoditas baku: Lada, Kelapa Sawit, Kakao, Karet, Aren, Kelapa Dalam, Kopi.

## 7. Ketidakkonsistenan pada Gambar (jangan ditiru)

| Temuan | Perlakuan |
|---|---|
| Logo tampil sebagai placeholder rusak "logo" | Minta berkas resmi; sementara pakai placeholder netral bertanda |
| Rekap menampilkan "2025 (Tahun Berjalan)" dan "TW 3 2024" sementara tanggal sistem 2026 | Tahun dan triwulan bawaan diambil dari tanggal sistem |
| Form menampilkan "Tahun Anggaran 2025 (Tahun Berjalan)" | Sama seperti di atas |
| "10/10 Kab/Kota" vs "8 Kab/Kota" vs 8 baris matriks | Satu daftar wilayah dari data (lihat PRD §14 no. 2) |
| Komoditas digabung ("Kelapa / Aren / Kopi", "Aren & Kopi") dan "Lada Malonan Kaltim" | Tujuh komoditas terpisah dengan nama baku |
| 18,8% berlabel "Sedang / Waspada" sedangkan ambang GIS menyebut < 25% = Ringan | Ikuti konfigurasi ambang; lihat PRD §14 no. 1 |
| Bagian "Standar Berita Acara" berlabel "Resmi" lengkap dengan barcode dan e-Sign | Tampilkan "Simulasi" pada Fase 1 |
| Versi "v2.4.0" | Ambil dari `package.json` |

## 8. Aksesibilitas (ringkas)

Kontras AA; label untuk setiap input; urutan tab logis; fokus terlihat; ikon dekoratif `aria-hidden`; tombol ikon punya `aria-label`; status tidak hanya bergantung pada warna; dukung `prefers-reduced-motion` (matikan animasi grafik dan transisi panel).
