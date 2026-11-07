import { Search, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { susunNomorHalaman } from '../../lib/analitikDashboard';
import { hitungKonsolidasiMatriks } from '../../lib/analitikRekap';
import { formatLuas, formatPersen } from '../../lib/format';
import type { BarisMatriksKabupaten } from '../../types/domain';
import { KotakDataKosong } from '../StatusMuatData';

interface PropsTabelMatriksKabupaten {
  matriks: BarisMatriksKabupaten[];
}

const UKURAN_HALAMAN = 5;

export function TabelMatriksKabupaten({ matriks }: PropsTabelMatriksKabupaten) {
  const [kataKunci, setKataKunci] = useState('');
  const [halaman, setHalaman] = useState(1);

  const matriksTersaring = useMemo(() => {
    const q = kataKunci.trim().toLowerCase();
    if (!q) return matriks;
    return matriks.filter((item) =>
      [
        item.namaKabupaten,
        item.daftarKecamatan,
        item.komoditasUtama,
        item.optDominanLokal,
        item.optDominanIlmiah,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [kataKunci, matriks]);

  const konsolidasi = useMemo(
    () => hitungKonsolidasiMatriks(matriksTersaring),
    [matriksTersaring]
  );

  const totalHalaman = Math.max(1, Math.ceil(matriksTersaring.length / UKURAN_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const indeksAwal = (halamanAman - 1) * UKURAN_HALAMAN;
  const barisHalaman = matriksTersaring.slice(indeksAwal, indeksAwal + UKURAN_HALAMAN);
  const deretHalaman = susunNomorHalaman(halamanAman, totalHalaman);

  return (
    <section
      aria-labelledby="judul-matriks-kabkota"
      className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Table2 className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
            <h2
              id="judul-matriks-kabkota"
              className="text-base font-bold text-ink-900 sm:text-lg"
            >
              Matriks Konsolidasi Kabupaten / Kota Se-Kalimantan Timur
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-ink-600">
            Rincian 10 wilayah administratif beserta proporsi serangan ringan, berat, dan luas
            pengendalian terpadu.
          </p>
        </div>

        {/* Pencarian Wilayah / OPT */}
        <div className="relative w-full lg:w-72">
          <label htmlFor="cari-matriks-rekap" className="sr-only">
            Cari kabupaten, kecamatan, komoditas, atau OPT pada matriks
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
            aria-hidden
          />
          <input
            id="cari-matriks-rekap"
            type="search"
            value={kataKunci}
            onChange={(e) => {
              setKataKunci(e.target.value);
              setHalaman(1);
            }}
            placeholder="Cari wilayah, komoditas, OPT..."
            className="min-h-[44px] w-full rounded-xl border border-line bg-canvas/60 pl-9 pr-3 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-600/70 focus:border-brand-700 focus:bg-surface"
          />
        </div>
      </div>

      {matriksTersaring.length === 0 ? (
        <div className="mt-4">
          <KotakDataKosong
            judul="Wilayah Tidak Ditemukan"
            pesan="Tidak ada baris kabupaten/kota yang cocok dengan kata kunci pencarian Anda."
          />
        </div>
      ) : (
        <>
          {/* Tabel Desktop (>= 768px) — Header Kuning & Merah Muda + Footer Biru Muda (DESIGN.md §4.4) */}
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  <th className="px-3 py-3 text-center">No</th>
                  <th className="px-3 py-3">Wilayah Administratif</th>
                  <th className="px-3 py-3">Komoditas Utama</th>
                  <th className="px-3 py-3">OPT Dominan</th>
                  <th className="px-3 py-3 text-right">Luas Amatan</th>
                  <th className="bg-gold-100 px-3 py-3 text-right text-ink-900">
                    Ringan (Ha / %)
                  </th>
                  <th className="bg-danger-100 px-3 py-3 text-right text-danger-600">
                    Berat (Ha / %)
                  </th>
                  <th className="px-3 py-3 text-right">Total Serangan</th>
                  <th className="px-3 py-3 text-right">Pengendalian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {barisHalaman.map((m) => (
                  <tr key={m.kabupatenId} className="hover:bg-canvas/50">
                    <td className="px-3 py-3.5 text-center font-bold tabular-nums text-ink-600">
                      {m.no}
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-bold text-ink-900">{m.namaKabupaten}</p>
                      <p className="mt-0.5 text-[11px] text-ink-600">
                        Kec.: {m.daftarKecamatan}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-brand-900">
                      {m.komoditasUtama}
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-ink-900">{m.optDominanLokal}</p>
                      {m.optDominanIlmiah !== '-' && (
                        <p className="italic text-ink-600">{m.optDominanIlmiah}</p>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right font-semibold tabular-nums text-ink-900">
                      {formatLuas(m.luasAmatan)}
                    </td>
                    <td className="bg-gold-100/35 px-3 py-3.5 text-right tabular-nums text-ink-900">
                      <p className="font-bold">{formatLuas(m.luasRingan)}</p>
                      <p className="text-[11px] text-ink-600">
                        {formatPersen(m.persenRingan)}
                      </p>
                    </td>
                    <td className="bg-danger-100/35 px-3 py-3.5 text-right tabular-nums text-danger-600">
                      <p className="font-bold">{formatLuas(m.luasBerat)}</p>
                      <p className="text-[11px] text-ink-900">
                        {formatPersen(m.persenBerat)}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 text-right font-extrabold tabular-nums text-ink-900">
                      {formatLuas(m.totalSerangan)}
                    </td>
                    <td className="px-3 py-3.5 text-right font-semibold tabular-nums text-brand-900">
                      {formatLuas(m.luasTerkendali)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Baris Akhir "Total Konsolidasi Provinsi" Berlatar Biru Muda (DESIGN.md §4.4) */}
              <tfoot>
                <tr className="border-t-2 border-brand-900/20 bg-info-100 font-bold text-ink-900">
                  <td className="px-3 py-3.5 text-center">—</td>
                  <td className="px-3 py-3.5">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-brand-900">
                      Total Konsolidasi Provinsi
                    </p>
                    <p className="text-[11px] font-medium text-ink-600">
                      {konsolidasi.jumlahKabupatenTerdampak} dari {matriksTersaring.length} Kab/Kota
                      melaporkan serangan aktif
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-ink-600">Konsolidasi</td>
                  <td className="px-3 py-3.5 text-ink-600">Lintas OPT</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">
                    {formatLuas(konsolidasi.luasAmatan)}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums">
                    <p>{formatLuas(konsolidasi.luasRingan)}</p>
                    <p className="text-[11px] font-semibold text-ink-600">
                      {formatPersen(konsolidasi.persenRingan)}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-danger-600">
                    <p>{formatLuas(konsolidasi.luasBerat)}</p>
                    <p className="text-[11px] font-semibold text-ink-900">
                      {formatPersen(konsolidasi.persenBerat)}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-right font-extrabold tabular-nums text-brand-900">
                    {formatLuas(konsolidasi.totalSerangan)}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-brand-900">
                    {formatLuas(konsolidasi.luasTerkendali)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Tampilan Kartu Responsif Ponsel (< 768px — Lebar 360px) */}
          <div className="mt-4 space-y-3 md:hidden">
            {barisHalaman.map((m) => (
              <article
                key={m.kabupatenId}
                className="space-y-2.5 rounded-xl border border-line bg-canvas/50 p-3.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-brand-700">Wilayah #{m.no}</p>
                    <h3 className="text-sm font-bold text-ink-900">{m.namaKabupaten}</h3>
                    <p className="text-[11px] text-ink-600">Kec.: {m.daftarKecamatan}</p>
                  </div>
                  <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-900">
                    {m.komoditasUtama}
                  </span>
                </div>

                <p className="text-ink-900">
                  <span className="text-ink-600">OPT Dominan:</span>{' '}
                  <strong>{m.optDominanLokal}</strong>{' '}
                  {m.optDominanIlmiah !== '-' && (
                    <span className="italic text-ink-600">({m.optDominanIlmiah})</span>
                  )}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gold-100/70 p-2">
                    <p className="text-[10px] font-bold uppercase text-ink-900">Ringan</p>
                    <p className="font-bold tabular-nums text-ink-900">
                      {formatLuas(m.luasRingan)} ({formatPersen(m.persenRingan)})
                    </p>
                  </div>
                  <div className="rounded-lg bg-danger-100 p-2">
                    <p className="text-[10px] font-bold uppercase text-danger-600">Berat</p>
                    <p className="font-bold tabular-nums text-danger-600">
                      {formatLuas(m.luasBerat)} ({formatPersen(m.persenBerat)})
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-2">
                    <p className="text-[10px] font-bold uppercase text-ink-600">
                      Total / Amatan
                    </p>
                    <p className="font-bold tabular-nums text-ink-900">
                      {formatLuas(m.totalSerangan)} / {formatLuas(m.luasAmatan)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-2">
                    <p className="text-[10px] font-bold uppercase text-ink-600">
                      Pengendalian
                    </p>
                    <p className="font-bold tabular-nums text-brand-900">
                      {formatLuas(m.luasTerkendali)}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {/* Kartu Total Konsolidasi Provinsi pada Ponsel */}
            <div className="rounded-xl border border-brand-900/20 bg-info-100 p-3.5 text-xs">
              <p className="font-extrabold uppercase tracking-wide text-brand-900">
                Total Konsolidasi Provinsi
              </p>
              <p className="mt-0.5 text-[11px] text-ink-600">
                {konsolidasi.jumlahKabupatenTerdampak} dari {matriksTersaring.length} Kab/Kota
                terdampak
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2 font-bold tabular-nums">
                <div>
                  <span className="block text-[10px] uppercase text-ink-600">Luas Amatan</span>
                  <span className="text-ink-900">{formatLuas(konsolidasi.luasAmatan)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-ink-600">
                    Total Serangan
                  </span>
                  <span className="text-brand-900">
                    {formatLuas(konsolidasi.totalSerangan)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-ink-600">
                    Ringan ({formatPersen(konsolidasi.persenRingan)})
                  </span>
                  <span className="text-ink-900">{formatLuas(konsolidasi.luasRingan)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-danger-600">
                    Berat ({formatPersen(konsolidasi.persenBerat)})
                  </span>
                  <span className="text-danger-600">{formatLuas(konsolidasi.luasBerat)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paginasi */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5 text-xs text-ink-600">
            <span>
              Menampilkan <strong className="text-ink-900">{indeksAwal + 1}</strong>–
              <strong className="text-ink-900">
                {Math.min(indeksAwal + UKURAN_HALAMAN, matriksTersaring.length)}
              </strong>{' '}
              dari <strong className="text-ink-900">{matriksTersaring.length}</strong> kabupaten/kota
            </span>

            {totalHalaman > 1 && (
              <div className="flex items-center gap-1">
                {deretHalaman.map((nomor, idx) =>
                  nomor === 'elipsis' ? (
                    <span key={`el-${idx}`} className="px-2 py-1 text-ink-600">
                      …
                    </span>
                  ) : (
                    <button
                      key={nomor}
                      type="button"
                      onClick={() => setHalaman(nomor)}
                      aria-current={nomor === halamanAman ? 'page' : undefined}
                      className={`min-h-[44px] min-w-[44px] rounded-lg px-2.5 text-xs font-bold ${
                        nomor === halamanAman
                          ? 'bg-brand-900 text-surface'
                          : 'border border-line bg-surface text-ink-900 hover:bg-canvas'
                      }`}
                    >
                      {nomor}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
