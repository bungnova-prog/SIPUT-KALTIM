#!/usr/bin/env node
// ============================================================================
// Pemeriksaan kesiapan deploy Cloudflare Pages (SECURITY.md §12).
// Jalankan setelah `npm run build`:  npm run periksa:deploy
// Skrip ini TIDAK membaca berkas .env. Nilai hanya diambil dari process.env
// (di Cloudflare Pages sudah tersedia saat build).
// ============================================================================

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const akar = process.cwd();
const masalah = [];
const peringatan = [];
const lolos = [];

async function ada(rel) {
  try {
    await stat(path.join(akar, rel));
    return true;
  } catch {
    return false;
  }
}

async function baca(rel) {
  return readFile(path.join(akar, rel), 'utf8');
}

async function kumpulkanBerkas(rel, ekstensi) {
  const hasil = [];
  const entri = await readdir(path.join(akar, rel), { withFileTypes: true });
  for (const e of entri) {
    const anak = path.posix.join(rel, e.name);
    if (e.isDirectory()) {
      hasil.push(...(await kumpulkanBerkas(anak, ekstensi)));
    } else if (ekstensi.some((ext) => e.name.endsWith(ext))) {
      hasil.push(anak);
    }
  }
  return hasil;
}

// --- 1. Hasil build ---------------------------------------------------------
for (const berkas of ['dist/index.html', 'dist/_headers', 'dist/_redirects']) {
  if (await ada(berkas)) {
    lolos.push(`${berkas} tersedia`);
  } else {
    masalah.push(
      `${berkas} tidak ditemukan. Jalankan \`npm run build\` lebih dulu; pastikan berkas di public/ ikut tersalin.`
    );
  }
}

// --- 2. _redirects untuk SPA ------------------------------------------------
if (await ada('dist/_redirects')) {
  const isi = await baca('dist/_redirects');
  if (/^\s*\/\*\s+\/index\.html\s+200\s*$/m.test(isi)) {
    lolos.push('_redirects memuat fallback SPA /* /index.html 200');
  } else {
    masalah.push('_redirects tidak memuat aturan SPA `/* /index.html 200`; rute dalam akan 404 saat dimuat ulang.');
  }
}

// --- 3. Header keamanan -----------------------------------------------------
if (await ada('dist/_headers')) {
  const isi = await baca('dist/_headers');
  const wajib = [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy:',
    "frame-ancestors 'none'",
  ];
  for (const header of wajib) {
    if (isi.includes(header)) {
      lolos.push(`Header ${header} tersedia`);
    } else {
      masalah.push(`Header keamanan "${header}" tidak ditemukan di public/_headers.`);
    }
  }
  if (/https?:\/\/\*\.supabase\.co/.test(isi)) {
    peringatan.push(
      'CSP memakai wildcard *.supabase.co. SECURITY.md §8 mewajibkan hanya domain proyek Supabase Anda.'
    );
  }
}

// --- 4. Variabel lingkungan Supabase vs CSP ---------------------------------
const urlSupabase = (process.env.VITE_SUPABASE_URL ?? '').trim();
const anonSupabase = (process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

if (!urlSupabase || !anonSupabase) {
  peringatan.push(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tidak terbaca di lingkungan ini. ' +
      'Keduanya wajib diisi di Cloudflare Pages (Production dan Preview); tanpa itu halaman masuk tidak dapat dipakai.'
  );
} else {
  lolos.push('VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terbaca');
  let host = '';
  try {
    host = new URL(urlSupabase).hostname;
  } catch {
    masalah.push('VITE_SUPABASE_URL bukan URL yang valid.');
  }
  if (host && (await ada('dist/_headers'))) {
    const isi = await baca('dist/_headers');
    if (isi.includes(`https://${host}`) && isi.includes(`wss://${host}`)) {
      lolos.push(`CSP memuat domain Supabase ${host} (https dan wss)`);
    } else {
      masalah.push(
        `CSP di public/_headers belum memuat https://${host} dan wss://${host} pada connect-src. ` +
          'Login, Realtime, dan unggah foto akan diblokir. Lihat komentar di bagian atas berkas tersebut.'
      );
    }
  }
}

// --- 5. Pola terlarang di kode sumber ---------------------------------------
for (const berkas of await kumpulkanBerkas('src', ['.ts', '.tsx'])) {
  const isi = await baca(berkas);
  if (isi.includes('dangerouslySetInnerHTML')) {
    masalah.push(`${berkas} memakai dangerouslySetInnerHTML (dilarang SECURITY.md §7).`);
  }
  if (/\beval\s*\(/.test(isi)) {
    masalah.push(`${berkas} memakai eval() (dilarang SECURITY.md §7).`);
  }
}

// --- 6. Rahasia tidak ikut terbundel ----------------------------------------
if (await ada('dist/assets')) {
  for (const berkas of await kumpulkanBerkas('dist/assets', ['.js'])) {
    const isi = await baca(berkas);
    if (isi.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      masalah.push(`${berkas} memuat nama SUPABASE_SERVICE_ROLE_KEY; periksa kebocoran rahasia ke bundel.`);
    }
  }
}

// --- 7. .gitignore ----------------------------------------------------------
if (await ada('.gitignore')) {
  const isi = await baca('.gitignore');
  const baris = isi.split(/\r?\n/).map((b) => b.trim());
  if (baris.includes('.env') && baris.includes('!.env.example')) {
    lolos.push('.gitignore mengecualikan .env dan mempertahankan .env.example');
  } else {
    masalah.push('.gitignore wajib memuat `.env` dan `!.env.example` (SECURITY.md §3).');
  }
} else {
  masalah.push('.gitignore tidak ditemukan; rahasia .env dapat ikut ter-commit.');
}

// --- 8. Google Maps ---------------------------------------------------------
if (!(process.env.VITE_GOOGLE_MAPS_KEY ?? '').trim()) {
  peringatan.push(
    'VITE_GOOGLE_MAPS_KEY kosong. Peta memakai kanvas simulasi (aman), bukan Google Maps. ' +
      'Isi kunci terbatas referrer di Cloudflare Pages bila peta nyata diperlukan.'
  );
} else {
  lolos.push('VITE_GOOGLE_MAPS_KEY terisi (pastikan pembatasan HTTP referrer & API aktif)');
}

// --- Ringkasan --------------------------------------------------------------
function cetak(daftar, tanda) {
  for (const item of daftar) console.log(`${tanda} ${item}`);
}

console.log('\nPemeriksaan kesiapan deploy SIPUT-KALTIM\n');
cetak(lolos, '✓');
cetak(peringatan, '⚠');
cetak(masalah, '✗');

console.log(
  `\nRingkasan: ${lolos.length} lolos, ${peringatan.length} peringatan, ${masalah.length} masalah.\n`
);

if (masalah.length > 0) {
  console.error('Deploy belum aman. Perbaiki masalah di atas lalu ulangi.\n');
  process.exit(1);
}

if (peringatan.length > 0) {
  console.log('Tidak ada penghalang build. Tinjau peringatan sebelum menyatakan siap produksi.\n');
}
