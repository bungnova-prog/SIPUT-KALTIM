import {
  Crosshair,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { susunNomorHalaman } from '../../lib/analitikDashboard';
import { formatLuas, formatPersen } from '../../lib/format';
import type { BarisKerentananWilayah } from '../../types/domain';
import { LencanaTingkatSerangan } from '../LencanaStatus';
import { KotakDataKosong } from '../StatusMuatData';

interface PropsTabelKerentananWilayah {
  baris: BarisKerentananWilayah[];
  sedangEksporExcel: boolean;
  sedangEksporPdf: boolean;
  onUnduhGeodataExcel: () => void;
  onCetakPetaPdf: () => void;
  onFokusKabupaten: (kabupatenId: string) => void;
}

const UKURAN_HALAMAN = 6;

export function TabelKerentananWilayah({
  baris,
  sedangEksporExcel,
  sedangEksporPdf,
  onUnduhGeodataExcel,
  onCetakPetaPdf,
  onFokusKabupaten,
}: PropsTabelKerentananWilayah) {
  const [halaman, setHalaman] = useState(1);

  const totalHalaman = Math.max(1, Math.ceil(baris.length / UKURAN_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const indeksAwal = (halamanAman - 1) * UKURAN_HALAMAN;
  const barisTampil = baris.slice(indeksAwal, indeksAwal + UKURAN_HALAMAN);
  const deretHalaman = susunNomorHalaman(halamanAman, totalHalaman);

  return (
    <section
      aria-labelledby="judul-rekap-kerentanan-gis"
      className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
            <h2
              id="judul-rekap-kerentanan-gis"
              className="text-base font-bold text-ink-900 sm:text-lg"
            >
              Rekapitulasi Wilayah Paling Rentan OPT
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-ink-600">
            Peringkat kabupaten/kota berdasarkan intensitas dan akumulasi luas serangan sesuai
            filter spasial aktif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={sedangEksporExcel || baris.length === 0}
            onClick={onUnduhGeodataExcel}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-100 px-3.5 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100/80 disabled:opacity-60"
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden />
            <span>{sedangEksporExcel ? 'Menyiapkan Excel...' : 'Unduh Geodata Excel'}</span>
          </button>

          <button
            type="button"
            disabled={sedangEksporPdf || baris.length === 0}
            onClick={onCetakPetaPdf}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-danger-600 px-3.5 py-2 text-xs font-bold text-surface hover:opacity-95 disabled:opacity-60"
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            <span>{sedangEksporPdf ? 'Menyiapkan PDF...' : 'Cetak Peta Spasial PDF'}</span>
          </button>
        </div>
      </div>

      {baris.length === 0 ? (
        <div className="mt-4">
          <KotakDataKosong
            judul="Belum Ada Wilayah Terdampak pada Filter Ini"
            pesan="Sesuaikan kembali parameter filter spasial untuk melihat peringkat kerentanan kabupaten/kota."
          />
        </div>
      ) : (
        <>
          {/* Tabel Desktop (>= 768px) */}
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  <th className="px-3.5 py-3">Kabupaten / Wilayah</th>
                  <th className="px-3.5 py-3">Kecamatan Terparah</th>
                  <th className="px-3.5 py-3">Komoditas Utama</th>
                  <th className="px-3.5 py-3">Nama OPT Dominan</th>
                  <th className="px-3.5 py-3 text-right">Luas Serangan</th>
                  <th className="px-3.5 py-3">Status Ancaman</th>
                  <th className="px-3.5 py-3">Tindakan Lapangan</th>
                  <th className="px-3.5 py-3 text-center">Peta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {barisTampil.map((item) => (
                  <tr key={item.kabupatenId} className="hover:bg-canvas/50">
                    <td className="px-3.5 py-3.5 font-bold text-ink-900">
                      {item.namaKabupaten}
                    </td>
                    <td className="px-3.5 py-3.5 text-xs font-medium text-ink-900">
                      Kec. {item.kecamatanTerparah}
                    </td>
                    <td className="px-3.5 py-3.5 text-xs font-semibold text-brand-900">
                      {item.komoditasUtama}
                    </td>
                    <td className="px-3.5 py-3.5 text-xs">
                      <p className="font-semibold text-ink-900">{item.namaOptLokal}</p>
                      <p className="italic text-ink-600">{item.namaOptIlmiah}</p>
                    </td>
                    <td className="px-3.5 py-3.5 text-right tabular-nums">
                      <p className="font-bold text-ink-900">
                        {formatLuas(item.luasSerangan)}
                      </p>
                      <p className="text-[11px] text-ink-600">
                        Rata-rata {formatPersen(item.intensitasRata)}
                      </p>
                    </td>
                    <td className="px-3.5 py-3.5">
                      <LencanaTingkatSerangan tingkat={item.tingkatAncaman} />
                    </td>
                    <td className="max-w-[240px] px-3.5 py-3.5 text-xs text-ink-600">
                      {item.tindakanLapangan}
                    </td>
                    <td className="px-3.5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => onFokusKabupaten(item.kabupatenId)}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-brand-100/60"
                      >
                        <Crosshair className="h-3.5 w-3.5" aria-hidden />
                        <span>Fokus</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu Responsif Ponsel (< 768px — Lebar 360px) */}
          <div className="mt-4 space-y-3 md:hidden">
            {barisTampil.map((item) => (
              <article
                key={item.kabupatenId}
                className="space-y-2.5 rounded-xl border border-line bg-canvas/50 p-3.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">
                      {item.namaKabupaten}
                    </h3>
                    <p className="text-ink-600">Kecamatan Terparah: {item.kecamatanTerparah}</p>
                  </div>
                  <LencanaTingkatSerangan tingkat={item.tingkatAncaman} />
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface p-2.5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-ink-600">
                      Komoditas & OPT
                    </p>
                    <p className="mt-0.5 font-bold text-brand-900">{item.komoditasUtama}</p>
                    <p className="text-ink-900">
                      {item.namaOptLokal}{' '}
                      <span className="italic text-ink-600">({item.namaOptIlmiah})</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase text-ink-600">
                      Luas Serangan
                    </p>
                    <p className="mt-0.5 font-extrabold tabular-nums text-danger-600">
                      {formatLuas(item.luasSerangan)}
                    </p>
                    <p className="tabular-nums text-ink-600">
                      Intensitas {formatPersen(item.intensitasRata)}
                    </p>
                  </div>
                </div>

                <p className="text-ink-600">
                  <strong className="text-ink-900">Tindakan:</strong> {item.tindakanLapangan}
                </p>

                <button
                  type="button"
                  onClick={() => onFokusKabupaten(item.kabupatenId)}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 font-bold text-brand-900 hover:bg-brand-100/50"
                >
                  <Crosshair className="h-4 w-4" aria-hidden />
                  <span>Fokuskan ke {item.namaKabupaten}</span>
                </button>
              </article>
            ))}
          </div>

          {/* Paginasi */}
          {totalHalaman > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5 text-xs text-ink-600">
              <span>
                Menampilkan <strong className="text-ink-900">{indeksAwal + 1}</strong>–
                <strong className="text-ink-900">
                  {Math.min(indeksAwal + UKURAN_HALAMAN, baris.length)}
                </strong>{' '}
                dari <strong className="text-ink-900">{baris.length}</strong> wilayah terdampak
              </span>
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
            </div>
          )}
        </>
      )}
    </section>
  );
}
