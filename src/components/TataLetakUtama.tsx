import { NavLink, Outlet } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileDown,
  FilePenLine,
  FileText,
  Info,
  LayoutDashboard,
  Leaf,
  LogOut,
  Map,
  Menu,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAppStore, type JenisToast } from '../lib/storeAplikasi';
import {
  formatTanggalPanjang,
  formatTanggalWaktu,
  formatWaktuWita,
} from '../lib/format';
import { notifikasiRepository } from '../services';
import type { NotifikasiItem, Peran, TipeNotifikasi } from '../types/domain';
import logoKaltim from '../assets/logo-kaltim.png';

const menuNavigasi: Array<{
  to: string;
  label: string;
  ikon: typeof LayoutDashboard;
  peranDiizinkan?: Peran[];
}> = [
  { to: '/dashboard', label: 'Dashboard Eksekutif', ikon: LayoutDashboard },
  { to: '/peta', label: 'Peta Sebaran & GIS OPT', ikon: Map },
  { to: '/input-laporan', label: 'Input Laporan Serangan', ikon: FilePenLine },
  { to: '/komoditas-opt', label: 'Data Komoditas & OPT', ikon: Leaf },
  { to: '/rekapitulasi', label: 'Rekapitulasi Triwulan & Semester', ikon: BarChart3 },
  { to: '/ekspor', label: 'Ekspor Laporan (Excel & PDF)', ikon: FileDown },
  {
    to: '/pengguna',
    label: 'Manajemen Pengguna',
    ikon: Users,
    peranDiizinkan: ['admin'],
  },
];

const labelPortalPeran: Record<Peran, string> = {
  admin: 'Portal Admin (Provinsi)',
  operator: 'Operator UPTD / Wilayah',
  petugas: 'Petugas POPT Lapangan',
};

function gayaToast(jenis: JenisToast): {
  kelas: string;
  Ikon: typeof CheckCircle2;
  labelJenis: string;
} {
  if (jenis === 'sukses') {
    return {
      kelas: 'border-ok-500 bg-ok-100 text-ink-900',
      Ikon: CheckCircle2,
      labelJenis: 'Berhasil',
    };
  }
  if (jenis === 'gagal') {
    return {
      kelas: 'border-danger-600 bg-danger-100 text-ink-900',
      Ikon: AlertCircle,
      labelJenis: 'Galat',
    };
  }
  if (jenis === 'peringatan') {
    return {
      kelas: 'border-gold-500 bg-gold-100 text-ink-900',
      Ikon: AlertTriangle,
      labelJenis: 'Peringatan',
    };
  }
  return {
    kelas: 'border-brand-700 bg-info-100 text-ink-900',
    Ikon: Info,
    labelJenis: 'Informasi',
  };
}

function lencanaTipeNotifikasi(tipe: TipeNotifikasi): {
  kelas: string;
  label: string;
  Ikon: typeof AlertTriangle;
} {
  if (tipe === 'peringatan_eksplosif') {
    return {
      kelas: 'bg-danger-100 text-danger-600',
      label: 'Kritis',
      Ikon: AlertTriangle,
    };
  }
  if (tipe === 'menunggu_validasi') {
    return {
      kelas: 'bg-gold-100 text-ink-900',
      label: 'Menunggu Validasi',
      Ikon: Clock,
    };
  }
  if (tipe === 'laporan_baru') {
    return {
      kelas: 'bg-ok-100 text-ink-900',
      label: 'Laporan Baru',
      Ikon: FileText,
    };
  }
  return {
    kelas: 'bg-info-100 text-ink-900',
    label: 'Info',
    Ikon: Info,
  };
}

