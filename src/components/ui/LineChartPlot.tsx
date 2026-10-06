import { pointPercent, yPercent } from './chart-scale';

export type ChartPoint = { label: string; shortLabel?: string; value: number };
// shortName: label langsung di ujung garis; name tetap dipakai di legenda dan tabel.
export type ChartSeries = { name: string; shortName?: string; points: ChartPoint[] };

// Seri pertama = periode ini (utuh, oranye chart-1); seri kedua = pembanding (putus-putus), jadi tidak bergantung pada warna saja.
export const SERIES_STYLES = [
  { line: 'stroke-chart-1', dot: 'bg-chart-1', dash: undefined },
  { line: 'stroke-muted-foreground', dot: 'bg-muted-foreground', dash: '6 4' },
] as const;

type LineChartPlotProps = {
  series: ChartSeries[];
  count: number;
  top: number;
  ticks: number[];
  active: number | null;
};

// Koordinat dalam persen (viewBox 0..100, peregangan bebas) supaya lebar mengikuti kontainer; ketebalan garis tidak ikut meregang.
export function LineChartPlot({ series, count, top, ticks, active }: LineChartPlotProps) {
  return (
    <>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {ticks.map((tick) => (
          <line
            key={tick}
            x1={0}
            x2={100}
            y1={yPercent(tick, top)}
            y2={yPercent(tick, top)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className="stroke-border"
          />
        ))}
        {series.map((entry, seriesIndex) => (
          <polyline
            key={entry.name}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeDasharray={SERIES_STYLES[seriesIndex]?.dash}
            vectorEffect="non-scaling-stroke"
            className={SERIES_STYLES[seriesIndex]?.line}
            points={entry.points
              .slice(0, count)
              .map((point, index) => `${pointPercent(index, count)},${yPercent(point.value, top)}`)
              .join(' ')}
          />
        ))}
        {active !== null && (
          <line
            x1={pointPercent(active, count)}
            x2={pointPercent(active, count)}
            y1={0}
            y2={100}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className="stroke-muted-foreground"
          />
        )}
      </svg>
      {series.map((entry, seriesIndex) => {
        const point = active !== null ? entry.points[active] : undefined;
        if (!point) return null;
        return (
          <span
            key={entry.name}
            aria-hidden="true"
            style={{ left: `${pointPercent(active ?? 0, count)}%`, top: `${yPercent(point.value, top)}%` }}
            className={`absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card ${SERIES_STYLES[seriesIndex]?.dot ?? ''}`}
          />
        );
      })}
    </>
  );
}
