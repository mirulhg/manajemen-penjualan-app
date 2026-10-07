import { AnimatePresence, m } from 'motion/react';
import { Link } from 'react-router';

import { listItemMotion } from '@/lib/motion';
import type { BarDatum } from './BarChart';

type HorizontalBarsProps = {
  data: BarDatum[];
  maxValue: number;
  active: number | null;
  onActivate: (index: number) => void;
  formatValue: (value: number) => string;
};

// Batang menempel ke garis dasar di kiri; panjangnya lewat scaleX (bukan width), jadi ujungnya tidak dibulatkan. Nilai tampil untuk batang terbesar dan yang disorot.
export function HorizontalBars({ data, maxValue, active, onActivate, formatValue }: HorizontalBarsProps) {
  return (
    // Tanpa tautan, daftar disembunyikan dari pembaca layar (tabel alternatif sudah ada); elemen fokus tidak boleh berada di dalam aria-hidden.
    <ul aria-hidden={data.some((datum) => datum.href) ? undefined : true} className="relative space-y-3">
      <AnimatePresence initial={false} mode="popLayout">
        {data.map((datum, index) => {
          const isActive = active === index;
          const showValue = isActive || (active === null && datum.value === maxValue);
          return (
            <m.li
              key={datum.label}
              {...listItemMotion(data.length)}
              // Hanya mouse: sentuhan juga memicu pointerenter, sehingga redup "menempel" setelah jari diangkat.
              onPointerEnter={(event) => event.pointerType === 'mouse' && onActivate(index)}
              // Redup lewat anak langsung: opacity li dipegang Motion (animate), jadi class di li akan tertimpa.
              className={active !== null && !isActive ? '*:opacity-60' : ''}
            >
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
                  style={{ transform: `scaleX(${maxValue > 0 ? datum.value / maxValue : 0})` }}
                  className="h-full origin-left bg-chart-1 transition-transform duration-(--duration-slow) ease-out"
                />
              </div>
            </m.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
