// ============================================================================
// Edge Function: undang-pengguna (SECURITY.md §5.3 & SCHEMA.md §5)
// Berjalan di sisi server Supabase Edge Runtime (Deno).
// Memeriksa JWT pemanggil & memastikan peran = 'admin' sebelum memakai
// SUPABASE_SERVICE_ROLE_KEY untuk mengundang akun & membuat baris profiles.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const headerCors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PayloadUndang {
  email?: string;
  nama?: string;
  nip?: string | null;
  jabatan?: string;
  peran?: 'admin' | 'operator' | 'petugas';
  wilayahId?: string | null;
  wkpp?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: headerCors });
  }

  if (req.method !== 'POST') {
    return Response.json(
      { ok: false, pesan: 'Metode HTTP tidak diizinkan.' },
      { status: 405, headers: headerCors }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json(
      { ok: false, pesan: 'Konfigurasi lingkungan Edge Function belum lengkap.' },
      { status: 500, headers: headerCors }
    );
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return Response.json(
      { ok: false, pesan: 'Token autentikasi tidak ditemukan.' },
      { status: 401, headers: headerCors }
    );
  }

  // 1. Verifikasi JWT pemanggil memakai anon client + Authorization header
  const klienPemanggil = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: galatAuth,
  } = await klienPemanggil.auth.getUser();

  if (galatAuth || !user) {
    return Response.json(
      { ok: false, pesan: 'Sesi login tidak valid atau telah berakhir.' },
      { status: 401, headers: headerCors }
    );
  }

  // 2. Pastikan pemanggil adalah Admin Provinsi aktif
  const klienAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profilPemanggil, error: galatProfil } = await klienAdmin
    .from('profiles')
    .select('id, peran, aktif')
    .eq('id', user.id)
    .single();

  if (galatProfil || !profilPemanggil || !profilPemanggil.aktif || profilPemanggil.peran !== 'admin') {
    return Response.json(
      { ok: false, pesan: 'Akses ditolak. Hanya Admin Provinsi aktif yang dapat mengundang pengguna.' },
      { status: 403, headers: headerCors }
    );
  }

  // 3. Validasi payload masukan
  let body: PayloadUndang;
  try {
    body = (await req.json()) as PayloadUndang;
  } catch {
    return Response.json(
      { ok: false, pesan: 'Format JSON permintaan tidak valid.' },
      { status: 400, headers: headerCors }
    );
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const nama = (body.nama ?? '').trim();
  const nip = body.nip?.trim() ? body.nip.trim() : null;
  const jabatan = (body.jabatan ?? '').trim() || 'Petugas Proteksi Perkebunan';
  const peran = body.peran;
  const wilayahId = peran === 'admin' ? null : (body.wilayahId ?? null);
  const wkpp = (body.wkpp ?? '').trim() || (peran === 'admin' ? 'Provinsi Kalimantan Timur' : 'Wilayah Kerja Kabupaten/Kota');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { ok: false, pesan: 'Alamat email dinas tidak valid.' },
      { status: 400, headers: headerCors }
    );
  }

  if (nama.length < 3) {
    return Response.json(
      { ok: false, pesan: 'Nama lengkap minimal 3 karakter.' },
      { status: 400, headers: headerCors }
    );
  }

  if (!peran || !['admin', 'operator', 'petugas'].includes(peran)) {
    return Response.json(
      { ok: false, pesan: 'Peran pengguna tidak valid.' },
      { status: 400, headers: headerCors }
    );
  }

  if (peran !== 'admin' && !wilayahId) {
    return Response.json(
      { ok: false, pesan: 'Wilayah kerja Kabupaten/Kota wajib dipilih untuk Operator atau Petugas.' },
      { status: 400, headers: headerCors }
    );
  }

  // 4. Kirim undangan melalui Supabase Auth Admin API
  const { data: hasilUndang, error: galatUndang } =
    await klienAdmin.auth.admin.inviteUserByEmail(email, {
      data: { nama, peran },
    });

  if (galatUndang || !hasilUndang.user) {
    return Response.json(
      {
        ok: false,
        pesan: galatUndang?.message
          ? `Gagal mengirim undangan email: ${galatUndang.message}`
          : 'Gagal membuat akun pengguna pada Supabase Auth.',
      },
      { status: 400, headers: headerCors }
    );
  }

  // 5. Simpan baris profil pada public.profiles
  const { data: barisProfil, error: galatSimpanProfil } = await klienAdmin
    .from('profiles')
    .upsert({
      id: hasilUndang.user.id,
      nama,
      nip,
      jabatan,
      peran,
      wilayah_id: wilayahId,
      wkpp,
      aktif: true,
    })
    .select('id, nama, nip, jabatan, peran, wilayah_id, wkpp, aktif')
    .single();

  if (galatSimpanProfil || !barisProfil) {
    return Response.json(
      {
        ok: false,
        pesan: 'Akun Auth dibuat tetapi gagal menyimpan profil pengguna. Periksa keunikan NIP.',
      },
      { status: 400, headers: headerCors }
    );
  }

  return Response.json(
    { ok: true, data: barisProfil },
    { status: 200, headers: headerCors }
  );
});
