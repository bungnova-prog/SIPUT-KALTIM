import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { susunProporsiSeranganKomoditas } from '../../lib/analitikRekap';
import { formatLuas, formatPersen } from '../../lib/format';
import { KOMODITAS_BAKU } from '../../lib/konfigurasi';
import type {
  BarisIntensitasKomoditas,
  BarisTrenTriwulanKomoditas,
} from '../../types/domain';
import { KotakDataKosong } from '../StatusMuatData';

interface PropsGrafikRekapitulasi {
  tahun: number;
  trenTriwulan: BarisTrenTriwulanKomoditas[];
  intensitasKomoditas: BarisIntensitasKomoditas[];
}

const GAYA_SERI_KOMODITAS: readonly {
  nama: string;
  stroke: string;
  dash?: string;
}[] = [
  { nama: 'Lada', stroke: 'var(--token-brand-900)' },
  { nama: 'Kelapa Sawit', stroke: 'var(--token-danger-600)' },
  { nama: 'Kakao', stroke: 'var(--token-gold-500)' },
  { nama: 'Karet', stroke: 'var(--token-ok-500)', dash: '6 3' },
  { nama: 'Aren', stroke: 'var(--token-brand-700)', dash: '3 3' },
  { nama: 'Kelapa Dalam', stroke: 'var(--token-ink-900)', dash: '8 3 2 3' },
  { nama: 'Kopi', stroke: 'var(--token-ink-600)', dash: '4 4' },
];

