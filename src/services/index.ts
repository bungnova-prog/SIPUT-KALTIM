import * as mockRepo from './mockRepositories';
import * as supabaseRepo from './supabaseRepositories';
import type {
  AuthService,
  EksporService,
  KomoditasOptRepository,
  KonfigurasiRepository,
  LaporanRepository,
  LogEksporRepository,
  NotifikasiRepository,
  PenggunaRepository,
  RekapRepository,
  WilayahRepository,
} from './kontrak';
import type { Peran, ProfilPengguna } from '../types/domain';

export * from './kontrak';
export {
  hapusDrafLokalForm,
  muatDrafLokalForm,
  simpanDrafLokalForm,
  type DrafLokalForm,
} from '../lib/drafLokal';
export { bersihkanCacheSesiSupabase } from './supabaseRepositories';

function pakaiMock(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('siput_mode_simulasi') === 'true';
}

function buatProxy<T extends object>(targetMock: T, targetSupabase: T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const sumber = pakaiMock() ? targetMock : targetSupabase;
      const nilai = (sumber as Record<string | symbol, unknown>)[prop];
      if (typeof nilai === 'function') {
        return (nilai as (...args: unknown[]) => unknown).bind(sumber);
      }
      return nilai;
    },
  });
}

export const laporanRepository: LaporanRepository = buatProxy(
  mockRepo.laporanRepository,
  supabaseRepo.laporanRepository
);

export const wilayahRepository: WilayahRepository = buatProxy(
  mockRepo.wilayahRepository,
  supabaseRepo.wilayahRepository
);

export const komoditasOptRepository: KomoditasOptRepository = buatProxy(
  mockRepo.komoditasOptRepository,
  supabaseRepo.komoditasOptRepository
);

export const rekapRepository: RekapRepository = buatProxy(
  mockRepo.rekapRepository,
  supabaseRepo.rekapRepository
);

export const logEksporRepository: LogEksporRepository = buatProxy(
  mockRepo.logEksporRepository,
  supabaseRepo.logEksporRepository
);

export const notifikasiRepository: NotifikasiRepository = buatProxy(
  mockRepo.notifikasiRepository,
  supabaseRepo.notifikasiRepository
);

export const penggunaRepository: PenggunaRepository = buatProxy(
  mockRepo.penggunaRepository,
  supabaseRepo.penggunaRepository
);

export const konfigurasiRepository: KonfigurasiRepository = buatProxy(
  mockRepo.konfigurasiRepository,
  supabaseRepo.konfigurasiRepository
);

export const eksporService: EksporService = buatProxy(
  mockRepo.eksporService,
  supabaseRepo.eksporService
);

export const authService: AuthService = {
  statusKonfigurasi: () => supabaseRepo.authService.statusKonfigurasi(),

  pulihkanSesiAktif: async () => {
    if (pakaiMock()) {
      const tersimpan = window.localStorage.getItem('siput_profil_simulasi');
      if (tersimpan) {
        try {
          const profil = JSON.parse(tersimpan) as ProfilPengguna;
          return { ok: true, data: profil };
        } catch {
          // abaikan galat JSON
        }
      }
    }
    return supabaseRepo.authService.pulihkanSesiAktif();
  },

  masukDenganEmailSandi: async (email, kataSandi) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('siput_mode_simulasi');
      window.localStorage.removeItem('siput_profil_simulasi');
    }
    return supabaseRepo.authService.masukDenganEmailSandi(email, kataSandi);
  },

  masukSebagaiSimulasi: async (peran: Peran = 'admin') => {
    const profil: ProfilPengguna =
      peran === 'admin'
        ? {
            id: 'usr-admin-01',
            nama: 'Admin Provinsi (Simulasi)',
            nip: '198501012010011001',
            jabatan: 'Koordinator Perlindungan Perkebunan (Simulasi)',
            peran: 'admin',
            wilayahId: null,
            namaWilayah: 'Provinsi Kalimantan Timur',
            wkpp: 'Provinsi Kalimantan Timur',
            aktif: true,
          }
        : peran === 'operator'
        ? {
            id: 'usr-op-kukar',
            nama: 'Operator UPTD Tengah (Simulasi)',
            nip: '198803152012021002',
            jabatan: 'Verifikator Data OPT Wilayah Tengah (Simulasi)',
            peran: 'operator',
            wilayahId: 'kab-kukar',
            namaWilayah: 'Kab. Kutai Kartanegara',
            wkpp: 'UPTD Wilayah Tengah — Kukar',
            aktif: true,
          }
        : {
            id: 'usr-popt-01',
            nama: 'Petugas POPT Loa Janan (Simulasi)',
            nip: '199207202015031003',
            jabatan: 'Petugas POPT Ahli Pertama (Simulasi)',
            peran: 'petugas',
            wilayahId: 'kab-kukar',
            namaWilayah: 'Kab. Kutai Kartanegara',
            wkpp: 'WKPP Loa Janan & Batuah',
            aktif: true,
          };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('siput_mode_simulasi', 'true');
      window.localStorage.setItem('siput_profil_simulasi', JSON.stringify(profil));
    }
    return { ok: true, data: profil };
  },

  keluarSistem: async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('siput_mode_simulasi');
      window.localStorage.removeItem('siput_profil_simulasi');
    }
    return supabaseRepo.authService.keluarSistem();
  },

  langgananSesiAuth: (cb) => {
    if (pakaiMock()) {
      return () => undefined;
    }
    return supabaseRepo.authService.langgananSesiAuth(cb);
  },
};
