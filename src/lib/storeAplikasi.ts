import { create } from 'zustand';
import { authService } from '../services';
import { periodeBawaanSistem } from './klasifikasi';
import type { Peran, ProfilPengguna } from '../types/domain';

export type JenisToast = 'sukses' | 'gagal' | 'peringatan' | 'info';
export type StatusAuth = 'memuat' | 'masuk' | 'keluar';

export interface ToastItem {
  id: string;
  jenis: JenisToast;
  judul: string;
  pesan: string;
  labelCobaLagi?: string;
  onCobaLagi?: () => void;
}

const PROFIL_KOSONG: ProfilPengguna = {
  id: '',
  nama: 'Belum Masuk',
  nip: null,
  jabatan: '-',
  peran: 'petugas',
  wilayahId: null,
  namaWilayah: '-',
  wkpp: '-',
  aktif: false,
};

interface AppState {
  statusAuth: StatusAuth;
  peranAktif: Peran;
  profilAktif: ProfilPengguna;
  tahunDefault: number;
  triwulanDefault: 1 | 2 | 3 | 4;
  semesterDefault: 1 | 2;
  toasts: ToastItem[];
  inisialisasiAuth: () => () => void;
  setelProfilTerautentikasi: (profil: ProfilPengguna) => void;
  tambahToast: (item: Omit<ToastItem, 'id'>) => void;
  tutupToast: (id: string) => void;
  keluarSistem: () => Promise<void>;
}

const periodeAwal = periodeBawaanSistem();

export const useAppStore = create<AppState>((set) => ({
  statusAuth: 'memuat',
  peranAktif: PROFIL_KOSONG.peran,
  profilAktif: PROFIL_KOSONG,
  tahunDefault: periodeAwal.tahun,
  triwulanDefault: periodeAwal.triwulan,
  semesterDefault: periodeAwal.semester,
  toasts: [],

  inisialisasiAuth: () => {
    let dibatalkan = false;

    void authService.pulihkanSesiAktif().then((hasil) => {
      if (dibatalkan) return;
      if (hasil.ok && hasil.data) {
        set({
          statusAuth: 'masuk',
          peranAktif: hasil.data.peran,
          profilAktif: hasil.data,
        });
      } else {
        set({
          statusAuth: 'keluar',
          peranAktif: PROFIL_KOSONG.peran,
          profilAktif: PROFIL_KOSONG,
        });
      }
    });

    const berhentiLangganan = authService.langgananSesiAuth((profil) => {
      if (dibatalkan) return;
      if (profil) {
        set({
          statusAuth: 'masuk',
          peranAktif: profil.peran,
          profilAktif: profil,
        });
      } else {
        set({
          statusAuth: 'keluar',
          peranAktif: PROFIL_KOSONG.peran,
          profilAktif: PROFIL_KOSONG,
        });
      }
    });

    return () => {
      dibatalkan = true;
      berhentiLangganan();
    };
  },

  setelProfilTerautentikasi: (profil) => {
    set({
      statusAuth: 'masuk',
      peranAktif: profil.peran,
      profilAktif: profil,
    });
  },

  tambahToast: (item) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...item, id }] }));
    if (item.jenis !== 'gagal' && typeof window !== 'undefined') {
      window.setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 5000);
    }
  },

  tutupToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  keluarSistem: async () => {
    await authService.keluarSistem();
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set({
      statusAuth: 'keluar',
      peranAktif: PROFIL_KOSONG.peran,
      profilAktif: PROFIL_KOSONG,
      toasts: [
        {
          id,
          jenis: 'info',
          judul: 'Sesi Ditutup',
          pesan: 'Anda telah keluar dari sistem dan draf lokal peramban telah dibersihkan.',
        },
      ],
    });
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 5000);
    }
  },
}));