function useKurangiGerak(): boolean {
  const [kurangi, setKurangi] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setKurangi(mq.matches);
    const handler = (e: MediaQueryListEvent) => setKurangi(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return kurangi;
}

export function GrafikRekapitulasi({
  tahun,
  trenTriwulan,
  intensitasKomoditas,
}: PropsGrafikRekapitulasi) {
  const kurangiGerak = useKurangiGerak();

  const dataProporsi = useMemo(
    () =>
      susunProporsiSeranganKomoditas(intensitasKomoditas).filter(
        (item) => item.luasTotal > 0
      ),
    [intensitasKomoditas]
  );

  // Tampilkan seri komoditas yang memiliki nilai > 0 sepanjang tahun (atau 4 teratas bila kosong)
  const seriAktif = useMemo(() => {
    const denganData = GAYA_SERI_KOMODITAS.filter((gaya) =>
      trenTriwulan.some((baris) => Number(baris[gaya.nama] ?? 0) > 0)
    );
    return denganData.length > 0 ? denganData : GAYA_SERI_KOMODITAS.slice(0, 4);
  }, [trenTriwulan]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* GRAFIK 1: TREN FLUKTUASI SERANGAN PER KOMODITAS (Garis per Triwulan — DESIGN.md §4.4) */}
      <section
        aria-labelledby="judul-grafik-fluktuasi-tw"
        className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
      >
        <div className="flex items-start justify-between gap-2 border-b border-line pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
              <h2
                id="judul-grafik-fluktuasi-tw"
                className="text-base font-bold text-ink-900"
              >
                Tren Fluktuasi Serangan per Komoditas (TA {tahun})
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-ink-600">
              Pergerakan akumulasi luas serangan OPT (Ha) dari Triwulan I s.d. Triwulan IV.
            </p>
          </div>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trenTriwulan}
              margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke="var(--token-line)" strokeDasharray="4 4" />
              <XAxis
                dataKey="triwulanLabel"
                tick={{ fill: 'var(--token-ink-600)', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: 'var(--token-ink-600)', fontSize: 11 }}
                unit=" Ha"
                width={58}
              />
              <Tooltip
                formatter={(nilai: number | string | ReadonlyArray<number | string>) => {
                  const angka = typeof nilai === 'number' ? nilai : Number(nilai);
                  return formatLuas(Number.isFinite(angka) ? angka : 0);
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {seriAktif.map((seri) => (
                <Line
                  key={seri.nama}
                  type="monotone"
                  dataKey={seri.nama}
                  name={seri.nama}
                  stroke={seri.stroke}
                  strokeWidth={2.5}
                  strokeDasharray={seri.dash}
                  dot={{ r: 4 }}
                  isAnimationActive={!kurangiGerak}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alternatif Tabel Aksesibilitas Pembaca Layar (DESIGN.md §5) */}
        <details className="mt-3 rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs">
          <summary className="cursor-pointer font-semibold text-brand-900">
            Ringkasan Tabel Data Tren Triwulan (Aksesibilitas)
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-line font-bold text-ink-900">
                  <th className="py-1 pr-2">Periode</th>
                  {KOMODITAS_BAKU.map((nama) => (
                    <th key={nama} className="px-2 py-1 text-right">
                      {nama}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trenTriwulan.map((baris) => (
                  <tr key={String(baris.triwulanLabel)} className="border-b border-line/60">
                    <td className="py-1 pr-2 font-semibold text-ink-900">
                      {baris.triwulanLabel}
                    </td>
                    {KOMODITAS_BAKU.map((nama) => (
                      <td key={nama} className="px-2 py-1 text-right tabular-nums text-ink-600">
                        {formatLuas(Number(baris[nama] ?? 0), 1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* GRAFIK 2: PROPORSI SERANGAN BERAT VS RINGAN (Batang Horizontal Persen — DESIGN.md §4.4) */}
      <section
        aria-labelledby="judul-grafik-proporsi"
        className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
      >
        <div className="flex items-start justify-between gap-2 border-b border-line pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
              <h2
                id="judul-grafik-proporsi"
                className="text-base font-bold text-ink-900"
              >
                Proporsi Serangan Berat vs Ringan (%)
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-ink-600">
              Perbandingan persentase luas serangan ringan/sedang dan berat pada komoditas
              terdampak.
            </p>
          </div>
        </div>

        {dataProporsi.length === 0 ? (
          <div className="mt-4">
            <KotakDataKosong
              judul="Belum Ada Proporsi Serangan"
              pesan="Tidak ada komoditas terdampak pada kombinasi filter rekapitulasi saat ini."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataProporsi}
                  layout="vertical"
                  margin={{ top: 8, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid stroke="var(--token-line)" strokeDasharray="4 4" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: 'var(--token-ink-600)', fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="namaKomoditas"
                    width={96}
                    tick={{ fill: 'var(--token-ink-900)', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    formatter={(nilai: number | string | ReadonlyArray<number | string>) => {
                      const angka = typeof nilai === 'number' ? nilai : Number(nilai);
                      return formatPersen(Number.isFinite(angka) ? angka : 0);
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="persenRinganSedang"
                    name="Ringan & Sedang (%)"
                    stackId="proporsi"
                    fill="var(--token-ok-500)"
                    radius={[4, 0, 0, 4]}
                    isAnimationActive={!kurangiGerak}
                  />
                  <Bar
                    dataKey="persenBerat"
                    name="Berat / Kritis (%)"
                    stackId="proporsi"
                    fill="var(--token-danger-600)"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={!kurangiGerak}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <details className="mt-3 rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs">
              <summary className="cursor-pointer font-semibold text-brand-900">
                Ringkasan Angka Proporsi per Komoditas (Aksesibilitas)
              </summary>
              <ul className="mt-2 space-y-1 text-[11px] text-ink-600">
                {dataProporsi.map((item) => (
                  <li key={item.namaKomoditas} className="flex justify-between gap-2">
                    <span className="font-semibold text-ink-900">{item.namaKomoditas}</span>
                    <span className="tabular-nums">
                      Ringan/Sedang {formatPersen(item.persenRinganSedang)} · Berat{' '}
                      <strong className="text-danger-600">
                        {formatPersen(item.persenBerat)}
                      </strong>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
