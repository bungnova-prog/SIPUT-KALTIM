import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../lib/storeAplikasi';
import { authService } from '../services';
import logoKaltim from '../assets/logo-kaltim.png';
import ilustrasiPopt from '../assets/ilustrasi-popt.png';

export default function HalamanMasuk() {
  const navigate = useNavigate();
  const { setelProfilTerautentikasi, tambahToast } = useAppStore();

  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [sedangMemproses, setSedangMemproses] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const konfigLengkap = authService.statusKonfigurasi().lengkap;

  const tanganiMasuk = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPesanGalat(null);

    if (!email.trim() || !kataSandi) {
      setPesanGalat('Alamat email dinas dan kata sandi wajib diisi.');
      return;
    }

    setSedangMemproses(true);
    const hasil = await authService.masukDenganEmailSandi(email, kataSandi);
    setSedangMemproses(false);

    if (!hasil.ok) {
      setPesanGalat(hasil.pesan);
      return;
    }

    setelProfilTerautentikasi(hasil.data);
    tambahToast({
      jenis: 'sukses',
      judul: 'Autentikasi Berhasil',
      pesan: `Selamat datang, ${hasil.data.nama} (${hasil.data.namaWilayah}).`,
    });
    navigate('/dashboard', { replace: true });
  };

  const tanganiMasukSimulasi = async (peran: 'admin' | 'operator' | 'petugas') => {
    if (!authService.masukSebagaiSimulasi) return;
    setPesanGalat(null);
    setSedangMemproses(true);
    const hasil = await authService.masukSebagaiSimulasi(peran);
    setSedangMemproses(false);

    if (!hasil.ok) {
      setPesanGalat(hasil.pesan);
      return;
    }

    setelProfilTerautentikasi(hasil.data);
    tambahToast({
      jenis: 'sukses',
      judul: 'Mode Simulasi Aktif',
      pesan: `Selamat datang, ${hasil.data.nama} (${hasil.data.namaWilayah}).`,
    });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-canvas px-4 py-6 text-ink-900 sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-4">
        <div className="grid w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-sm lg:grid-cols-12">
          {/* Panel Identitas Instansi (Kiri) */}
          <section className="flex flex-col justify-between bg-brand-900 p-6 text-surface sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={logoKaltim}
                  alt="Logo Pemprov Kalimantan Timur Ruhui Rahayu"
                  className="h-14 w-auto shrink-0 object-contain drop-shadow"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold tracking-tight">SIPUT</span>
                    <span className="rounded bg-gold-500 px-2 py-0.5 text-xs font-bold text-ink-900">
                      KALTIM
                    </span>
                  </div>
                  <p className="text-xs text-brand-100">
                    Dinas Perkebunan Provinsi Kalimantan Timur
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-extrabold leading-snug sm:text-3xl">
                Sistem Informasi Pelaporan OPT
              </h1>
              <p className="mt-2.5 text-xs leading-relaxed text-brand-100 sm:text-sm">
                Pemantauan, pemetaan geospasial WGS 84, dan rekapitulasi serangan Organisme
                Pengganggu Tumbuhan (OPT) terintegrasi untuk Admin Provinsi, Operator UPTD, dan
                Petugas POPT Lapangan.
              </p>
            </div>

            {/* Ilustrasi Petugas POPT Lapangan */}
            <div className="my-5 flex flex-col items-center justify-center text-center">
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-brand-700/60 bg-black/40 shadow-xl transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src={ilustrasiPopt}
                  alt="Ilustrasi Gerakan Pengendalian OPT Perkebunan Kalimantan Timur"
                  className="h-auto w-full object-cover"
                />
              </div>
              <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-brand-100">
                Gerakan Bersama Pengendalian OPT Perkebunan Kalimantan Timur
              </p>
            </div>

            <div className="mt-4 space-y-2.5 rounded-xl border border-brand-700 bg-brand-700/40 p-4 text-xs">
              <p className="flex items-center gap-2 font-bold text-surface">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                <span>Otorisasi Berbasis Row Level Security (RLS)</span>
              </p>
              <p className="leading-relaxed text-brand-100">
                Hak akses baca dan tulis ditegakkan di tingkat basis data sesuai peran serta
                wilayah kerja Kabupaten/Kota masing-masing akun.
              </p>
            </div>
          </section>

          {/* Panel Formulir Login (Kanan) */}
          <section className="p-6 sm:p-8 lg:col-span-7">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-900">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                <span>Portal Terautentikasi · Versi {__APP_VERSION__}</span>
              </span>
              <h2 className="mt-3 text-xl font-extrabold text-ink-900 sm:text-2xl">
                Masuk ke Akun Petugas / Pejabat
              </h2>
              <p className="mt-1 text-xs text-ink-600 sm:text-sm">
                Gunakan alamat email dinas dan kata sandi yang didaftarkan oleh Admin Provinsi.
              </p>
            </div>

            {!konfigLengkap && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold-500 bg-gold-100 p-3.5 text-xs text-ink-900"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ink-900" aria-hidden />
                <div>
                  <p className="font-bold">Konfigurasi Lingkungan Supabase Belum Terbaca</p>
                  <p className="mt-0.5 leading-relaxed">
                    Pastikan berkas <code className="font-mono font-bold">.env</code> lokal memuat{' '}
                    <code className="font-mono font-bold">VITE_SUPABASE_URL</code> dan{' '}
                    <code className="font-mono font-bold">VITE_SUPABASE_ANON_KEY</code> proyek
                    Supabase Anda, lalu jalankan ulang server Vite.
                  </p>
                </div>
              </div>
            )}

            {pesanGalat && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-danger-600 bg-danger-100 p-3.5 text-xs font-semibold text-danger-600"
              >
                {pesanGalat}
              </div>
            )}

            <form
              onSubmit={(e) => {
                void tanganiMasuk(e);
              }}
              className="mt-5 space-y-4"
              noValidate
            >
              <div>
                <label
                  htmlFor="masuk-email"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                >
                  Alamat Email Dinas <span className="text-danger-600">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
                    aria-hidden
                  />
                  <input
                    id="masuk-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@disbun.kaltimprov.go.id"
                    className="min-h-[44px] w-full rounded-xl border border-line bg-canvas pl-10 pr-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/60 focus:border-brand-700"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="masuk-sandi"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                >
                  Kata Sandi <span className="text-danger-600">*</span>
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
                    aria-hidden
                  />
                  <input
                    id="masuk-sandi"
                    type={lihatSandi ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                    placeholder="Masukkan kata sandi akun..."
                    className="min-h-[44px] w-full rounded-xl border border-line bg-canvas pl-10 pr-12 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/60 focus:border-brand-700"
                  />
                  <button
                    type="button"
                    onClick={() => setLihatSandi((v) => !v)}
                    aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute right-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-600 hover:text-ink-900"
                  >
                    {lihatSandi ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={sedangMemproses}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                <span>{sedangMemproses ? 'Memverifikasi Kredensial...' : 'Masuk ke SIPUT-KALTIM'}</span>
              </button>
            </form>

            {/* Opsi Masuk Cepat / Mode Simulasi 1-Klik */}
            <div className="mt-6 rounded-2xl border-2 border-brand-700 bg-brand-50/70 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-900" aria-hidden />
                <h3 className="text-sm font-extrabold text-brand-900">
                  Masuk Cepat 1-Klik (Mode Demonstrasi Kaltim)
                </h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                Tanpa perlu mendaftar atau mengatur basis data. Klik untuk langsung mencoba dan menjelajahi seluruh fitur aplikasi:
              </p>
              <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void tanganiMasukSimulasi('admin')}
                  disabled={sedangMemproses}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-900 px-3.5 py-2.5 text-xs font-bold text-surface shadow-sm hover:bg-brand-850 disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4 text-gold-500" />
                  <span>Admin Provinsi</span>
                </button>
                <button
                  type="button"
                  onClick={() => void tanganiMasukSimulasi('operator')}
                  disabled={sedangMemproses}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-ink-900 hover:bg-canvas disabled:opacity-60"
                >
                  <span>Operator UPTD</span>
                </button>
                <button
                  type="button"
                  onClick={() => void tanganiMasukSimulasi('petugas')}
                  disabled={sedangMemproses}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-ink-900 hover:bg-canvas disabled:opacity-60"
                >
                  <span>Petugas Lapangan</span>
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-line bg-canvas p-3.5 text-xs text-ink-600">
              <p className="font-semibold text-ink-900">Kebijakan Pendaftaran Akun</p>
              <p className="mt-0.5 leading-relaxed">
                Pendaftaran mandiri ditutup untuk menjaga keamanan data proteksi perkebunan.
                Hubungi Admin Provinsi Dinas Perkebunan Kalimantan Timur untuk pendaftaran akun resmi.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl text-center text-xs text-ink-600">
        SIPUT-KALTIM • Ruhui Rahayu Proteksi Perkebunan Provinsi Kalimantan Timur
      </footer>
    </div>
  );
}
