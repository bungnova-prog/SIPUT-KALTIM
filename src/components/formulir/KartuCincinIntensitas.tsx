import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatLuas, formatPersen } from '../../lib/format';
import type { StatusPeringatanForm } from '../../lib/klasifikasi';
import { labelKondisiKebun } from '../../lib/skemaFormLaporan';
import type {
  KonfigurasiPeringatanForm,
  TingkatSerangan,
} from '../../types/domain';
import { LencanaTingkatSerangan } from '../LencanaStatus';

interface PropsKartuCincinIntensitas {
  luasAmatan: number;
  luasRingan: number;
  luasBerat: number;
  luasTerkendali: number;
  intensitasPersen: number;
  tingkat: TingkatSerangan;
  statusPeringatan: StatusPeringatanForm;
  konfigurasiPeringatan: KonfigurasiPeringatanForm;
  validLuas: boolean;
}

export function KartuCincinIntensitas({
  luasAmatan,
  luasRingan,
  luasBerat,
  luasTerkendali,
  intensitasPersen,
  tingkat,
  statusPeringatan,
  konfigurasiPeringatan,
  validLuas,
}: PropsKartuCincinIntensitas) {
  const radius = 44;
  const keliling = 2 * Math.PI * radius;
  const persenJepit = Math.min(100, Math.max(0, intensitasPersen));
  const dashOffset = keliling - (persenJepit / 100) * keliling;

  const warnaCincin =
    tingkat === 'berat'
      ? 'var(--token-danger-600)'
      : tingkat === 'sedang'
        ? 'var(--token-gold-500)'
        : 'var(--token-ok-500)';

  const luasTerdampak = Math.max(0, luasRingan) + Math.max(0, luasBerat);
  const luasSehatSisa = Math.max(
    0,
    luasAmatan - (Math.max(0, luasRingan) + Math.max(0, luasBerat) + Math.max(0, luasTerkendali))
  );
  const teksKondisi = labelKondisiKebun(intensitasPersen, luasAmatan);

  return (
    <div className="rounded-xl border border-line bg-canvas/70 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Cincin Persentase SVG */}
        <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center sm:mx-0">
          <svg
            viewBox="0 0 108 108"
            className="h-28 w-28 -rotate-90"
            role="img"
            aria-label={`Intensitas serangan ${formatPersen(intensitasPersen)}`}
          >
            <circle
              cx="54"
              cy="54"
              r={radius}
              fill="none"
              stroke="var(--token-line)"
              strokeWidth="10"
            />
            <circle
              cx="54"
              cy="54"
              r={radius}
              fill="none"
              stroke={warnaCincin}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={keliling}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-extrabold tabular-nums text-ink-900">
              {formatPersen(intensitasPersen)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-600">
              Intensitas
            </span>
          </div>
        </div>

        {/* Rincian Hasil Kalkulasi */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <LencanaTingkatSerangan tingkat={tingkat} />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  tingkat === 'berat'
                    ? 'bg-danger-100 text-danger-600'
                    : tingkat === 'sedang'
                      ? 'bg-gold-100 text-ink-900'
                      : 'bg-brand-100 text-brand-900'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{teksKondisi}</span>
              </span>
            </div>
            {!validLuas && (
              <span className="inline-flex items-center gap-1 rounded-md bg-danger-100 px-2 py-0.5 text-xs font-semibold text-danger-600">
                <AlertOctagon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Rincian Luas Belum Valid</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                Luas Terdampak
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-ink-900">
                {formatLuas(luasTerdampak)}
              </p>
              <p className="text-[11px] text-ink-600">Ringan + Berat</p>
            </div>
            <div className="rounded-lg border border-line bg-surface px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                Terkendali
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-900">
                {formatLuas(Math.max(0, luasTerkendali))}
              </p>
              <p className="text-[11px] text-ink-600">Pengendalian & Eradikasi</p>
            </div>
            <div className="rounded-lg border border-line bg-surface px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                Tegakan Sehat
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-ink-900">
                {formatLuas(luasSehatSisa)}
              </p>
              <p className="text-[11px] text-ink-600">Belum Terinfeksi</p>
            </div>
          </div>

          {/* Ambang Peringatan Dini Form (terpisah dari Klasifikasi GIS — AGENTS.md §8) */}
          {statusPeringatan === 'eksplosif' && luasAmatan > 0 && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-danger-600/30 bg-danger-100 px-3 py-2.5 text-xs text-danger-600"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-bold">
                  Peringatan Laporan Eksplosif (&gt; {konfigurasiPeringatan.ambangEksplosif}%)
                </p>
                <p className="mt-0.5 text-ink-900">
                  Intensitas melampaui ambang laporan eksplosif formulir. Publikasi laporan ini akan
                  mengirimkan notifikasi prioritas ke Operator UPTD dan Provinsi.
                </p>
              </div>
            </div>
          )}

          {statusPeringatan === 'pemberitahuan' && luasAmatan > 0 && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-gold-500/50 bg-gold-100 px-3 py-2.5 text-xs text-ink-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ink-900" aria-hidden />
              <div>
                <p className="font-bold">
                  Pemberitahuan Dini Formulir (&gt; {konfigurasiPeringatan.ambangPeringatan}%)
                </p>
                <p className="mt-0.5 text-ink-600">
                  Intensitas melampaui ambang pemberitahuan dini formulir meskipun klasifikasi GIS
                  masih mengikuti batas baku. Lengkapi rekomendasi pengendalian di Bagian V.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
