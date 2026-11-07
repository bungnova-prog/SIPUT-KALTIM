import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, BarChart2, TrendingUp } from 'lucide-react';
import {
  cariKomoditasPalingRentan,
  cariPuncakBulanan,
} from '../../lib/analitikDashboard';
import { formatAngka, formatLuas } from '../../lib/format';
import { KerangkaMuat, KotakDataKosong } from '../StatusMuatData';
import type {
  BarisIntensitasKomoditas,
  BarisTrenBulanan,
} from '../../types/domain';

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

function formatTooltipHa(
  nilai: number | string | ReadonlyArray<number | string>
): string {
  const angka = typeof nilai === 'number' ? nilai : Number(nilai);
  return formatLuas(Number.isFinite(angka) ? angka : 0);
}

interface TitikAreaProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: BarisTrenBulanan;
}

function TitikBulanAktif({ cx, cy, index, payload }: TitikAreaProps) {
  if (typeof cx !== 'number' || typeof cy !== 'number') {
    return <g key={`kosong-${index ?? 0}`} />;
  }
  if (!payload?.aktif) {
    return (
      <circle
        key={`titik-${index ?? 0}`}
        cx={cx}
        cy={cy}
        r={3}
        fill="var(--token-brand-700)"
      />
    );
  }
  return (
    <g key={`aktif-${index ?? 0}`}>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="var(--token-brand-900)"
        stroke="var(--token-surface)"
        strokeWidth={2}
      />
      <rect
        x={cx - 18}
        y={Math.max(4, cy - 26)}
        width={36}
        height={16}
        rx={8}
        fill="var(--token-brand-900)"
      />
      <text
        x={cx}
        y={Math.max(15, cy - 15)}
        textAnchor="middle"
        fill="var(--token-surface)"
        fontSize={9}
        fontWeight={700}
      >
        Aktif
      </text>
    </g>
  );
}

