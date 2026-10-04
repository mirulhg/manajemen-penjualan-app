import { useId } from 'react';

import { getYAxis, pointPercent, visibleLabelIndexes } from './chart-scale';
import { ChartTable } from './ChartTable';
import { LineChartPlot, SERIES_STYLES } from './LineChartPlot';
import type { ChartSeries } from './LineChartPlot';
import { LineChartTooltip } from './LineChartTooltip';
import { useChartCursor } from './use-chart-cursor';

type LineChartProps = {
  title: string;
  // Seri pertama = utama; seri kedua (opsional) = pembanding, disejajarkan per urutan titik.
  series: ChartSeries[];
  formatValue: (value: number) => string;
  formatAxis: (value: number) => string;
  labelHeader: string;
};

const MOBILE_MAX_LABELS = 4;
const DESKTOP_MAX_LABELS = 8;

function alignmentClass(percent: number): string {
  if (percent < 10) return '';
  return percent > 90 ? '-translate-x-full' : '-translate-x-1/2';
}

export function LineChart({ title, series, formatValue, formatAxis, labelHeader }: LineChartProps) {
  const visibleSeries = series.slice(0, SERIES_STYLES.length);
  const primary = visibleSeries[0];
  const count = primary?.points.length ?? 0;
  const cursor = useChartCursor(count, 'point');
  const hintId = useId();

  if (!primary || count === 0) return null;

  const maxValue = Math.max(0, ...visibleSeries.flatMap((entry) => entry.points.slice(0, count).map((point) => point.value)));
  const { ticks, top } = getYAxis(maxValue);
  const activePoint = cursor.active !== null ? primary.points[cursor.active] : undefined;
  const announcement = activePoint
    ? `${activePoint.label}: ${visibleSeries.map((entry) => `${entry.name} ${formatValue(entry.points[cursor.active ?? 0]?.value ?? 0)}`).join(', ')}`
    : '';

  function renderLabels(maxLabels: number, className: string) {
    return (
      <div aria-hidden="true" className={`relative h-6 text-xs text-text-muted ${className}`}>
        {visibleLabelIndexes(count, maxLabels).map((index) => {
          const percent = pointPercent(index, count);
          return (
            <span
              key={index}
              style={{ left: `${percent}%` }}
              className={`absolute top-1 whitespace-nowrap ${alignmentClass(percent)}`}
            >
              {primary?.points[index]?.shortLabel ?? primary?.points[index]?.label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <figure>
      <figcaption className="font-semibold">{title}</figcaption>
      {visibleSeries.length > 1 && (
        <ul className="mt-1 flex flex-wrap gap-x-4 text-sm">
          {visibleSeries.map((entry, index) => (
            <li key={entry.name} className="flex items-center gap-2">
              <svg width="24" height="8" aria-hidden="true">
                <line x1={0} x2={24} y1={4} y2={4} strokeWidth={2} strokeDasharray={SERIES_STYLES[index]?.dash} className={SERIES_STYLES[index]?.line} />
              </svg>
              {entry.name}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <div aria-hidden="true" className="relative h-52 w-16 shrink-0 text-xs text-text-muted">
          {ticks.map((tick) => (
            <span key={tick} style={{ top: `${100 - (tick / top) * 100}%` }} className="absolute right-0 -translate-y-1/2">
              {formatAxis(tick)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div
            role="group"
            aria-label={title}
            aria-describedby={hintId}
            {...cursor.containerProps}
            {...cursor.pointerProps}
            className="relative h-52 touch-pan-y"
          >
            <LineChartPlot series={visibleSeries} count={count} top={top} ticks={ticks} active={cursor.active} />
            {cursor.active !== null && (
              <LineChartTooltip series={visibleSeries} active={cursor.active} count={count} formatValue={formatValue} />
            )}
          </div>
          {renderLabels(MOBILE_MAX_LABELS, 'md:hidden')}
          {renderLabels(DESKTOP_MAX_LABELS, 'hidden md:block')}
        </div>
      </div>
      <p id={hintId} className="sr-only">
        Gunakan panah kiri dan kanan untuk berpindah titik.
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <ChartTable
        caption={title}
        headers={[labelHeader, ...visibleSeries.map((entry) => entry.name)]}
        rows={primary.points.map((point, index) => [
          point.label,
          ...visibleSeries.map((entry) => formatValue(entry.points[index]?.value ?? 0)),
        ])}
      />
    </figure>
  );
}
