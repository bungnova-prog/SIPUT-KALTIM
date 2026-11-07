import { CheckCircle2, Crosshair, MapPin, XCircle } from 'lucide-react';
import type { MouseEvent } from 'react';
import { proyeksiKoordinatPetaMini } from '../../lib/analitikDashboard';
import { formatKoordinat } from '../../lib/format';
import { validasiKoordinatKaltim } from '../../lib/klasifikasi';
import { BATAS_KOORDINAT_KALTIM_SEMENTARA } from '../../lib/konfigurasi';
import { koordinatDariTitikPetaPratinjau } from '../../lib/skemaFormLaporan';

interface PropsPetaPratinjauPin {
  lat: number;
  lng: number;
  namaWilayahTerpilih: string;
  onPilihKoordinat: (lat: number, lng: number) => void;
}

export function PetaPratinjauPin({
  lat,
  lng,
  namaWilayahTerpilih,
  onPilihKoordinat,
}: PropsPetaPratinjauPin) {
  const cekValid = validasiKoordinatKaltim(lat, lng);
  const posisiPin = proyeksiKoordinatPetaMini(lat, lng);

  const tanganiKlikPeta = (e: MouseEvent<HTMLDivElement>) => {
    const kotak = e.currentTarget.getBoundingClientRect();
    if (kotak.width <= 0 || kotak.height <= 0) return;
    const rasioX = (e.clientX - kotak.left) / kotak.width;
    const rasioY = (e.clientY - kotak.top) / kotak.height;
    const koordBaru = koordinatDariTitikPetaPratinjau(rasioX, rasioY);
    onPilihKoordinat(koordBaru.lat, koordBaru.lng);
  };

  return (
    <div className="space-y-2 rounded-xl border border-line bg-canvas/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-brand-900">
          <Crosshair className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Peta Pratinjau Pin Spasial (WGS84 EPSG:4326)</span>
        </div>
        {cekValid.valid ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-ok-100 px-2.5 py-0.5 font-semibold text-ink-900">
            <CheckCircle2 className="h-3.5 w-3.5 text-ok-500" aria-hidden />
            <span>Di Dalam Wilayah Kaltim</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-0.5 font-semibold text-danger-600">
            <XCircle className="h-3.5 w-3.5" aria-hidden />
            <span>Di Luar Batas Kaltim</span>
          </span>
        )}
      </div>

      {/* Kanvas Interaktif Pratinjau Kaltim */}
      <div
        role="button"
        tabIndex={0}
        onClick={tanganiKlikPeta}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const tengah = koordinatDariTitikPetaPratinjau(0.5, 0.5);
            onPilihKoordinat(tengah.lat, tengah.lng);
          }
        }}
        aria-label="Peta pratinjau titik pengamatan Kalimantan Timur. Klik untuk memindahkan pin koordinat."
        className="relative h-48 w-full cursor-crosshair overflow-hidden rounded-lg border border-line bg-surface select-none"
      >
        <svg
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden
        >
          <rect width="400" height="200" fill="var(--token-canvas)" />
          {/* Grid garis lintang & bujur */}
          <g stroke="var(--token-line)" strokeWidth="1" strokeDasharray="4 4">
            <line x1="80" y1="0" x2="80" y2="200" />
            <line x1="160" y1="0" x2="160" y2="200" />
            <line x1="240" y1="0" x2="240" y2="200" />
            <line x1="320" y1="0" x2="320" y2="200" />
            <line x1="0" y1="50" x2="400" y2="50" />
            <line x1="0" y1="100" x2="400" y2="100" />
            <line x1="0" y1="150" x2="400" y2="150" />
          </g>
          {/* Siluet indikatif daratan Kalimantan Timur */}
          <path
            d="M 65 36 L 195 20 L 295 34 L 348 72 L 320 112 L 288 148 L 222 178 L 136 172 L 88 134 L 54 84 Z"
            fill="var(--token-brand-100)"
            stroke="var(--token-brand-700)"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Garis khatulistiwa indikatif (0 derajat) */}
          <line
            x1="0"
            y1="98"
            x2="400"
            y2="98"
            stroke="var(--token-gold-500)"
            strokeWidth="1"
            strokeDasharray="6 3"
          />
        </svg>

        {/* Label batas koordinat sementara */}
        <span className="pointer-events-none absolute left-2 top-1.5 rounded bg-surface/90 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
          {BATAS_KOORDINAT_KALTIM_SEMENTARA.latMax}° LU · {BATAS_KOORDINAT_KALTIM_SEMENTARA.lngMin}° BT
        </span>
        <span className="pointer-events-none absolute bottom-1.5 right-2 rounded bg-surface/90 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
          {Math.abs(BATAS_KOORDINAT_KALTIM_SEMENTARA.latMin)}° LS · {BATAS_KOORDINAT_KALTIM_SEMENTARA.lngMax}° BT
        </span>

        {/* Pin Lokasi Aktif */}
        <div
          style={{
            left: `${posisiPin.xPersen}%`,
            top: `${posisiPin.yPersen}%`,
          }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-all duration-150"
        >
          <div className="flex flex-col items-center">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm ${
                cekValid.valid
                  ? 'bg-brand-900 text-surface'
                  : 'bg-danger-600 text-surface'
              }`}
            >
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              <span className="max-w-[140px] truncate">
                {namaWilayahTerpilih || 'Titik Amatan'}
              </span>
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full border-2 border-surface ${
                cekValid.valid ? 'bg-brand-900' : 'bg-danger-600'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-600">
        <span>Klik pada bidang peta untuk memindahkan pin titik pengamatan secara cepat.</span>
        <span className="font-mono font-semibold text-ink-900">
          {Number.isFinite(lat) && Number.isFinite(lng)
            ? formatKoordinat(lat, lng)
            : 'Koordinat belum lengkap'}
        </span>
      </div>
    </div>
  );
}
