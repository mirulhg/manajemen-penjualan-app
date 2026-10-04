import { pointPercent } from './chart-scale';
import type { ChartSeries } from './LineChartPlot';

type LineChartTooltipProps = {
  series: ChartSeries[];
  active: number;
  count: number;
  formatValue: (value: number) => string;
};

export function LineChartTooltip({ series, active, count, formatValue }: LineChartTooltipProps) {
  const x = pointPercent(active, count);
  const primary = series[0]?.points[active];
  if (!primary) return null;

  return (
    <div
      aria-hidden="true"
      style={{ left: `${x}%` }}
      className={`pointer-events-none absolute top-0 rounded-md border border-border bg-surface p-2 text-sm ${
        x > 55 ? '-ml-2 -translate-x-full' : 'ml-2'
      }`}
    >
      <p className="font-medium">{primary.label}</p>
      {series.map((entry) => {
        const point = entry.points[active];
        if (!point) return null;
        return (
          <p key={entry.name} className="whitespace-nowrap">
            {entry.name}
            {entry === series[0] ? '' : ` (${point.label})`}: {formatValue(point.value)}
          </p>
        );
      })}
    </div>
  );
}
