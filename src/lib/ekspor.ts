/**
 * CATATAN KEAMANAN RANTAI PASOK (SECURITY.md §10):
 * Paket `xlsx` dipakai MURNI HANYA-TULIS (`aoa_to_sheet`, `book_new`, `writeFile`) dari array memori tervalidasi.
 * DILARANG KERAS memanggil `XLSX.read` atau `XLSX.readFile` pada berkas unggahan pengguna untuk mencegah
 * paparan kerentanan parser pihak ketiga. Pemanggilan dari UI wajib melalui `eksporService` di `src/services/`
 * agar setiap unduhan otomatis tercatat di `logEksporRepository`.
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  BarisKerentananWilayah,
  BarisMatriksKabupaten,
  Laporan,
  ProfilPengguna,
  RingkasanRekap,
} from '../types/domain';
import {
  formatAngka,
  formatPersen,
  formatTanggalWaktu,
  tampilkanNipSesuaiPeran,
} from './format';
import { netralkanSelExcel } from './sanitasi';

function buatStempelBerkas(d: Date = new Date()): string {
  const bagian = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const ambil = (tipe: string) => bagian.find((b) => b.type === tipe)?.value ?? '00';
  return `${ambil('year')}${ambil('month')}${ambil('day')}-${ambil('hour')}${ambil('minute')}`;
}

/**
 * Ekspor daftar laporan observasi / geodata ke berkas Microsoft Excel (.xlsx)
 * dengan netralisasi injeksi rumus dan penyamaran NIP sesuai peran.
 */
export function unduhExcelLaporan(
  daftar: Laporan[],
  peminta: ProfilPengguna,
  filterRingkas: string,
  tipe: 'observasi' | 'geodata' = 'observasi'
): string {
  const barisHeaderInfo = [
    ['DOKUMEN DATA SIMULASI — BUKAN DATA RESMI PEMPROV KALTIM'],
    ['Sistem Informasi Pelaporan OPT (SIPUT-KALTIM)'],
    [`Filter Aktif: ${netralkanSelExcel(filterRingkas)}`],
    [`Diunduh Oleh: ${netralkanSelExcel(peminta.nama)} (${peminta.peran.toUpperCase()})`],
    [`Waktu Unduh: ${formatTanggalWaktu(new Date())}`],
    [],
  ];

  const kolom = [
    'Kode Laporan',
    'Tanggal & Waktu (WITA)',
    'Tahun',
    'Triwulan',
    'Semester',
    'Kabupaten/Kota',
    'Kecamatan',
    'Desa/Kelurahan',
    'Blok / Poktan',
    'Lintang (WGS84)',
    'Bujur (WGS84)',
    'Komoditas',
    'OPT Lokal',
    'Nama Ilmiah OPT',
    'Fase Tanaman',
    'Luas Pengamatan (Ha)',
    'Luas Ringan (Ha)',
    'Luas Berat (Ha)',
    'Luas Terkendali (Ha)',
    'Intensitas (%)',
    'Tingkat Serangan',
    'Status Verifikasi',
    'Petugas POPT (Simulasi)',
    'Identitas/NIP Simulasi',
  ];

  const isi = daftar.map((item) => [
    netralkanSelExcel(item.kode),
    netralkanSelExcel(formatTanggalWaktu(item.dibuatPada)),
    item.tahun,
    `TW ${item.triwulan}`,
    `Semester ${item.semester}`,
    netralkanSelExcel(item.namaKabupaten),
    netralkanSelExcel(item.namaKecamatan),
    netralkanSelExcel(item.namaDesa),
    netralkanSelExcel(item.namaBlok),
    item.lat,
    item.lng,
    netralkanSelExcel(item.namaKomoditas),
    netralkanSelExcel(item.namaOptLokal),
    netralkanSelExcel(item.namaOptIlmiah),
    netralkanSelExcel(item.faseTanaman.toUpperCase()),
    item.luasAmatan,
    item.luasRingan,
    item.luasBerat,
    item.luasTerkendali,
    item.intensitasPersen,
    netralkanSelExcel(item.tingkat.toUpperCase()),
    netralkanSelExcel(item.status.toUpperCase()),
    netralkanSelExcel(item.namaPetugas),
    netralkanSelExcel(
      tampilkanNipSesuaiPeran(item.nipPetugas, item.petugasId, item.kabupatenId, peminta)
    ),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...barisHeaderInfo, kolom, ...isi]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    ws,
    tipe === 'geodata' ? 'Geodata_OPT_Simulasi' : 'Observasi_Simulasi'
  );

  const awalan = tipe === 'geodata' ? 'SIPUT-Geodata-Spasial' : 'SIPUT-Observasi-OPT';
  const namaBerkas = `${awalan}-SIMULASI-${buatStempelBerkas()}.xlsx`;
  XLSX.writeFile(wb, namaBerkas);
  return namaBerkas;
}

