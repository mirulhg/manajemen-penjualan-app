import { lazy, Suspense, useState } from 'react';

import { serializePeriodParams } from '../../../utils/date-period';
import { PeriodSegmented } from '../../../components/ui/PeriodSegmented';
import { useDashboardData } from '../api/use-dashboard-data';
import { toHistorySelection } from '../dashboard-range';
import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import { ChartSkeleton } from './ChartSection';
import { DashboardEmpty } from './DashboardEmpty';
import { DashboardError } from './DashboardError';
import { DashboardShortcuts } from './DashboardShortcuts';
import { DashboardSkeleton } from './DashboardSkeleton';
import { KpiSection } from './KpiSection';

// Kode grafik dipisah ke chunk sendiri supaya kartu angka tidak menunggu SVG dan komponennya.
const ChartsSection = lazy(() => import('./ChartsSection').then((module) => ({ default: module.ChartsSection })));

export function DashboardContent() {
  const { selection, granularity, setSelection, setGranularity } = useDashboardPeriod();
  const { data, isPending, error, refetch } = useDashboardData(selection);
  // Efek hitung naik hanya untuk tampilan pertama setelah halaman dibuka; sesudah angka tampil, remount karena ganti periode tidak mengulangnya.
  const [hasShownKpi, setHasShownKpi] = useState(false);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={handleRetry} />;
  if (!data.hasSales) return <DashboardEmpty />;

  function handleKpiMounted(element: HTMLDivElement | null) {
    if (element) setHasShownKpi(true);
  }

  const historyQuery = serializePeriodParams(toHistorySelection(selection, new Date())).toString();

  return (
    <div className="space-y-6">
      <PeriodSegmented selection={selection} onChange={setSelection} />
      <div ref={handleKpiMounted}>
        <KpiSection selection={selection} metrics={data.period} previous={data.previous} animate={!hasShownKpi} />
      </div>
      <Suspense fallback={<ChartSkeleton />}>
        <ChartsSection selection={selection} granularity={granularity} onGranularityChange={setGranularity} />
      </Suspense>
      <DashboardShortcuts historyQuery={historyQuery} />
    </div>
  );
}
