import { Link } from 'react-router';

import { useAnalysisReadiness } from '../api/use-product-analysis';
import { getDashboardRanges } from '../dashboard-range';
import { useAnalysisParams } from '../hooks/use-analysis-params';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PeriodFilter } from '../../../components/ui/PeriodFilter';
import { DASHBOARD_PERIODS } from '../hooks/use-dashboard-period';
import { RevenueProfitSection } from './RevenueProfitSection';
import { SlowMoversSection } from './SlowMoversSection';
import { StockForecastSection } from './StockForecastSection';
import { TopSellingSection } from './TopSellingSection';
import { DashboardError } from './DashboardError';
import { Button } from '@/components/ui/button';

export function ProductAnalysisContent() {
  const params = useAnalysisParams();
  const { data, isPending, error, refetch } = useAnalysisReadiness();

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={handleRetry} />;
  if (!data.ready) {
    return (
      <div role="status" className="space-y-2">
        <h2 className="text-lg font-semibold">Data belum cukup</h2>
        <p className="text-muted-foreground">
          Analisis butuh penjualan minimal 7 hari; saat ini baru {data.daysOfData} hari. Catat penjualan di Kasir,
          lalu buka halaman ini lagi.
        </p>
        <Button asChild variant="outline"><Link to="/kasir">
          Buka Kasir
        </Link></Button>
      </div>
    );
  }

  const { current } = getDashboardRanges(params.selection, new Date());

  return (
    <div className="space-y-8">
      <section aria-labelledby="analysis-period-heading" className="space-y-3">
        <h2 id="analysis-period-heading" className="text-lg font-semibold">
          Periode penjualan
        </h2>
        <PeriodFilter selection={params.selection} periods={DASHBOARD_PERIODS} onChange={params.setSelection} />
      </section>
      <TopSellingSection range={current} />
      <RevenueProfitSection range={current} ranking={params.ranking} onRankingChange={params.setRanking} />
      <SlowMoversSection threshold={params.threshold} onThresholdChange={params.setThreshold} />
      <StockForecastSection />
    </div>
  );
}
