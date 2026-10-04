import { lazy, Suspense } from 'react';
import { Link } from 'react-router';

import { useDashboardData } from '../api/use-dashboard-data';
import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import { ChartSkeleton } from './ChartSection';
import { ComparisonSection } from './ComparisonSection';
import { DashboardEmpty } from './DashboardEmpty';
import { DashboardError } from './DashboardError';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PeriodSection } from './PeriodSection';

// Kode grafik dipisah ke chunk sendiri supaya kartu angka tidak menunggu SVG dan komponennya.
const ChartsSection = lazy(() => import('./ChartsSection').then((module) => ({ default: module.ChartsSection })));

export function DashboardContent() {
  const { selection, granularity, setSelection, setGranularity } = useDashboardPeriod();
  const { data, isPending, error, refetch } = useDashboardData(selection);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={handleRetry} />;
  if (!data.hasSales) return <DashboardEmpty />;

  return (
    <div className="space-y-8">
      <Link to="/dasbor/produk" className="inline-flex min-h-11 items-center font-medium text-primary">
        Analisis produk
      </Link>
      <ComparisonSection today={data.today} yesterday={data.yesterday} />
      <PeriodSection selection={selection} metrics={data.period} previous={data.previous} onChange={setSelection} />
      <Suspense fallback={<ChartSkeleton />}>
        <ChartsSection selection={selection} granularity={granularity} onGranularityChange={setGranularity} />
      </Suspense>
    </div>
  );
}
