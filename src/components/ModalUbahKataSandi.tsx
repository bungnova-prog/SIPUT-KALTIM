import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Lock, X, AlertCircle } from 'lucide-react';
import { useAppStore } from '../lib/storeAplikasi';
import { authService } from '../services';

interface ModalUbahKataSandiProps {
  terbuka: boolean;
  onTutup: () => void;
  namaPengguna?: string;
}

export default function ModalUbahKataSandi({
  terbuka,
  onTutup,
  namaPengguna,
}: ModalUbahKataSandiProps) {
  const tambahToast = useAppStore((s) => s.tambahToast);

  const [kataSandiBaru, setKataSandiBaru] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  if (!terbuka) return null;

  const tanganiTutup = () => {
    if (sedangMemproses) return;
    setKataSandiBaru('');
    setKonfirmasiSandi('');
    setPesanGalat(null);
    onTutup();
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat(null);

    const sandi = kataSandiBaru.trim();
    if (sandi.length < 6) {
      setPesanGalat('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (sandi !== konfirmasiSandi.trim()) {
      setPesanGalat('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSedangMemproses(true);
    try {
      if (!authService.ubahKataSandi) {
        throw new Error('Fitur ubah kata sandi tidak tersedia pada konfigurasi ini.');
      }

      const hasil = await authService.ubahKataSandi(sandi);
      if (!hasil.ok) {
        setPesanGalat(hasil.pesan);
        return;
      }

      tambahToast({
        jenis: 'sukses',
        judul: 'Kata Sandi Berhasil Diperbarui',
        pesan: 'Kata sandi akun Anda telah diperbarui. Gunakan kata sandi ini untuk masuk berikutnya.',
      });

      tanganiTutup();
    } catch (err) {
      setPesanGalat(
        err instanceof Error ? err.message : 'Terjadi kendala saat mengubah kata sandi.'
      );
    } finally {
      setSedangMemproses(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-sandi"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-900">
              <KeyRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 id="judul-modal-sandi" className="text-base font-bold text-ink-900 sm:text-lg">
                Ubah Kata Sandi Mandiri
              </h2>
              <p className="text-xs text-ink-600">
                {namaPengguna ? `Akun: ${namaPengguna}` : 'Perbarui kata sandi akun Anda'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={tanganiTutup}
            disabled={sedangMemproses}
            aria-label="Tutup modal"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-600 hover:bg-canvas disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {pesanGalat && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-danger-600 bg-danger-100 p-3 text-xs font-medium text-danger-600"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{pesanGalat}</span>
          </div>
        )}

        <form onSubmit={tanganiSimpan} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="input-sandi-baru"
              className="block text-xs font-bold text-ink-900"
            >
              Kata Sandi Baru <span className="text-danger-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="input-sandi-baru"
                type={lihatSandi ? 'text' : 'password'}
                required
                minLength={6}
                value={kataSandiBaru}
                onChange={(e) => setKataSandiBaru(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2.5 pr-10 text-xs text-ink-900 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
              <button
                type="button"
                onClick={() => setLihatSandi((v) => !v)}
                className="absolute inset-y-0 right-0 flex min-h-[44px] min-w-[40px] items-center justify-center text-ink-600 hover:text-ink-900"
                aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              >
                {lihatSandi ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-ink-600">
              Gunakan kombinasi huruf, angka, atau simbol agar lebih aman.
            </p>
          </div>

          <div>
            <label
              htmlFor="input-konfirmasi-sandi"
              className="block text-xs font-bold text-ink-900"
            >
              Ulangi Kata Sandi Baru <span className="text-danger-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="input-konfirmasi-sandi"
                type={lihatSandi ? 'text' : 'password'}
                required
                minLength={6}
                value={konfirmasiSandi}
                onChange={(e) => setKonfirmasiSandi(e.target.value)}
                placeholder="Masukkan ulang kata sandi baru"
                className="min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2.5 pr-10 text-xs text-ink-900 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={tanganiTutup}
              disabled={sedangMemproses}
              className="min-h-[44px] rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-900 hover:bg-canvas disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sedangMemproses}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-surface shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              <Lock className="h-4 w-4" aria-hidden />
              <span>{sedangMemproses ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
