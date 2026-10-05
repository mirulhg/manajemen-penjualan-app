import { Link } from 'react-router';

import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import { serializePeriodParams } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { describePeriodChange } from '../change-text';
import { DASHBOARD_PERIODS } from '../hooks/use-dashboard-period';
import { toHistorySelection } from '../dashboard-range';
import { METRICS } from '../metric-definitions';
import { PeriodFilter } from '../../../components/ui/PeriodFilter';

type PeriodSectionProps = {
  selection: PeriodSelection;
  metrics: SalesMetrics;
  previous: SalesMetrics;
  onChange: (patch: Partial<PeriodSelection>) => void;
};

export function PeriodSection({ selection, metrics, previous, onChange }: PeriodSectionProps) {
  const query = serializePeriodParams(toHistorySelection(selection, new Date())).toString();

  return (
    <section aria-labelledby="period-heading" className="space-y-4">
      <h2 id="period-heading" className="text-lg font-semibold">
        Ringkasan periode
      </h2>
      <PeriodFilter selection={selection} periods={DASHBOARD_PERIODS} onChange={onChange} />
      <dl aria-live="polite" className="grid gap-4 sm:grid-cols-2">
        {METRICS.map((metric) => (
          <div key={metric.key} className="rounded-md border border-border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{metric.format(metrics[metric.key])}</dd>
            <dd className="mt-1 text-sm text-muted-foreground">{describePeriodChange(metrics[metric.key], previous[metric.key])}</dd>
          </div>
        ))}
      </dl>
      <Link
        to={query ? `/penjualan?${query}` : '/penjualan'}
        className="inline-flex min-h-11 items-center font-medium text-primary"
      >
        Lihat transaksi
      </Link>
    </section>
  );
}
