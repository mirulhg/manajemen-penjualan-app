import { lazy, Suspense, useState } from 'react';
import type { ReactNode } from 'react';

import { serializePeriodParams } from '../../../utils/date-period';
import { PeriodSegmented } from '../../../components/ui/PeriodSegmented';
import { useMediaQuery } from '../../../hooks/use-media-query';
import { useDashboardData } from '../api/use-dashboard-data';
import { toHistorySelection } from '../dashboard-range';
import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import { ChartSkeleton } from './ChartSection';
import { DashboardEmpty } from './DashboardEmpty';
import { DASHBOARD_HEADER_QUERY } from './DashboardHeader';
import { DashboardError } from './DashboardError';
import { DashboardShortcuts } from './DashboardShortcuts';
import { DashboardSkeleton } from './DashboardSkeleton';
import { KpiSection } from './KpiSection';

// Kode grafik dipisah ke chunk sendiri supaya kartu angka tidak menunggu SVG dan komponennya.
const ChartsSection = lazy(() => import('./ChartsSection').then((module) => ({ default: module.ChartsSection })));

// Isi dasbor adalah sel grid milik DashboardPage; keadaan selain isi mengisi satu baris penuh.
type FullRowProps = {
  children: ReactNode;
};

function FullRow({ children }: FullRowProps) {
  return <div className="md:col-span-full">{children}</div>;
}

// Dengan kartu restock (2×2 di kiri), KPI mengisi 2 kolom × 2 baris di kanannya; tanpa kartu itu KPI satu baris penuh.
const KPI_CELL_CLASS =
  'md:col-span-full lg:col-span-4 lg:group-has-[[data-slot=daily-summary]]/bento:col-span-2 lg:group-has-[[data-slot=daily-summary]]/bento:row-span-2';

export function DashboardContent() {
  const { selection, granularity, setSelection, setGranularity } = useDashboardPeriod();
  const isLarge = useMediaQuery(DASHBOARD_HEADER_QUERY);
  const { data, isPending, error, refetch } = useDashboardData(selection);
  // Efek hitung naik hanya untuk tampilan pertama setelah halaman dibuka; sesudah angka tampil, remount karena ganti periode tidak mengulangnya.
  const [hasShownKpi, setHasShownKpi] = useState(false);

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return (
      <FullRow>
        <DashboardSkeleton />
      </FullRow>
    );
  }
  if (error) {
    return (
      <FullRow>
        <DashboardError error={error} onRetry={handleRetry} />
      </FullRow>
    );
  }
  if (!data.hasSales) {
    return (
      <FullRow>
        <DashboardEmpty />
      </FullRow>
    );
  }

  function handleKpiMounted(element: HTMLDivElement | null) {
    if (element) setHasShownKpi(true);
  }

  const historyQuery = serializePeriodParams(toHistorySelection(selection, new Date())).toString();

  return (
    <>
      {!isLarge && (
        <div className="md:col-span-full">
          <PeriodSegmented selection={selection} onChange={setSelection} />
        </div>
      )}
      <div ref={handleKpiMounted} className={KPI_CELL_CLASS}>
        <KpiSection selection={selection} metrics={data.period} previous={data.previous} animate={!hasShownKpi} />
      </div>
      <Suspense
        fallback={
          <div className="md:col-span-full">
            <ChartSkeleton />
          </div>
        }
      >
        <ChartsSection selection={selection} granularity={granularity} onGranularityChange={setGranularity} />
      </Suspense>
      <div className="md:col-span-full lg:col-span-2">
        <DashboardShortcuts historyQuery={historyQuery} transactionCount={data.period.transactionCount} />
      </div>
    </>
  );
}
