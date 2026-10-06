import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { describePeriodTrend } from '../change-text';
import type { MetricDefinition } from '../metric-definitions';

type KpiCardProps = {
  metric: MetricDefinition;
  current: number;
  previous: number;
  // Hari ini sebelum ada penjualan: "turun 100%" menyesatkan di pagi hari, jadi diganti keterangan.
  hasNoSalesToday: boolean;
};

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;

export function KpiCard({ metric, current, previous, hasNoSalesToday }: KpiCardProps) {
  const trend = describePeriodTrend(current, previous);
  const TrendIcon = TREND_ICONS[trend.direction];

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{metric.label}</dt>
      <dd className="mt-1 text-lg font-semibold wrap-anywhere sm:text-2xl">{metric.format(current)}</dd>
      <dd className="mt-1 text-sm text-muted-foreground">
        {hasNoSalesToday ? (
          'Belum ada penjualan hari ini'
        ) : (
          <>
            <TrendIcon aria-hidden="true" className="mr-1 inline size-4 align-text-bottom" />
            {trend.text} · sebelumnya {metric.format(previous)}
          </>
        )}
      </dd>
    </div>
  );
}
