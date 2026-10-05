import { useSalesReport } from '../api/use-sales-report';
import { getReportRange } from '../api/read-report-sales';
import type { PeriodSelection } from '../../../utils/date-period';
import { toLocalDateText, startOfDay } from '../../../utils/date-period';
import { formatDateTime, formatLocalDate } from '../../../utils/format-date-time';
import { SalesReportSkeleton } from './SalesReportSkeleton';
import { SalesReportSummary } from './SalesReportSummary';
import { SalesReportTables } from './SalesReportTables';

type SalesReportContentProps = {
  selection: PeriodSelection;
};

export function SalesReportContent({ selection }: SalesReportContentProps) {
  const { data, isPending, error, refetch } = useSalesReport(selection);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <SalesReportSkeleton />;
  if (error) {
    return (
      <div role="alert" className="space-y-3 print:hidden">
        <h2 className="text-lg font-semibold">Laporan tidak bisa dibuat</h2>
        <p className="text-text-muted">
          Aplikasi gagal membaca data penjualan dari penyimpanan di perangkat ini: {error.message}. Coba lagi; jika
          masih gagal, muat ulang halaman.
        </p>
        <button type="button" onClick={handleRetry} className="min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary">
          Coba lagi
        </button>
      </div>
    );
  }

  const now = new Date();
  const range = getReportRange(selection, now);
  const lastDay = range.end > range.start ? startOfDay(range.end, -1) : range.start;
  const isEmpty = data.summary.transactionCount === 0 && data.summary.cancelledCount === 0;

  return (
    <div className="space-y-6">
      <p>
        Periode: {formatLocalDate(toLocalDateText(range.start))} – {formatLocalDate(toLocalDateText(lastDay))}
      </p>
      {isEmpty && <p role="status">Tidak ada penjualan di periode ini.</p>}
      <SalesReportSummary summary={data.summary} />
      <SalesReportTables byPaymentMethod={data.byPaymentMethod} byDay={data.byDay} />
      <p className="hidden text-sm print:block">Dicetak pada {formatDateTime(now.toISOString())}</p>
    </div>
  );
}
