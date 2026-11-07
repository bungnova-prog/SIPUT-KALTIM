import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Leaf,
  XCircle,
} from 'lucide-react';
import type { StatusLaporan, TingkatSerangan } from '../types/domain';

/**
 * Lencana tingkat serangan sesuai DESIGN.md §5:
 * Berat: danger-100 + ikon peringatan + teks "Berat (Darurat)"
 * Sedang: gold-100 + ikon segitiga + teks "Sedang (Waspada)"
 * Ringan: ok-100 + ikon daun + teks "Ringan"
 */
export function LencanaTingkatSerangan({ tingkat }: { tingkat: TingkatSerangan }) {
  if (tingkat === 'berat') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-100 px-2.5 py-1 text-xs font-semibold text-danger-600">
        <AlertOctagon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Berat (Darurat)</span>
      </span>
    );
  }

  if (tingkat === 'sedang') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-ink-900">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-ink-900" aria-hidden />
        <span>Sedang (Waspada)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-100 px-2.5 py-1 text-xs font-semibold text-ink-900">
      <Leaf className="h-3.5 w-3.5 shrink-0 text-ok-500" aria-hidden />
      <span>Ringan</span>
    </span>
  );
}

/**
 * Lencana status verifikasi sesuai DESIGN.md §5:
 * Menunggu Validasi, Terverifikasi, Ditolak, Draf — selalu ikon + teks.
 */
export function LencanaStatusVerifikasi({ status }: { status: StatusLaporan }) {
  if (status === 'terverifikasi') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-100 px-2.5 py-1 text-xs font-semibold text-ink-900">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-ok-500" aria-hidden />
        <span>Terverifikasi</span>
      </span>
    );
  }

  if (status === 'menunggu') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-info-100 px-2.5 py-1 text-xs font-semibold text-ink-900">
        <Clock className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
        <span>Menunggu Validasi</span>
      </span>
    );
  }

  if (status === 'ditolak') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-100 px-2.5 py-1 text-xs font-semibold text-danger-600">
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Ditolak</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink-600">
      <FileEdit className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Draf</span>
    </span>
  );
}
