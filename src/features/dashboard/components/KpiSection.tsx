import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import type { PeriodSelection } from '../../../utils/date-period';
import { METRICS } from '../metric-definitions';
import { KpiCard } from './KpiCard';

type KpiSectionProps = {
  selection: PeriodSelection;
  metrics: SalesMetrics;
  previous: SalesMetrics;
  animate: boolean;
};

export function KpiSection({ selection, metrics, previous, animate }: KpiSectionProps) {
  const hasNoSalesToday = selection.period === 'hari-ini' && metrics.revenue === 0;

  return (
    <section aria-labelledby="period-heading" className="h-full">
      <h2 id="period-heading" className="sr-only">
        Ringkasan periode
      </h2>
      <dl aria-live="polite" className="grid h-full grid-cols-2 gap-3 lg:group-has-[[data-slot=daily-summary]]/bento:gap-4 lg:grid-cols-4 lg:group-has-[[data-slot=daily-summary]]/bento:grid-cols-2">
        {METRICS.map((metric) => (
          <KpiCard
            key={metric.key}
            metric={metric}
            current={metrics[metric.key]}
            previous={previous[metric.key]}
            hasNoSalesToday={hasNoSalesToday}
            animate={animate}
          />
        ))}
      </dl>
    </section>
  );
}
