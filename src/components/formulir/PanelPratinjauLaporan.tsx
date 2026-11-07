import {
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Eye,
  FlaskConical,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { formatKoordinat, formatLuas, formatPersen } from '../../lib/format';
import type { NilaiFormLaporan } from '../../lib/skemaFormLaporan';
import type {
  FaseTanaman,
  FotoInput,
  KonfigurasiSistem,
  Opt,
  TingkatSerangan,
} from '../../types/domain';
import { LencanaTingkatSerangan } from '../LencanaStatus';

interface PropsPanelPratinjauLaporan {
  nilai: NilaiFormLaporan;
  namaKabupaten: string;
  namaKecamatan: string;
  namaDesa: string;
  namaKomoditas: string;
  optTerpilih: Opt | null;
  intensitasPersen: number;
  tingkat: TingkatSerangan;
  fotos: FotoInput[];
  konfigurasi: KonfigurasiSistem;
}

const LABEL_FASE: Record<FaseTanaman, string> = {
  tbm: 'TBM (Belum Menghasilkan)',
  tm: 'TM (Menghasilkan)',
  ttm_tr: 'TTM/TR (Tua / Rusak)',
};

const LABEL_TW: Record<1 | 2 | 3 | 4, string> = {
  1: 'TW I (Jan–Mar)',
  2: 'TW II (Apr–Jun)',
  3: 'TW III (Jul–Sep)',
  4: 'TW IV (Okt–Des)',
};

export function PanelPratinjauLaporan({
  nilai,
  namaKabupaten,
  namaKecamatan,
  namaDesa,
  namaKomoditas,
  optTerpilih,
  intensitasPersen,
  tingkat,
  fotos,
  konfigurasi,
}: PropsPanelPratinjauLaporan) {
  const [terbukaPonsel, setTerbukaPonsel] = useState(true);
  const fotoUtama = fotos[0] ?? null;
  const luasTerdampak =
    Math.max(0, Number.isFinite(nilai.luasRingan) ? nilai.luasRingan : 0) +
    Math.max(0, Number.isFinite(nilai.luasBerat) ? nilai.luasBerat : 0);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      {/* Tombol Lipat khusus Ponsel (< 1024px) sesuai DESIGN.md §4.3 */}
      <button
        type="button"
        onClick={() => setTerbukaPonsel((v) => !v)}
        aria-expanded={terbukaPonsel}
        className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm font-bold text-brand-900 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-brand-700" aria-hidden />
          <span>Ringkasan Validasi (Live Preview) & Panduan POPT</span>
        </span>
        {terbukaPonsel ? (
          <ChevronUp className="h-4 w-4 text-ink-600" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-600" aria-hidden />
        )}
      </button>

      <div className={`${terbukaPonsel ? 'block' : 'hidden'} space-y-4 lg:block`}>
        {/* Kartu 1: Ringkasan Validasi Live Preview */}
        <section className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-2 bg-brand-900 px-4 py-3 text-surface">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
              <h2 className="text-sm font-bold">Ringkasan Validasi (Live Preview)</h2>
            </div>
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-900">
              Simulasi
            </span>
          </div>

          <div className="space-y-4 p-4">
            {/* Pratinjau Foto Utama */}
            <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
              {fotoUtama ? (
                <img
                  src={fotoUtama.pratinjauUrl}
                  alt={`Pratinjau dokumentasi ${fotoUtama.namaBerkas}`}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-36 flex-col items-center justify-center gap-1.5 px-4 text-center text-xs text-ink-600">
                  <Camera className="h-7 w-7 text-ink-600/70" aria-hidden />
                  <p className="font-semibold text-ink-900">Belum Ada Foto Dokumentasi</p>
                  <p>Unggah foto lapangan atau pilih contoh simulasi di Bagian V.</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-line bg-surface/95 px-3 py-2 text-[11px]">
                <span className="font-semibold text-brand-900">
                  Foto Geotagging ({fotos.length}/3 slot)
                </span>
                <LencanaTingkatSerangan tingkat={tingkat} />
              </div>
            </div>

            {/* Ringkasan Isian */}
            <dl className="divide-y divide-line text-xs">
              <div className="flex items-start justify-between gap-3 py-2">
                <dt className="text-ink-600">Periode Laporan</dt>
                <dd className="text-right font-semibold text-ink-900">
                  {LABEL_TW[nilai.triwulan]} · Sem {nilai.semester} · TA {nilai.tahun}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2">
                <dt className="text-ink-600">Wilayah & Blok</dt>
                <dd className="text-right font-semibold text-ink-900">
                  <p>{namaDesa || '-'}, Kec. {namaKecamatan || '-'}</p>
                  <p className="text-[11px] font-normal text-ink-600">
                    {namaKabupaten || '-'} · {nilai.namaBlok?.trim() || 'Blok belum diisi'}
                  </p>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2">
                <dt className="flex items-center gap-1 text-ink-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>Koordinat WGS84</span>
                </dt>
                <dd className="text-right font-mono text-[11px] font-semibold text-ink-900">
                  {Number.isFinite(nilai.lat) && Number.isFinite(nilai.lng)
                    ? formatKoordinat(nilai.lat, nilai.lng)
                    : '-'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2">
                <dt className="text-ink-600">Komoditas & Fase</dt>
                <dd className="text-right font-semibold text-ink-900">
                  <p>{namaKomoditas || '-'}</p>
                  <p className="text-[11px] font-normal text-ink-600">
                    {LABEL_FASE[nilai.faseTanaman]}
                  </p>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2">
                <dt className="text-ink-600">Organisme (OPT)</dt>
                <dd className="text-right font-semibold text-ink-900">
                  {optTerpilih ? (
                    <>
                      <p>{optTerpilih.namaLokal}</p>
                      <p className="text-[11px] italic font-normal text-ink-600">
                        {optTerpilih.namaIlmiah}
                      </p>
                    </>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3">
                <div className="rounded-lg bg-canvas p-2 text-center">
                  <p className="text-[10px] font-semibold uppercase text-ink-600">Amatan</p>
                  <p className="mt-0.5 font-bold tabular-nums text-ink-900">
                    {formatLuas(Number.isFinite(nilai.luasAmatan) ? nilai.luasAmatan : 0, 1)}
                  </p>
                </div>
                <div className="rounded-lg bg-canvas p-2 text-center">
                  <p className="text-[10px] font-semibold uppercase text-ink-600">Terdampak</p>
                  <p className="mt-0.5 font-bold tabular-nums text-danger-600">
                    {formatLuas(luasTerdampak, 1)}
                  </p>
                </div>
                <div className="rounded-lg bg-canvas p-2 text-center">
                  <p className="text-[10px] font-semibold uppercase text-ink-600">Intensitas</p>
                  <p className="mt-0.5 font-bold tabular-nums text-brand-900">
                    {formatPersen(intensitasPersen)}
                  </p>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {/* Kartu 2: Klasifikasi Bahaya OPT Kaltim */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-900" aria-hidden />
            <h3 className="text-sm font-bold text-ink-900">
              Klasifikasi Bahaya OPT Kaltim
            </h3>
          </div>
          <p className="mt-1 text-xs text-ink-600">
            Mengacu pada konfigurasi ambang GIS terpusat Provinsi Kalimantan Timur:
          </p>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex items-center justify-between rounded-lg bg-ok-100/70 px-3 py-2">
              <span className="font-semibold text-ink-900">Zona Hijau · Ringan</span>
              <span className="font-mono font-bold text-ink-900">
                &lt; {konfigurasi.klasifikasi.ambangSedangMin}%
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-gold-100 px-3 py-2">
              <span className="font-semibold text-ink-900">Zona Kuning · Sedang (Waspada)</span>
              <span className="font-mono font-bold text-ink-900">
                {konfigurasi.klasifikasi.ambangSedangMin}% – {konfigurasi.klasifikasi.ambangBeratMin}%
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-danger-100 px-3 py-2">
              <span className="font-semibold text-danger-600">Zona Merah · Berat (Darurat)</span>
              <span className="font-mono font-bold text-danger-600">
                &gt; {konfigurasi.klasifikasi.ambangBeratMin}%
              </span>
            </li>
          </ul>
          <p className="mt-2.5 rounded-lg border border-line bg-canvas px-3 py-2 text-[11px] text-ink-600">
            Ambang peringatan dini formulir aktif terpisah: pemberitahuan &gt;{' '}
            <strong className="text-ink-900">{konfigurasi.peringatanForm.ambangPeringatan}%</strong>{' '}
            dan eksplosif &gt;{' '}
            <strong className="text-danger-600">{konfigurasi.peringatanForm.ambangEksplosif}%</strong>.
          </p>
        </section>

        {/* Kartu 3: Kontak Laboratorium (Simulasi) */}
        <section className="rounded-2xl border border-line bg-brand-100/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 shrink-0 text-brand-900" aria-hidden />
              <h3 className="text-sm font-bold text-brand-900">
                Klinik & Laboratorium OPT
              </h3>
            </div>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-900">
              Data Simulasi
            </span>
          </div>
          <p className="mt-1.5 text-xs text-ink-900">
            UPTD Proteksi Tanaman Perkebunan Prov. Kaltim (Samarinda — Simulasi)
          </p>
          <p className="mt-1 text-[11px] text-ink-600">
            Bila ditemukan gejala patogen baru yang belum terdaftar di Katalog Khusus Kaltim,
            kirimkan spesimen berlabel kode formulir melalui kanal resmi UPTD (kontak ini adalah
            placeholder simulasi Fase 1).
          </p>
        </section>

        {/* Kartu 4: Panduan Petugas POPT */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
            <h3 className="text-sm font-bold text-ink-900">Panduan Petugas POPT</h3>
          </div>
          <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-xs text-ink-600">
            <li>
              Pastikan titik koordinat WGS84 diambil langsung di blok pengamatan menggunakan fitur{' '}
              <strong className="text-ink-900">Ambil Koordinat Otomatis</strong> atau pin pratinjau.
            </li>
            <li>
              Jumlah luas serangan ringan, berat, dan luas terkendali tidak boleh melebihi total
              luas pengamatan petak contoh.
            </li>
            <li>
              Foto dokumentasi dikompresi otomatis di peramban untuk menghapus metadata EXIF pribadi
              sebelum dikirimkan.
            </li>
            <li>
              Laporan yang dipublikasikan langsung berstatus{' '}
              <strong className="text-ink-900">Menunggu Validasi</strong> di Dashboard & Peta GIS.
            </li>
          </ol>
        </section>
      </div>
    </aside>
  );
}
