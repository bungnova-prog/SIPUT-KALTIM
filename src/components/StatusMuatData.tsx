import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function KerangkaMuat({
  pesan = 'Memuat data simulasi...',
  jumlahBaris = 3,
}: {
  pesan?: string;
  jumlahBaris?: number;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-line bg-surface p-4"
    >
      <span className="sr-only">{pesan}</span>
      <div className="space-y-3 animate-pulse" aria-hidden="true">
        <div className="h-4 w-1/3 rounded bg-canvas" />
        {Array.from({ length: jumlahBaris }).map((_, idx) => (
          <div key={idx} className="h-10 w-full rounded-lg bg-canvas" />
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-600">{pesan}</p>
    </div>
  );
}

export function KotakGalatData({
  pesan,
  onCobaLagi,
}: {
  pesan: string;
  onCobaLagi?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-danger-600 bg-danger-100 p-4 text-ink-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Gagal Memuat Data</p>
          <p className="text-xs text-ink-600">{pesan}</p>
        </div>
      </div>
      {onCobaLagi && (
        <button
          type="button"
          onClick={onCobaLagi}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-danger-600 px-4 py-2 text-xs font-semibold text-surface hover:opacity-95"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          <span>Coba lagi</span>
        </button>
      )}
    </div>
  );
}

export function KotakDataKosong({
  judul = 'Belum Ada Data',
  pesan,
}: {
  judul?: string;
  pesan: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas text-ink-600">
        <Inbox className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-2 text-sm font-semibold text-ink-900">{judul}</p>
      <p className="mt-1 max-w-md text-xs text-ink-600">{pesan}</p>
    </div>
  );
}
