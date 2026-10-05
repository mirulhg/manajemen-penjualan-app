import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { PeriodSelection } from '../../../utils/date-period';
import { useSalesReport } from '../api/use-sales-report';
import { getReportRange } from '../api/read-report-sales';
import { describeReportPeriod } from '../report-period-text';
import { ReportBody } from './ReportBody';
import { ReportError } from './ReportError';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportSummary } from './ReportSummary';
import { SalesReportTables } from './SalesReportTables';

type SalesReportContentProps = {
  selection: PeriodSelection;
};

export function SalesReportContent({ selection }: SalesReportContentProps) {
  const { data, isPending, error, refetch } = useSalesReport(selection);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <ReportSkeleton />;
  if (error) return <ReportError error={error} onRetry={handleRetry} />;

  const { summary } = data;
  const isEmpty = summary.transactionCount === 0 && summary.cancelledCount === 0;

  return (
    <ReportBody intro={describeReportPeriod(getReportRange(selection, new Date()))}>
      {isEmpty && <p role="status">Tidak ada penjualan di periode ini.</p>}
      <ReportSummary
        items={[
          { label: 'Transaksi', value: formatNumber(summary.transactionCount) },
          { label: 'Penjualan kotor', value: formatRupiah(summary.grossSales) },
          { label: 'Diskon', value: formatRupiah(summary.discounts) },
          { label: 'Retur', value: formatRupiah(summary.refunds) },
          { label: 'Omzet bersih', value: formatRupiah(summary.netRevenue) },
          { label: 'Transaksi dibatalkan', value: formatNumber(summary.cancelledCount) },
        ]}
        note="Transaksi dibatalkan dicatat terpisah dan tidak masuk omzet."
      />
      <SalesReportTables byPaymentMethod={data.byPaymentMethod} byDay={data.byDay} />
    </ReportBody>
  );
}
