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
    <ul aria-hidden="true" className="space-y-3">
      {data.map((datum, index) => {
        const isActive = active === index;
        const showValue = isActive || (active === null && datum.value === maxValue);
        return (
          <li key={datum.label} onPointerEnter={() => onActivate(index)} className={active !== null && !isActive ? 'opacity-60' : ''}>
            <div className="flex justify-between gap-2 text-sm">
              <span className={isActive ? 'font-semibold' : ''}>{datum.label}</span>
              <span className="font-medium">{showValue ? formatValue(datum.value) : ''}</span>
            </div>
            <div className="mt-1 h-4 border-l border-border">
              <div
                style={{ width: `${maxValue > 0 ? (datum.value / maxValue) * 100 : 0}%` }}
                className="h-full rounded-r bg-primary"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
