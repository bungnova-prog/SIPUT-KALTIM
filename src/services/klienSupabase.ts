import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let instansKlien: SupabaseClient | null = null;

function ambilEnvPublik(nama: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const nilai = import.meta.env[nama];
  return typeof nilai === 'string' ? nilai.trim() : '';
}

/**
 * Memeriksa apakah variabel publik VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
 * telah diisi pada berkas .env lokal / konfigurasi Cloudflare Pages (SECURITY.md §2 & §3).
 */
export function apakahKonfigurasiSupabaseLengkap(): boolean {
  const url = ambilEnvPublik('VITE_SUPABASE_URL');
  const anonKey = ambilEnvPublik('VITE_SUPABASE_ANON_KEY');
  if (!url || !anonKey) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Mengembalikan instans tunggal SupabaseClient yang memakai anon key publik.
 * Melempar Error berbahasa Indonesia apabila konfigurasi .env belum lengkap.
 */
export function ambilKlienSupabase(): SupabaseClient {
  if (instansKlien) return instansKlien;

  const url = ambilEnvPublik('VITE_SUPABASE_URL');
  const anonKey = ambilEnvPublik('VITE_SUPABASE_ANON_KEY');

  if (!apakahKonfigurasiSupabaseLengkap()) {
    throw new Error(
      'Konfigurasi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY belum lengkap pada lingkungan aplikasi.'
    );
  }

  instansKlien = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return instansKlien;
}
