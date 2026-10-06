import { Link } from 'react-router';

import type { BarDatum } from './BarChart';

type HorizontalBarsProps = {
  data: BarDatum[];
  maxValue: number;
  active: number | null;
  onActivate: (index: number) => void;
  formatValue: (value: number) => string;
};

// Batang menempel ke garis dasar di kiri; hanya ujung kanan yang membulat. Nilai tampil untuk batang terbesar dan yang disorot.
export function HorizontalBars({ data, maxValue, active, onActivate, formatValue }: HorizontalBarsProps) {
  return (
    // Tanpa tautan, daftar disembunyikan dari pembaca layar (tabel alternatif sudah ada); elemen fokus tidak boleh berada di dalam aria-hidden.
    <ul aria-hidden={data.some((datum) => datum.href) ? undefined : true} className="space-y-3">
      {data.map((datum, index) => {
        const isActive = active === index;
        const showValue = isActive || (active === null && datum.value === maxValue);
        return (
          <li key={datum.label} onPointerEnter={() => onActivate(index)} className={active !== null && !isActive ? 'opacity-60' : ''}>
            <div className="flex justify-between gap-2 text-sm">
              <span className={isActive ? 'font-semibold' : ''}>
                {datum.href ? (
                  <Link to={datum.href} className="inline-flex min-h-11 items-center text-primary underline">
                    {datum.label}
                  </Link>
                ) : (
                  datum.label
                )}
              </span>
              <span className="font-medium">{showValue ? formatValue(datum.value) : ''}</span>
            </div>
            <div className="mt-1 h-4 border-l border-border">
              <div
                style={{ width: `${maxValue > 0 ? (datum.value / maxValue) * 100 : 0}%` }}
                className="h-full rounded-r bg-chart-1"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