function inisialProfil(nama: string): string {
  const kata = nama
    .replace(/\(simulasi\)/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (kata.length === 0) return 'SK';
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return `${kata[0][0]}${kata[1][0]}`.toUpperCase();
}

export default function TataLetakUtama() {
  const [waktu, setWaktu] = useState(new Date());
  const [drawerBuka, setDrawerBuka] = useState(false);
  const [panelNotifBuka, setPanelNotifBuka] = useState(false);
  const [notifikasi, setNotifikasi] = useState<NotifikasiItem[]>([]);

  const {
    peranAktif,
    profilAktif,
    toasts,
    tutupToast,
    keluarSistem,
  } = useAppStore();

  const muatNotifikasi = useCallback(() => {
    notifikasiRepository.daftar(profilAktif.id).then((hasil) => {
      if (hasil.ok) setNotifikasi(hasil.data);
    });
  }, [profilAktif.id]);

  useEffect(() => {
    const id = window.setInterval(() => setWaktu(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    muatNotifikasi();
    const berhenti = notifikasiRepository.langganan(() => {
      muatNotifikasi();
    });
    return berhenti;
  }, [muatNotifikasi]);

  useEffect(() => {
    if (!drawerBuka && !panelNotifBuka) return;
    const tanganiTombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerBuka(false);
        setPanelNotifBuka(false);
      }
    };
    window.addEventListener('keydown', tanganiTombol);
    return () => window.removeEventListener('keydown', tanganiTombol);
  }, [drawerBuka, panelNotifBuka]);

  const jumlahBelumDibaca = notifikasi.filter((n) => !n.dibaca).length;
  const menuTersaring = menuNavigasi.filter(
    (m) => !m.peranDiizinkan || m.peranDiizinkan.includes(peranAktif)
  );

  const tandaiSatuDibaca = async (id: string) => {
    await notifikasiRepository.tandaiDibaca(id);
  };

  const tandaiSemuaDibaca = async () => {
    await notifikasiRepository.tandaiSemuaDibaca();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-900">
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 xl:flex-none">
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-line text-ink-900 hover:bg-canvas lg:hidden"
              aria-label="Buka menu navigasi"
              onClick={() => setDrawerBuka(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <img
              src={logoKaltim}
              alt="Logo Pemprov Kalimantan Timur Ruhui Rahayu"
              className="h-10 w-auto shrink-0 object-contain drop-shadow-sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base font-bold tracking-tight text-brand-900 sm:text-lg">
                  SIPUT
                </span>
                <span className="rounded bg-gold-500 px-2 py-0.5 text-[11px] font-semibold text-ink-900">
                  KALTIM
                </span>
              </div>
              <p className="truncate text-[11px] text-ink-600 sm:text-xs">
                PEMPROV KALIMANTAN TIMUR – DINAS PERKEBUNAN
              </p>
            </div>
          </div>

          <div
            aria-label="Status sesi peran terautentikasi"
            className="hidden items-center gap-2 rounded-full border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink-900 xl:flex"
          >
            <span className="h-2 w-2 rounded-full bg-ok-500" aria-hidden />
            <span>{labelPortalPeran[peranAktif]}</span>
            <span className="text-ink-600">·</span>
            <span className="text-brand-900">{profilAktif.namaWilayah}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right text-xs text-ink-600 md:block">
              <p className="inline-flex items-center justify-end gap-1.5 font-medium text-ink-900">
                <span className="h-2 w-2 rounded-full bg-danger-600" aria-hidden />
                <span>Sistem Real-Time · Samarinda, WITA</span>
              </p>
              <p className="tabular-nums">
                {formatTanggalPanjang(waktu)} | {formatWaktuWita(waktu)}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                aria-label={
                  jumlahBelumDibaca > 0
                    ? `Pusat notifikasi, ${jumlahBelumDibaca} belum dibaca`
                    : 'Pusat notifikasi, tidak ada pesan baru'
                }
                aria-expanded={panelNotifBuka}
                onClick={() => setPanelNotifBuka((buka) => !buka)}
                className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-line bg-surface text-ink-900 hover:bg-canvas"
              >
                <Bell className="h-5 w-5" aria-hidden />
                {jumlahBelumDibaca > 0 && (
                  <span className="absolute right-1.5 top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-surface">
                    {jumlahBelumDibaca}
                  </span>
                )}
              </button>

              {panelNotifBuka && (
                <div
                  role="region"
                  aria-label="Daftar notifikasi sistem"
                  className="fixed inset-x-3 top-28 z-50 rounded-xl border border-line bg-surface p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[360px]"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        Pusat Notifikasi
                      </p>
                      <p className="text-[11px] text-ink-600">
                        {jumlahBelumDibaca} belum dibaca dari {notifikasi.length} item
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {jumlahBelumDibaca > 0 && (
                        <button
                          type="button"
                          onClick={tandaiSemuaDibaca}
                          className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-xs font-medium text-brand-700 hover:bg-canvas"
                        >
                          <CheckCheck className="h-4 w-4" aria-hidden />
                          <span>Baca semua</span>
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Tutup panel notifikasi"
                        onClick={() => setPanelNotifBuka(false)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-600 hover:bg-canvas"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                    {notifikasi.length === 0 ? (
                      <p className="py-4 text-center text-xs text-ink-600">
                        Belum ada notifikasi simulasi.
                      </p>
                    ) : (
                      notifikasi.map((item) => {
                        const lencana = lencanaTipeNotifikasi(item.tipe);
                        const IkonLencana = lencana.Ikon;
                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border p-2.5 text-xs ${
                              item.dibaca
                                ? 'border-line bg-surface'
                                : 'border-brand-700 bg-brand-100/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${lencana.kelas}`}
                              >
                                <IkonLencana className="h-3 w-3" aria-hidden />
                                <span>{lencana.label}</span>
                              </span>
                              <span className="text-[11px] text-ink-600 tabular-nums">
                                {formatTanggalWaktu(item.dibuatPada)}
                              </span>
                            </div>
                            <p className="mt-1.5 font-semibold text-ink-900">
                              {item.judul}
                            </p>
                            <p className="mt-0.5 text-ink-600">{item.isi}</p>
                              {!item.dibaca && (
                              <button
                                type="button"
                                onClick={() => tandaiSatuDibaca(item.id)}
                                className="mt-2 inline-flex min-h-[44px] items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-brand-900 hover:bg-canvas sm:min-h-[38px]"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                <span>Tandai dibaca</span>
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2.5 rounded-xl border border-line bg-canvas px-2.5 py-1.5 sm:flex">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-surface"
                aria-hidden="true"
              >
                {inisialProfil(profilAktif.nama)}
              </div>
              <div className="max-w-[160px] text-left text-xs">
                <p className="truncate font-semibold text-ink-900">
                  {profilAktif.nama}
                </p>
                <p className="truncate text-[11px] text-ink-600">
                  {profilAktif.jabatan}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas px-3 py-2 xl:hidden sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-ok-500" aria-hidden />
            <span className="truncate font-semibold text-ink-900">
              {labelPortalPeran[peranAktif]} · {profilAktif.namaWilayah}
            </span>
          </div>
          <p className="text-[11px] text-ink-600 tabular-nums md:hidden">
            {formatWaktuWita(waktu)}
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-28 hidden max-h-[calc(100vh-7rem)] w-[250px] shrink-0 flex-col self-start overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
          <div className="mb-4 rounded-xl border border-line bg-canvas p-3 text-xs">
            <p className="font-semibold uppercase tracking-wide text-ink-600">
              WILAYAH KERJA UTAMA
            </p>
            <p className="mt-1 font-semibold text-ink-900">
              {profilAktif.namaWilayah}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-600">{profilAktif.wkpp}</p>
          </div>

          <nav className="flex-1 space-y-1" aria-label="Menu utama">
            {menuTersaring.map((m) => {
              const Ikon = m.ikon;
              return (
                <NavLink
                  key={m.to}
                  to={m.to}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-brand-900 text-surface'
                        : 'text-ink-600 hover:bg-canvas hover:text-ink-900'
                    }`
                  }
                >
                  <Ikon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{m.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
            <div className="rounded-lg border border-line bg-canvas p-2.5">
              <p className="inline-flex items-center gap-1.5 font-semibold text-ok-500">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                <span>Server SIPUT Aktif</span>
              </p>
              <p className="mt-0.5 text-ink-600">
                Versi {__APP_VERSION__}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void keluarSistem();
              }}
              className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 font-semibold text-danger-600 hover:bg-danger-100"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </aside>

        {drawerBuka && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
          >
            <button
              type="button"
              className="absolute inset-0 bg-ink-900/40"
              aria-label="Tutup menu navigasi"
              onClick={() => setDrawerBuka(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-surface p-4">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={logoKaltim}
                    alt="Logo Pemprov Kalimantan Timur Ruhui Rahayu"
                    className="h-8 w-auto shrink-0 object-contain drop-shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-900">SIPUT-KALTIM</p>
                    <p className="text-xs text-ink-600 truncate">{profilAktif.nama}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerBuka(false)}
                  aria-label="Tutup menu"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-line text-ink-900 hover:bg-canvas"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-line bg-canvas p-3 text-xs">
                <p className="font-semibold uppercase tracking-wide text-ink-600">
                  WILAYAH KERJA UTAMA
                </p>
                <p className="mt-1 font-semibold text-ink-900">
                  {profilAktif.namaWilayah}
                </p>
              </div>

              <nav className="flex-1 space-y-1" aria-label="Menu utama ponsel">
                {menuTersaring.map((m) => {
                  const Ikon = m.ikon;
                  return (
                    <NavLink
                      key={m.to}
                      to={m.to}
                      onClick={() => setDrawerBuka(false)}
                      className={({ isActive }) =>
                        `flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                          isActive
                            ? 'bg-brand-900 text-surface'
                            : 'text-ink-600 hover:bg-canvas hover:text-ink-900'
                        }`
                      }
                    >
                      <Ikon className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{m.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
                <div className="rounded-lg border border-line bg-canvas p-2.5">
                  <p className="font-semibold text-ok-500">Server SIPUT Aktif</p>
                  <p className="text-ink-600">Versi {__APP_VERSION__}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerBuka(false);
                    void keluarSistem();
                  }}
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 font-semibold text-danger-600 hover:bg-danger-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>

          <footer className="mt-8 flex flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs text-ink-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-ink-900">
              SIPUT KALTIM • Ruhui Rahayu Proteksi Perkebunan
            </p>
            <p className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-ok-500" aria-hidden />
              <span>Terhubung ke Supabase &amp; Kebijakan RLS Aktif</span>
            </p>
          </footer>
        </div>
      </div>

      <div
        className="pointer-events-none fixed inset-x-3 top-3 z-50 space-y-2 sm:inset-x-auto sm:right-4 sm:top-28 sm:w-[350px]"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const gaya = gayaToast(t.jenis);
          const IkonToast = gaya.Ikon;
          return (
            <div
              key={t.id}
              role={t.jenis === 'gagal' ? 'alert' : 'status'}
              className={`pointer-events-auto rounded-xl border p-3 shadow-sm ${gaya.kelas}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <IkonToast className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide">
                      {gaya.labelJenis}
                    </p>
                    <p className="text-sm font-semibold">{t.judul}</p>
                    <p className="mt-0.5 text-xs text-ink-600">{t.pesan}</p>
                    {t.onCobaLagi && (
                      <button
                        type="button"
                        onClick={t.onCobaLagi}
                        className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-canvas"
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                        <span>{t.labelCobaLagi ?? 'Coba lagi'}</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => tutupToast(t.id)}
                  className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg hover:bg-surface/60"
                  aria-label="Tutup notifikasi"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
