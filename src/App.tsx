import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import TataLetakUtama from './components/TataLetakUtama';
import { KerangkaMuat } from './components/StatusMuatData';
import { useAppStore } from './lib/storeAplikasi';

const HalamanMasuk = lazy(() => import('./pages/HalamanMasuk'));
const HalamanDashboard = lazy(() => import('./pages/HalamanDashboard'));
const HalamanPeta = lazy(() => import('./pages/HalamanPeta'));
const HalamanInputLaporan = lazy(() => import('./pages/HalamanInputLaporan'));
const HalamanKomoditasOpt = lazy(() => import('./pages/HalamanKomoditasOpt'));
const HalamanRekapitulasi = lazy(() => import('./pages/HalamanRekapitulasi'));
const HalamanEkspor = lazy(() => import('./pages/HalamanEkspor'));
const HalamanPengguna = lazy(() => import('./pages/HalamanPengguna'));

function GerbangTerautentikasi({ children }: { children: ReactNode }) {
  const statusAuth = useAppStore((s) => s.statusAuth);

  if (statusAuth === 'memuat') {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <KerangkaMuat pesan="Memverifikasi sesi autentikasi SIPUT-KALTIM..." />
      </div>
    );
  }

  if (statusAuth !== 'masuk') {
    return <Navigate to="/masuk" replace />;
  }

  return <>{children}</>;
}

function GerbangTamu({ children }: { children: ReactNode }) {
  const statusAuth = useAppStore((s) => s.statusAuth);

  if (statusAuth === 'memuat') {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <KerangkaMuat pesan="Memeriksa sesi pengguna..." />
      </div>
    );
  }

  if (statusAuth === 'masuk') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const inisialisasiAuth = useAppStore((s) => s.inisialisasiAuth);

  useEffect(() => {
    const berhenti = inisialisasiAuth();
    return berhenti;
  }, [inisialisasiAuth]);

  return (
    <Routes>
      <Route
        path="/masuk"
        element={
          <GerbangTamu>
            <Suspense fallback={<KerangkaMuat pesan="Memuat portal autentikasi..." />}>
              <HalamanMasuk />
            </Suspense>
          </GerbangTamu>
        }
      />

      <Route
        element={
          <GerbangTerautentikasi>
            <TataLetakUtama />
          </GerbangTerautentikasi>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Dashboard Eksekutif..." />}>
              <HalamanDashboard />
            </Suspense>
          }
        />
        <Route
          path="/peta"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Peta Sebaran & GIS OPT..." />}>
              <HalamanPeta />
            </Suspense>
          }
        />
        <Route
          path="/input-laporan"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Formulir Input Laporan..." />}>
              <HalamanInputLaporan />
            </Suspense>
          }
        />
        <Route
          path="/komoditas-opt"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Katalog Komoditas & OPT..." />}>
              <HalamanKomoditasOpt />
            </Suspense>
          }
        />
        <Route
          path="/rekapitulasi"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Rekapitulasi Triwulan & Semester..." />}>
              <HalamanRekapitulasi />
            </Suspense>
          }
        />
        <Route
          path="/ekspor"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Pusat Ekspor Laporan..." />}>
              <HalamanEkspor />
            </Suspense>
          }
        />
        <Route
          path="/pengguna"
          element={
            <Suspense fallback={<KerangkaMuat pesan="Memuat Manajemen Pengguna..." />}>
              <HalamanPengguna />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
