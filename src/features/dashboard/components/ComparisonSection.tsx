import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import { describeChange } from '../change-text';
import { METRICS } from '../metric-definitions';

type ComparisonSectionProps = {
  today: SalesMetrics;
  yesterday: SalesMetrics;
};

export function ComparisonSection({ today, yesterday }: ComparisonSectionProps) {
  return (
    <section aria-labelledby="comparison-heading">
      <h2 id="comparison-heading" className="mb-3 text-lg font-semibold">
        Hari ini dibanding kemarin
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {METRICS.map((metric) => (
          <div key={metric.key} className="rounded-md border border-border bg-surface p-4">
            <dt className="text-sm text-text-muted">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{metric.format(today[metric.key])}</dd>
            <dd className="mt-1 text-sm text-text-muted">
              Kemarin {metric.format(yesterday[metric.key])} · {describeChange(today[metric.key], yesterday[metric.key])}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
