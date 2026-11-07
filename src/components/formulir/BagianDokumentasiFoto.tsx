import {
  Camera,
  ImagePlus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { formatKoordinat } from '../../lib/format';
import type { NilaiFormLaporan } from '../../lib/skemaFormLaporan';
import type { FotoInput } from '../../types/domain';

interface PropsBagianDokumentasiFoto {
  fotos: FotoInput[];
  sedangMemprosesFoto: boolean;
  galatFoto: string | null;
  onUnggahBerkas: (slot: 1 | 2 | 3, berkas: File) => void;
  onHapusFoto: (slot: 1 | 2 | 3) => void;
  register: UseFormRegister<NilaiFormLaporan>;
  errors: FieldErrors<NilaiFormLaporan>;
  rekomendasiKatalogOpt: string | null;
  onSalinRekomendasiOpt: () => void;
}

const DAFTAR_SLOT: readonly (1 | 2 | 3)[] = [1, 2, 3];

export function BagianDokumentasiFoto({
  fotos,
  sedangMemprosesFoto,
  galatFoto,
  onUnggahBerkas,
  onHapusFoto,
  register,
  errors,
  rekomendasiKatalogOpt,
  onSalinRekomendasiOpt,
}: PropsBagianDokumentasiFoto) {
  return (
    <section
      aria-labelledby="judul-bagian-5"
      className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-surface">
            V
          </span>
          <div>
            <h2 id="judul-bagian-5" className="text-base font-bold text-ink-900 sm:text-lg">
              Dokumentasi Geotagging & Rekomendasi Pengendalian
            </h2>
            <p className="mt-0.5 text-xs text-ink-600">
              Maksimal 3 foto lapangan (JPG/PNG ≤ 8 MB, dikompresi tanpa EXIF pribadi) serta rencana
              pengendalian terpadu (PHT).
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
          <Camera className="h-3.5 w-3.5" aria-hidden />
          <span>{fotos.length} / 3 Slot Terisi</span>
        </span>
      </div>

      {/* Tiga Slot Foto Dokumentasi */}
      <div className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DAFTAR_SLOT.map((slot) => {
            const itemFoto = fotos.find((f) => f.urutan === slot) ?? null;
            const idInputBerkas = `unggah-foto-slot-${slot}`;

            if (itemFoto) {
              return (
                <div
                  key={slot}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-canvas/50"
                >
                  <div className="relative">
                    <img
                      src={itemFoto.pratinjauUrl}
                      alt={`Dokumentasi slot ${slot}: ${itemFoto.namaBerkas}`}
                      className="h-36 w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-brand-900/90 px-2 py-0.5 text-[10px] font-bold text-surface">
                      Slot #{slot} · Geotagging
                    </span>
                  </div>
                  <div className="space-y-2 p-3">
                    <div>
                      <p
                        className="truncate text-xs font-semibold text-ink-900"
                        title={itemFoto.namaBerkas}
                      >
                        {itemFoto.namaBerkas}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-600">
                        {formatKoordinat(itemFoto.geotagLat, itemFoto.geotagLng)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onHapusFoto(slot)}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-danger-600/30 bg-danger-100/70 px-3 py-2 text-xs font-semibold text-danger-600 hover:bg-danger-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>Hapus Foto Slot #{slot}</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot}
                className="flex flex-col justify-between rounded-xl border-2 border-dashed border-line bg-canvas/40 p-3.5"
              >
                <div className="flex flex-col items-center justify-center py-3 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-900">
                    <ImagePlus className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-2 text-xs font-bold text-ink-900">
                    Slot Foto #{slot} (Kosong)
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-600">
                    JPG atau PNG · Maks. 8 MB
                  </p>
                </div>

                <div className="mt-2 space-y-2">
                  <label
                    htmlFor={idInputBerkas}
                    className={`flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-900 px-3 py-2 text-xs font-semibold text-surface hover:bg-brand-700 ${
                      sedangMemprosesFoto ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{sedangMemprosesFoto ? 'Memproses...' : 'Unggah Foto'}</span>
                  </label>
                  <input
                    id={idInputBerkas}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    disabled={sedangMemprosesFoto}
                    onChange={(e) => {
                      const berkas = e.target.files?.[0];
                      if (berkas) {
                        onUnggahBerkas(slot, berkas);
                      }
                      e.currentTarget.value = '';
                    }}
                    className="sr-only"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {galatFoto && (
          <p role="alert" className="mt-2.5 text-xs font-semibold text-danger-600">
            {galatFoto}
          </p>
        )}
        <p className="mt-2 text-[11px] text-ink-600">
          Catatan keamanan: foto diunggah ke bucket privat Supabase Storage menggunakan URL
          bertanda tangan berumur pendek dan tidak pernah ditulis ke draf lokal peramban.
        </p>
      </div>

      {/* Tiga Kotak Teks Rekomendasi */}
      <div className="mt-6 border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink-900">
              Rencana Tindakan & Rekomendasi Pengendalian Terpadu
            </h3>
            <p className="text-xs text-ink-600">
              Isikan langkah teknis di lapangan atau salin draf acuan dari katalog OPT terpilih.
            </p>
          </div>
          {rekomendasiKatalogOpt && (
            <button
              type="button"
              onClick={onSalinRekomendasiOpt}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-brand-100 px-3.5 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-100/80"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Isi Acuan Katalog OPT</span>
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="input-rekomendasi-kultur"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              1. Kultur Teknis
            </label>
            <textarea
              id="input-rekomendasi-kultur"
              rows={3}
              placeholder="Contoh: Sanitasi kebun, pemangkasan tajuk rimbun, perbaikan saluran drainase..."
              {...register('rekomendasiKultur')}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/60 focus:border-brand-700"
            />
            {errors.rekomendasiKultur && (
              <p role="alert" className="mt-1 text-xs font-medium text-danger-600">
                {errors.rekomendasiKultur.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="input-rekomendasi-hayati"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              2. Pengendalian Hayati
            </label>
            <textarea
              id="input-rekomendasi-hayati"
              rows={3}
              placeholder="Contoh: Aplikasi agens hayati Trichoderma sp. atau Beauveria bassiana pada pangkal batang..."
              {...register('rekomendasiHayati')}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/60 focus:border-brand-700"
            />
            {errors.rekomendasiHayati && (
              <p role="alert" className="mt-1 text-xs font-medium text-danger-600">
                {errors.rekomendasiHayati.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="input-rekomendasi-kimiawi"
              className="block text-xs font-bold uppercase tracking-wider text-ink-900"
            >
              3. Kimiawi / Eradikasi
            </label>
            <textarea
              id="input-rekomendasi-kimiawi"
              rows={3}
              placeholder="Contoh: Eradikasi terbatas rumpun terserang berat dan aplikasi pestisida terdaftar bila melampaui ambang..."
              {...register('rekomendasiKimiawi')}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/60 focus:border-brand-700"
            />
            {errors.rekomendasiKimiawi && (
              <p role="alert" className="mt-1 text-xs font-medium text-danger-600">
                {errors.rekomendasiKimiawi.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
