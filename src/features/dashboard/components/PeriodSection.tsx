import { Link } from 'react-router';

import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import { serializePeriodParams } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { METRICS } from '../metric-definitions';
import { PeriodFilter } from './PeriodFilter';

type PeriodSectionProps = {
  selection: PeriodSelection;
  metrics: SalesMetrics;
  onChange: (patch: Partial<PeriodSelection>) => void;
};

export function PeriodSection({ selection, metrics, onChange }: PeriodSectionProps) {
  const query = serializePeriodParams(selection).toString();

  return (
    <section aria-labelledby="period-heading" className="space-y-4">
      <h2 id="period-heading" className="text-lg font-semibold">
        Ringkasan periode
      </h2>
      <PeriodFilter selection={selection} onChange={onChange} />
      <dl aria-live="polite" className="grid gap-4 sm:grid-cols-2">
        {METRICS.map((metric) => (
          <div key={metric.key} className="rounded-md border border-border bg-surface p-4">
            <dt className="text-sm text-text-muted">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{metric.format(metrics[metric.key])}</dd>
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
