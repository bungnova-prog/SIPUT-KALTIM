import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
  Leaf,
  RotateCcw,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { ringkasUptdAktif } from '../../lib/petaGis';
import type {
  FilterLaporan,
  Komoditas,
  TingkatSerangan,
  Uptd,
  Wilayah,
} from '../../types/domain';

export interface DrafFilterSpasial {
  kabupatenId: string;
  kecamatanId: string;
  desaId: string;
  komoditasIds: string[];
  tingkatList: TingkatSerangan[];
  modePeriode: 'realtime' | 'triwulan' | 'semester';
  tahun: number;
  triwulan: 1 | 2 | 3 | 4;
  semester: 1 | 2;
}

interface PropsPanelFilterSpasial {
  draf: DrafFilterSpasial;
  semuaWilayah: Wilayah[];
  daftarKomoditas: Komoditas[];
  daftarUptd: Uptd[];
  filterAktif: FilterLaporan;
  onUbahDraf: (baru: DrafFilterSpasial) => void;
  onTerapkan: () => void;
  onReset: () => void;
}

export function PanelFilterSpasial({
  draf,
  semuaWilayah,
  daftarKomoditas,
  daftarUptd,
  filterAktif,
  onUbahDraf,
  onTerapkan,
  onReset,
}: PropsPanelFilterSpasial) {
  const [terbukaPonsel, setTerbukaPonsel] = useState(false);

  const daftarKabupaten = semuaWilayah.filter((w) => w.tipe === 'kabupaten');
  const daftarKecamatan = semuaWilayah.filter(
    (w) => w.tipe === 'kecamatan' && (!draf.kabupatenId || w.parentId === draf.kabupatenId)
  );
  const daftarDesa = semuaWilayah.filter(
    (w) => w.tipe === 'desa' && (!draf.kecamatanId || w.parentId === draf.kecamatanId)
  );

  const infoUptd = ringkasUptdAktif(
    daftarUptd,
    filterAktif.kabupatenId || draf.kabupatenId || undefined
  );

  const toggleKomoditas = (id: string) => {
    const ada = draf.komoditasIds.includes(id);
    const baru = ada
      ? draf.komoditasIds.filter((k) => k !== id)
      : [...draf.komoditasIds, id];
    onUbahDraf({ ...draf, komoditasIds: baru });
  };

  const toggleTingkat = (tingkat: TingkatSerangan) => {
    const ada = draf.tingkatList.includes(tingkat);
    const baru = ada
      ? draf.tingkatList.filter((t) => t !== tingkat)
      : [...draf.tingkatList, tingkat];
    onUbahDraf({ ...draf, tingkatList: baru });
  };

  return (
    <aside className="space-y-4">
      {/* Tombol Lipat Filter pada Ponsel (< 1024px — DESIGN.md §3) */}
      <button
        type="button"
        onClick={() => setTerbukaPonsel((v) => !v)}
        aria-expanded={terbukaPonsel}
        className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm font-bold text-brand-900 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-700" aria-hidden />
          <span>Filter Spasial & Komoditas (4 Langkah)</span>
        </span>
        {terbukaPonsel ? (
          <ChevronUp className="h-4 w-4 text-ink-600" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-600" aria-hidden />
        )}
      </button>

      <div className={`${terbukaPonsel ? 'block' : 'hidden'} space-y-4 lg:block`}>
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3.5">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 shrink-0 text-brand-900" aria-hidden />
              <h2 className="text-base font-bold text-ink-900">
                Filter Spasial & Komoditas
              </h2>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100/60"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {/* LANGKAH 1: WILAYAH BERTINGKAT */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-surface">
                  1
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                  Wilayah Administratif Bertingkat
                </h3>
              </div>

              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="filter-gis-kabupaten"
                    className="block text-[11px] font-semibold text-ink-600"
                  >
                    Kabupaten / Kota
                  </label>
                  <select
                    id="filter-gis-kabupaten"
                    value={draf.kabupatenId}
                    onChange={(e) =>
                      onUbahDraf({
                        ...draf,
                        kabupatenId: e.target.value,
                        kecamatanId: '',
                        desaId: '',
                      })
                    }
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900 focus:border-brand-700"
                  >
                    <option value="">Seluruh Kabupaten / Kota (10 Wilayah)</option>
                    {daftarKabupaten.map((kab) => (
                      <option key={kab.id} value={kab.id}>
                        {kab.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <label
                      htmlFor="filter-gis-kecamatan"
                      className="block text-[11px] font-semibold text-ink-600"
                    >
                      Kecamatan
                    </label>
                    <select
                      id="filter-gis-kecamatan"
                      value={draf.kecamatanId}
                      disabled={!draf.kabupatenId}
                      onChange={(e) =>
                        onUbahDraf({
                          ...draf,
                          kecamatanId: e.target.value,
                          desaId: '',
                        })
                      }
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-900 focus:border-brand-700 disabled:bg-canvas disabled:text-ink-600"
                    >
                      <option value="">Semua Kecamatan</option>
                      {daftarKecamatan.map((kec) => (
                        <option key={kec.id} value={kec.id}>
                          {kec.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="filter-gis-desa"
                      className="block text-[11px] font-semibold text-ink-600"
                    >
                      Desa / Kelurahan
                    </label>
                    <select
                      id="filter-gis-desa"
                      value={draf.desaId}
                      disabled={!draf.kecamatanId}
                      onChange={(e) =>
                        onUbahDraf({
                          ...draf,
                          desaId: e.target.value,
                        })
                      }
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-900 focus:border-brand-700 disabled:bg-canvas disabled:text-ink-600"
                    >
                      <option value="">Semua Desa / Kelurahan</option>
                      {daftarDesa.map((desa) => (
                        <option key={desa.id} value={desa.id}>
                          {desa.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* LANGKAH 2: KOMODITAS DUA KOLOM */}
            <div className="space-y-2.5 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-surface">
                    2
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                    Komoditas Perkebunan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUbahDraf({
                      ...draf,
                      komoditasIds:
                        draf.komoditasIds.length === daftarKomoditas.length
                          ? []
                          : daftarKomoditas.map((k) => k.id),
                    })
                  }
                  className="text-[11px] font-semibold text-brand-700 hover:underline"
                >
                  {draf.komoditasIds.length === daftarKomoditas.length
                    ? 'Kosongkan Pilihan'
                    : 'Pilih Semua (7)'}
                </button>
              </div>
              <p className="text-[11px] text-ink-600">
                Kosongkan centang untuk menampilkan seluruh 7 komoditas baku sekaligus.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {daftarKomoditas.map((kom) => {
                  const terpilih = draf.komoditasIds.includes(kom.id);
                  const idCek = `cek-gis-kom-${kom.id}`;
                  return (
                    <label
                      key={kom.id}
                      htmlFor={idCek}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-colors ${
                        terpilih
                          ? 'border-brand-900 bg-brand-100/70 text-brand-900'
                          : 'border-line bg-surface text-ink-900 hover:bg-canvas'
                      }`}
                    >
                      <input
                        id={idCek}
                        type="checkbox"
                        checked={terpilih}
                        onChange={() => toggleKomoditas(kom.id)}
                        className="h-4 w-4 shrink-0 rounded border-line accent-brand-900"
                      />
                      <span className="leading-tight">{kom.nama}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* LANGKAH 3: TINGKAT KEPARAHAN DENGAN LENCANA ZONA */}
            <div className="space-y-2.5 border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-surface">
                  3
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                  Tingkat Keparahan & Zona
                </h3>
              </div>

              <div className="space-y-2">
                {(
                  [
                    {
                      nilai: 'berat' as const,
                      label: 'Berat (Eksplosif)',
                      zona: 'Zona Merah',
                      kelasLencana: 'bg-danger-100 text-danger-600',
                      Ikon: AlertOctagon,
                    },
                    {
                      nilai: 'sedang' as const,
                      label: 'Sedang (Waspada)',
                      zona: 'Zona Kuning',
                      kelasLencana: 'bg-gold-100 text-ink-900',
                      Ikon: AlertTriangle,
                    },
                    {
                      nilai: 'ringan' as const,
                      label: 'Ringan (Terkendali)',
                      zona: 'Zona Hijau',
                      kelasLencana: 'bg-ok-100 text-ink-900',
                      Ikon: Leaf,
                    },
                  ] as const
                ).map((opsi) => {
                  const terpilih = draf.tingkatList.includes(opsi.nilai);
                  const idCek = `cek-gis-tingkat-${opsi.nilai}`;
                  const Ikon = opsi.Ikon;
                  return (
                    <label
                      key={opsi.nilai}
                      htmlFor={idCek}
                      className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                        terpilih
                          ? 'border-brand-900 bg-canvas font-bold text-ink-900'
                          : 'border-line bg-surface font-medium text-ink-900 hover:bg-canvas/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          id={idCek}
                          type="checkbox"
                          checked={terpilih}
                          onChange={() => toggleTingkat(opsi.nilai)}
                          className="h-4 w-4 shrink-0 rounded border-line accent-brand-900"
                        />
                        <span>{opsi.label}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${opsi.kelasLencana}`}
                      >
                        <Ikon className="h-3 w-3 shrink-0" aria-hidden />
                        <span>{opsi.zona}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* LANGKAH 4: PERIODE PENGAMATAN */}
            <div className="space-y-2.5 border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-surface">
                  4
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                  Periode Data Spasial
                </h3>
              </div>

              <div
                role="tablist"
                aria-label="Mode periode peta spasial"
                className="grid grid-cols-3 gap-1 rounded-xl bg-canvas p-1"
              >
                {(
                  [
                    { nilai: 'realtime', label: 'Real-Time' },
                    { nilai: 'triwulan', label: 'Triwulan' },
                    { nilai: 'semester', label: 'Semester' },
                  ] as const
                ).map((tab) => {
                  const aktif = draf.modePeriode === tab.nilai;
                  return (
                    <button
                      key={tab.nilai}
                      type="button"
                      role="tab"
                      aria-selected={aktif}
                      onClick={() => onUbahDraf({ ...draf, modePeriode: tab.nilai })}
                      className={`min-h-[44px] rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                        aktif
                          ? 'bg-brand-900 text-surface shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="filter-gis-tahun"
                    className="block text-[11px] font-semibold text-ink-600"
                  >
                    Tahun Anggaran
                  </label>
                  <select
                    id="filter-gis-tahun"
                    value={draf.tahun}
                    onChange={(e) =>
                      onUbahDraf({ ...draf, tahun: Number.parseInt(e.target.value, 10) })
                    }
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-semibold tabular-nums text-ink-900"
                  >
                    <option value={2026}>2026 (Berjalan)</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                {draf.modePeriode === 'triwulan' && (
                  <div>
                    <label
                      htmlFor="filter-gis-tw"
                      className="block text-[11px] font-semibold text-ink-600"
                    >
                      Pilih Triwulan
                    </label>
                    <select
                      id="filter-gis-tw"
                      value={draf.triwulan}
                      onChange={(e) =>
                        onUbahDraf({
                          ...draf,
                          triwulan: Number.parseInt(e.target.value, 10) as 1 | 2 | 3 | 4,
                        })
                      }
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-semibold text-ink-900"
                    >
                      <option value={1}>TW I (Jan–Mar)</option>
                      <option value={2}>TW II (Apr–Jun)</option>
                      <option value={3}>TW III (Jul–Sep)</option>
                      <option value={4}>TW IV (Okt–Des)</option>
                    </select>
                  </div>
                )}

                {draf.modePeriode === 'semester' && (
                  <div>
                    <label
                      htmlFor="filter-gis-semester"
                      className="block text-[11px] font-semibold text-ink-600"
                    >
                      Pilih Semester
                    </label>
                    <select
                      id="filter-gis-semester"
                      value={draf.semester}
                      onChange={(e) =>
                        onUbahDraf({
                          ...draf,
                          semester: Number.parseInt(e.target.value, 10) as 1 | 2,
                        })
                      }
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-semibold text-ink-900"
                    >
                      <option value={1}>Semester I (TW I–II)</option>
                      <option value={2}>Semester II (TW III–IV)</option>
                    </select>
                  </div>
                )}

                {draf.modePeriode === 'realtime' && (
                  <div className="flex flex-col justify-end">
                    <div className="flex min-h-[44px] items-center rounded-xl border border-line bg-canvas px-3 text-[11px] font-semibold text-brand-900">
                      Seluruh TW Aktif
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TOMBOL PENUH TERAPKAN FILTER SPASIAL */}
            <button
              type="button"
              onClick={() => {
                onTerapkan();
                setTerbukaPonsel(false);
              }}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-surface hover:bg-brand-700"
            >
              <Filter className="h-4 w-4 shrink-0" aria-hidden />
              <span>Terapkan Filter Spasial</span>
            </button>
          </div>
        </section>

        {/* KARTU UPTD WILAYAH — n PENGAMAT AKTIF (DESIGN.md §4.2) */}
        <section className="rounded-2xl border border-line bg-brand-900 p-4 text-surface">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-gold-500">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-500">
                Unit Pelaksana Wilayah Kerja
              </p>
              <h3 className="mt-0.5 text-sm font-bold leading-snug">{infoUptd.namaUnit}</h3>
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-surface">
                <Users className="h-3.5 w-3.5 text-gold-500" aria-hidden />
                <span className="tabular-nums">{infoUptd.jumlahPengamat} Pengamat Aktif</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