/**
 * Ekspor matriks Rekapitulasi Kabupaten/Kota ke Microsoft Excel (.xlsx).
 */
export function unduhExcelMatriksRekap(
  matriks: BarisMatriksKabupaten[],
  ringkasan: RingkasanRekap,
  peminta: ProfilPengguna,
  filterRingkas: string
): string {
  const atas = [
    ['DATA SIMULASI — REKAPITULASI SERANGAN OPT PERKEBUNAN KALTIM (BUKAN RESMI)'],
    [`Parameter Filter: ${netralkanSelExcel(filterRingkas)}`],
    [`Pengunduh: ${netralkanSelExcel(peminta.nama)} (${peminta.peran.toUpperCase()})`],
    [`Waktu Cetak: ${formatTanggalWaktu(new Date())}`],
    [],
    [
      'No',
      'Wilayah Administratif',
      'Kecamatan Terpantau',
      'Komoditas Utama',
      'OPT Dominan',
      'Nama Ilmiah',
      'Luas Amatan (Ha)',
      'Ringan (Ha)',
      'Ringan (%)',
      'Berat (Ha)',
      'Berat (%)',
      'Total Serangan (Ha)',
      'Pengendalian (Ha)',
    ],
  ];

  const barisData = matriks.map((m) => [
    m.no,
    netralkanSelExcel(m.namaKabupaten),
    netralkanSelExcel(m.daftarKecamatan),
    netralkanSelExcel(m.komoditasUtama),
    netralkanSelExcel(m.optDominanLokal),
    netralkanSelExcel(m.optDominanIlmiah),
    m.luasAmatan,
    m.luasRingan,
    m.persenRingan,
    m.luasBerat,
    m.persenBerat,
    m.totalSerangan,
    m.luasTerkendali,
  ]);

  const barisTotal = [
    '',
    'TOTAL KONSOLIDASI PROVINSI (SIMULASI)',
    `${ringkasan.jumlahKabupatenTerdampak} Kab/Kota`,
    netralkanSelExcel(ringkasan.komoditasUtama),
    netralkanSelExcel(ringkasan.optDominan),
    '-',
    ringkasan.totalLuasAmatan,
    ringkasan.totalLuasRinganSedang,
    ringkasan.totalLuasAmatan > 0
      ? Math.round((ringkasan.totalLuasRinganSedang / ringkasan.totalLuasAmatan) * 1000) / 10
      : 0,
    ringkasan.totalLuasBerat,
    ringkasan.totalLuasAmatan > 0
      ? Math.round((ringkasan.totalLuasBerat / ringkasan.totalLuasAmatan) * 1000) / 10
      : 0,
    ringkasan.totalLuasTerdampak,
    ringkasan.totalLuasTerkendali,
  ];

  const ws = XLSX.utils.aoa_to_sheet([...atas, ...barisData, barisTotal]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_KabKota_Simulasi');

  const namaBerkas = `SIPUT-Rekapitulasi-SIMULASI-${buatStempelBerkas()}.xlsx`;
  XLSX.writeFile(wb, namaBerkas);
  return namaBerkas;
}

/**
 * Ekspor PDF Berita Acara / Ringkasan Spasial dengan penanda jelas "SIMULASI — BUKAN DOKUMEN RESMI".
 * Tidak memuat nomor surat resmi, barcode, atau tanda tangan elektronik asli (AGENTS.md §3.7, SECURITY.md §11).
 */
export function unduhPdfRekapitulasi(
  matriks: BarisMatriksKabupaten[],
  ringkasan: RingkasanRekap,
  peminta: ProfilPengguna,
  filterRingkas: string,
  judulDokumen = 'BERITA ACARA SIMULASI REKAPITULASI SERANGAN OPT'
): string {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Pita peringatan simulasi di bagian paling atas
  doc.setFillColor(253, 227, 227);
  doc.rect(14, 10, 269, 9, 'F');
  doc.setTextColor(200, 22, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    'DOKUMEN SIMULASI FASE 1 — BUKAN DOKUMEN RESMI & TANPA PENGESAHAN ELEKTRONIK',
    148.5,
    16,
    { align: 'center' }
  );

  doc.setTextColor(11, 74, 34);
  doc.setFontSize(14);
  doc.text('SIPUT-KALTIM — DINAS PERKEBUNAN PROVINSI KALIMANTAN TIMUR (SIMULASI)', 14, 27);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.text(judulDokumen, 14, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(`Filter Aktif: ${filterRingkas}`, 14, 40);
  doc.text(
    `Dicetak Oleh: ${peminta.nama} (${peminta.peran.toUpperCase()}) · Waktu: ${formatTanggalWaktu(new Date())}`,
    14,
    45
  );
  doc.text(
    `Ringkasan: ${ringkasan.totalLaporan} Laporan | Luas Amatan: ${formatAngka(ringkasan.totalLuasAmatan, 2, 2)} Ha | Total Serangan: ${formatAngka(ringkasan.totalLuasTerdampak, 2, 2)} Ha | Berat: ${formatAngka(ringkasan.totalLuasBerat, 2, 2)} Ha`,
    14,
    50
  );

  autoTable(doc, {
    startY: 55,
    head: [
      [
        'No',
        'Kabupaten/Kota',
        'Komoditas Utama',
        'OPT Dominan',
        'Luas Amatan (Ha)',
        'Ringan (Ha / %)',
        'Berat (Ha / %)',
        'Total Serangan (Ha)',
        'Terkendali (Ha)',
      ],
    ],
    body: matriks.map((m) => [
      String(m.no),
      m.namaKabupaten,
      m.komoditasUtama,
      `${m.optDominanLokal} (${m.optDominanIlmiah})`,
      formatAngka(m.luasAmatan, 2, 2),
      `${formatAngka(m.luasRingan, 2, 2)} (${formatPersen(m.persenRingan)})`,
      `${formatAngka(m.luasBerat, 2, 2)} (${formatPersen(m.persenBerat)})`,
      formatAngka(m.totalSerangan, 2, 2),
      formatAngka(m.luasTerkendali, 2, 2),
    ]),
    foot: [
      [
        '',
        'TOTAL KONSOLIDASI (SIMULASI)',
        ringkasan.komoditasUtama,
        ringkasan.optDominan,
        formatAngka(ringkasan.totalLuasAmatan, 2, 2),
        formatAngka(ringkasan.totalLuasRinganSedang, 2, 2),
        formatAngka(ringkasan.totalLuasBerat, 2, 2),
        formatAngka(ringkasan.totalLuasTerdampak, 2, 2),
        formatAngka(ringkasan.totalLuasTerkendali, 2, 2),
      ],
    ],
    headStyles: { fillColor: [11, 74, 34], textColor: [255, 255, 255], fontSize: 8 },
    footStyles: { fillColor: [227, 236, 251], textColor: [17, 24, 39], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  const posisiAkhirY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 155;
  const kotakY = Math.min(posisiAkhirY + 8, 182);
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(
    'Catatan Pengesahan: Dokumen ini adalah pratinjau SIMULASI aplikasi Fase 1. Nomor surat, tanda tangan elektronik, dan barcode resmi tidak diterbitkan.',
    14,
    kotakY
  );

  const namaBerkas = `SIPUT-BeritaAcara-SIMULASI-${buatStempelBerkas()}.pdf`;
  doc.save(namaBerkas);
  return namaBerkas;
}

export function unduhPdfKerentananSpasial(
  kerentanan: BarisKerentananWilayah[],
  peminta: ProfilPengguna,
  filterRingkas: string
): string {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFillColor(253, 227, 227);
  doc.rect(14, 10, 269, 9, 'F');
  doc.setTextColor(200, 22, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    'PETA & REKAP SPASIAL SIMULASI — BUKAN DOKUMEN RESMI PEMERINTAH',
    148.5,
    16,
    { align: 'center' }
  );

  doc.setTextColor(11, 74, 34);
  doc.setFontSize(13);
  doc.text('REKAPITULASI WILAYAH PALING RENTAN OPT (WGS84 EPSG:4326 — SIMULASI)', 14, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(`Filter Spasial: ${filterRingkas}`, 14, 34);
  doc.text(
    `Dicetak Oleh: ${peminta.nama} (${peminta.peran.toUpperCase()}) · ${formatTanggalWaktu(new Date())}`,
    14,
    39
  );

  autoTable(doc, {
    startY: 44,
    head: [
      [
        'Kabupaten/Kota',
        'Kecamatan Terparah',
        'Komoditas Utama',
        'OPT Dominan (Ilmiah)',
        'Luas Serangan (Ha)',
        'Intensitas Rata-Rata',
        'Status Ancaman',
        'Tindakan Lapangan',
      ],
    ],
    body: kerentanan.map((k) => [
      k.namaKabupaten,
      k.kecamatanTerparah,
      k.komoditasUtama,
      `${k.namaOptLokal} (${k.namaOptIlmiah})`,
      formatAngka(k.luasSerangan, 2, 2),
      formatPersen(k.intensitasRata),
      k.tingkatAncaman.toUpperCase(),
      k.tindakanLapangan,
    ]),
    headStyles: { fillColor: [11, 74, 34], textColor: [255, 255, 255], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  const namaBerkas = `SIPUT-PetaSpasial-SIMULASI-${buatStempelBerkas()}.pdf`;
  doc.save(namaBerkas);
  return namaBerkas;
}
