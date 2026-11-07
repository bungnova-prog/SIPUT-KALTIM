import type { LapisanDasarPeta } from './petaGis';

export interface GoogleMapInstanceMinimal {
  setCenter(latLng: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  getZoom(): number | undefined;
  setMapTypeId(mapTypeId: 'hybrid' | 'roadmap' | 'terrain'): void;
  addListener(eventName: string, handler: () => void): { remove(): void };
}

export interface GoogleMarkerInstanceMinimal {
  setMap(map: GoogleMapInstanceMinimal | null): void;
  addListener(eventName: string, handler: () => void): { remove(): void };
}

export interface GoogleMapsNamespaceMinimal {
  Map: new (
    elemen: HTMLElement,
    opsi: {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeId: 'hybrid' | 'roadmap' | 'terrain';
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
    }
  ) => GoogleMapInstanceMinimal;
  Marker: new (opsi: {
    position: { lat: number; lng: number };
    map: GoogleMapInstanceMinimal;
    title: string;
    label?: {
      text: string;
      color: string;
      fontWeight?: string;
      fontSize?: string;
    };
    icon?: {
      path: number;
      fillColor: string;
      fillOpacity: number;
      strokeColor: string;
      strokeWeight: number;
      scale: number;
    };
    zIndex?: number;
  }) => GoogleMarkerInstanceMinimal;
  SymbolPath: {
    CIRCLE: number;
  };
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespaceMinimal;
    };
    gm_authFailure?: () => void;
  }
}

export function petakanTipePetaGoogle(
  lapisan: LapisanDasarPeta
): 'hybrid' | 'roadmap' | 'terrain' {
  if (lapisan === 'satelit') return 'hybrid';
  if (lapisan === 'topografi') return 'terrain';
  return 'roadmap';
}

export function ambilWarnaTokenCss(namaVariabel: string, cadanganRgb: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return cadanganRgb;
  }
  const nilai = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(namaVariabel)
    .trim();
  return nilai || cadanganRgb;
}

export function apakahKunciGoogleMapsTersedia(): boolean {
  const kunci = String(import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '').trim();
  return kunci.length >= 16;
}

let janjiMuatSkrip: Promise<GoogleMapsNamespaceMinimal> | null = null;

/**
 * Memuat Google Maps JavaScript API secara lazy hanya saat komponen peta memintanya
 * dan pengguna mengonfirmasi bahwa kunci pada .env lokal sudah dibatasi (SECURITY.md §4).
 */
export function muatGoogleMapsLazy(): Promise<GoogleMapsNamespaceMinimal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Lingkungan peramban tidak tersedia.'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  const kunci = String(import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '').trim();
  if (kunci.length < 16) {
    return Promise.reject(
      new Error(
        'Kunci VITE_GOOGLE_MAPS_KEY belum dikonfigurasi pada berkas .env lokal.'
      )
    );
  }

  if (janjiMuatSkrip) {
    return janjiMuatSkrip;
  }

  janjiMuatSkrip = new Promise<GoogleMapsNamespaceMinimal>((resolve, reject) => {
    window.gm_authFailure = () => {
      janjiMuatSkrip = null;
      reject(
        new Error(
          'Otentikasi Google Maps ditolak. Pastikan pembatasan HTTP referrer dan Maps JavaScript API pada kunci sudah sesuai.'
        )
      );
    };

    const skrip = document.createElement('script');
    skrip.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(kunci)}&v=weekly`;
    skrip.async = true;
    skrip.defer = true;
    skrip.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        janjiMuatSkrip = null;
        reject(new Error('Objek Google Maps tidak ditemukan setelah skrip dimuat.'));
      }
    };
    skrip.onerror = () => {
      janjiMuatSkrip = null;
      reject(
        new Error(
          'Gagal memuat skrip Google Maps. Periksa koneksi jaringan atau aturan CSP.'
        )
      );
    };
    document.head.appendChild(skrip);
  });

  return janjiMuatSkrip;
}
