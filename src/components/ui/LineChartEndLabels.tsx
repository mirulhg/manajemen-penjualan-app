import { cn } from '@/lib/utils';
import { separateLabels, yPercent } from './chart-scale';
import type { ChartSeries } from './LineChartPlot';

type LineChartEndLabelsProps = {
  series: ChartSeries[];
  count: number;
  top: number;
};

const MIN_GAP_PERCENT = 12;

// Nama seri langsung di ujung kanan garis (pembaca tidak perlu mencocokkan legenda). Hanya dari sm ke atas: di HP ruangnya sempit,
// dan legenda teks tetap ada. aria-hidden karena legenda dan tabel sudah memuat nama yang sama.
export function LineChartEndLabels({ series, count, top }: LineChartEndLabelsProps) {
  const positions = separateLabels(
    series.map((entry) => yPercent(entry.points[count - 1]?.value ?? 0, top)),
    MIN_GAP_PERCENT,
  );

  return (
    <div aria-hidden="true" className="relative hidden h-52 w-24 shrink-0 sm:block">
      {series.map((entry, index) => (
        <span
          key={entry.name}
          style={{ top: `${positions[index] ?? 0}%` }}
          className={cn(
            'absolute left-1 -translate-y-1/2 text-xs font-medium whitespace-nowrap',
            index === 0 ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {entry.shortName ?? entry.name}
        </span>
      ))}
    </div>
  );
}