export default function GrafikDashboard({
  tahun,
  trenBulanan,
  intensitasKomoditas,
  memuat,
}: {
  tahun: number;
  trenBulanan: BarisTrenBulanan[];
  intensitasKomoditas: BarisIntensitasKomoditas[];
  memuat: boolean;
}) {
  const kurangiGerak = useKurangiGerak();

  if (memuat && trenBulanan.length === 0 && intensitasKomoditas.length === 0) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <KerangkaMuat pesan="Memuat grafik tren bulanan..." jumlahBaris={4} />
        <KerangkaMuat pesan="Memuat grafik intensitas per komoditas..." jumlahBaris={4} />
      </div>
    );
  }

  const infoPuncak = cariPuncakBulanan(trenBulanan);
  const palingRentan = cariKomoditasPalingRentan(intensitasKomoditas);

  return (
    <section
      className="grid gap-4 lg:grid-cols-2"
      aria-label="Visualisasi tren dan komoditas serangan OPT"
    >
      {/* Grafik 1: Tren Laju Serangan OPT Bulanan */}
      <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-lg">
                <TrendingUp className="h-5 w-5 text-brand-700" aria-hidden />
                <span>Tren Laju Serangan OPT Bulanan (Ha)</span>
              </h2>
              <p className="mt-0.5 text-xs text-ink-600">
                Pergerakan luas terdampak Januari–Desember {tahun} (WITA)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-700" aria-hidden />
                <span>Total Serangan</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger-600" aria-hidden />
                <span>Serangan Berat</span>
              </span>
            </div>
          </div>

          {!infoPuncak.adaData ? (
            <div className="mt-4">
              <KotakDataKosong
                judul="Belum Ada Tren Serangan Tahun Ini"
                pesan={`Tidak ditemukan laporan serangan terpublikasi sepanjang tahun ${tahun} untuk wilayah yang dipilih.`}
              />
            </div>
          ) : (
            <div className="mt-4 h-64 w-full" role="img" aria-label={`Grafik garis area tren serangan OPT bulanan tahun ${tahun}`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trenBulanan}
                  margin={{ top: 24, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--token-line)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="bulan"
                    tick={{ fill: 'var(--token-ink-600)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--token-line)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--token-ink-600)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatAngka(v, 0, 0)}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      formatTooltipHa(val),
                      name === 'luasBerat' ? 'Serangan Berat' : 'Total Serangan',
                    ]}
                    labelFormatter={(label) => `Bulan ${String(label)} ${tahun}`}
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: 'var(--token-line)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="luasTotal"
                    name="luasTotal"
                    stroke="var(--token-brand-700)"
                    strokeWidth={2.5}
                    fill="var(--token-brand-100)"
                    fillOpacity={0.65}
                    dot={TitikBulanAktif}
                    isAnimationActive={!kurangiGerak}
                  />
                  <Area
                    type="monotone"
                    dataKey="luasBerat"
                    name="luasBerat"
                    stroke="var(--token-danger-600)"
                    strokeWidth={2}
                    fill="var(--token-danger-100)"
                    fillOpacity={0.7}
                    isAnimationActive={!kurangiGerak}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabel alternatif bagi pembaca layar (DESIGN.md §5) */}
          <table className="sr-only">
            <caption>Data Tren Laju Serangan OPT Bulanan Tahun {tahun}</caption>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Total Serangan (Ha)</th>
                <th>Serangan Berat (Ha)</th>
              </tr>
            </thead>
            <tbody>
              {trenBulanan.map((b) => (
                <tr key={b.bulan}>
                  <td>{b.bulan}</td>
                  <td>{formatLuas(b.luasTotal)}</td>
                  <td>{formatLuas(b.luasBerat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5 text-xs">
          <p className="text-ink-600">
            {infoPuncak.adaData ? (
              <>
                Puncak serangan tercatat pada <strong>{infoPuncak.bulan} {tahun}</strong> seluas{' '}
                <strong className="tabular-nums text-ink-900">
                  {formatLuas(infoPuncak.luasTotal)}
                </strong>{' '}
                (berat: <span className="tabular-nums text-danger-600 font-semibold">{formatLuas(infoPuncak.luasBerat)}</span>).
              </>
            ) : (
              'Menunggu publikasi laporan lapangan untuk grafik tren.'
            )}
          </p>
          {infoPuncak.bulanAktif && (
            <span className="rounded-full bg-brand-900 px-2.5 py-0.5 text-[11px] font-semibold text-surface">
              Bulan Aktif: {infoPuncak.bulanAktif}
            </span>
          )}
        </div>
      </div>

      {/* Grafik 2: Intensitas per Komoditas */}
      <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-lg">
                <BarChart2 className="h-5 w-5 text-brand-700" aria-hidden />
                <span>Intensitas per Komoditas (Ha)</span>
              </h2>
              <p className="mt-0.5 text-xs text-ink-600">
                Perbandingan 7 komoditas perkebunan baku pada filter aktif
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-ok-500" aria-hidden />
                <span>Ringan/Sedang</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger-600" aria-hidden />
                <span>Berat</span>
              </span>
            </div>
          </div>

          {!palingRentan ? (
            <div className="mt-4">
              <KotakDataKosong
                judul="Belum Ada Serangan Komoditas"
                pesan="Seluruh 7 komoditas baku mencatat 0 Ha serangan pada filter periode dan wilayah saat ini."
              />
            </div>
          ) : (
            <div className="mt-4 h-64 w-full" role="img" aria-label="Grafik batang horizontal bertumpuk intensitas serangan per komoditas">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={intensitasKomoditas}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--token-line)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: 'var(--token-ink-600)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--token-line)' }}
                    tickLine={false}
                    tickFormatter={(v: number) => formatAngka(v, 0, 0)}
                  />
                  <YAxis
                    type="category"
                    dataKey="namaKomoditas"
                    width={96}
                    tick={{ fill: 'var(--token-ink-900)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      formatTooltipHa(val),
                      name === 'luasBerat' ? 'Berat (Ha)' : 'Ringan/Sedang (Ha)',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: 'var(--token-line)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="luasRinganSedang"
                    name="luasRinganSedang"
                    stackId="luas"
                    fill="var(--token-ok-500)"
                    radius={[0, 0, 0, 0]}
                    barSize={18}
                    isAnimationActive={!kurangiGerak}
                  />
                  <Bar
                    dataKey="luasBerat"
                    name="luasBerat"
                    stackId="luas"
                    fill="var(--token-danger-600)"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                    isAnimationActive={!kurangiGerak}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabel alternatif bagi pembaca layar */}
          <table className="sr-only">
            <caption>Data Intensitas Serangan per Komoditas</caption>
            <thead>
              <tr>
                <th>Komoditas</th>
                <th>Ringan/Sedang (Ha)</th>
                <th>Berat (Ha)</th>
                <th>Total (Ha)</th>
              </tr>
            </thead>
            <tbody>
              {intensitasKomoditas.map((k) => (
                <tr key={k.komoditasId}>
                  <td>{k.namaKomoditas}</td>
                  <td>{formatLuas(k.luasRinganSedang)}</td>
                  <td>{formatLuas(k.luasBerat)}</td>
                  <td>{formatLuas(k.luasTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5 text-xs">
          <p className="text-ink-600">
            {palingRentan ? (
              <>
                Komoditas paling rentan: <strong className="text-ink-900">{palingRentan.namaKomoditas}</strong>{' '}
                (<span className="tabular-nums font-semibold text-ink-900">{formatLuas(palingRentan.luasTotal)}</span> · OPT utama: {palingRentan.optUtama}).
              </>
            ) : (
              'Belum ada komoditas terdampak pada filter ini.'
            )}
          </p>
          <Link
            to="/komoditas-opt"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 font-semibold text-brand-900 hover:bg-brand-100"
          >
            <span>Detail OPT</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
