import { useDashboardData } from '../api/use-dashboard-data';
import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import { ComparisonSection } from './ComparisonSection';
import { DashboardEmpty } from './DashboardEmpty';
import { DashboardError } from './DashboardError';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PeriodSection } from './PeriodSection';

export function DashboardContent() {
  const { selection, setSelection } = useDashboardPeriod();
  const { data, isPending, error, refetch } = useDashboardData(selection);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={handleRetry} />;
  if (!data.hasSales) return <DashboardEmpty />;

  return (
    <div className="space-y-8">
      <ComparisonSection today={data.today} yesterday={data.yesterday} />
      <PeriodSection selection={selection} metrics={data.period} onChange={setSelection} />
    </div>
  );
}
