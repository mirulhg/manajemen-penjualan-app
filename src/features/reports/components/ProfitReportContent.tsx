import { formatRupiah } from '../../../utils/format-rupiah';
import type { PeriodSelection } from '../../../utils/date-period';
import { getReportRange } from '../api/read-report-sales';
import { useProfitReport } from '../api/use-profit-report';
import { ProfitReportTables } from './ProfitReportTables';
import { describeReportPeriod } from '../report-period-text';
import { ReportBody } from './ReportBody';
import { ReportError } from './ReportError';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportSummary } from './ReportSummary';

type ProfitReportContentProps = {
  selection: PeriodSelection;
};

const percentFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function ProfitReportContent({ selection }: ProfitReportContentProps) {
  const { data, isPending, error, refetch } = useProfitReport(selection);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <ReportSkeleton />;
  if (error) return <ReportError error={error} onRetry={handleRetry} />;

  const { summary } = data;

  return (
    <ReportBody intro={describeReportPeriod(getReportRange(selection, new Date()))}>
      {data.byProduct.length === 0 && <p role="status">Tidak ada penjualan di periode ini.</p>}
      <ReportSummary
        items={[
          { label: 'Omzet bersih', value: formatRupiah(summary.revenue) },
          { label: 'HPP', value: formatRupiah(summary.cogs) },
          { label: 'Laba kotor', value: formatRupiah(summary.grossProfit) },
          { label: 'Margin', value: `${percentFormat.format(summary.margin)}%` },
        ]}
        note="HPP memakai harga beli saat transaksi (harga beli terakhir)."
      />
      <ProfitReportTables byCategory={data.byCategory} byProduct={data.byProduct} />
    </ReportBody>
  );
}
