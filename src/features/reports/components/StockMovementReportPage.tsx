import { PeriodFilter } from '../../../components/ui/PeriodFilter';
import { useStockMovementReportExport } from '../api/use-stock-movement-report';
import { REPORT_PERIODS, useReportPeriod } from '../hooks/use-report-period';
import { ReportActions } from './ReportActions';
import { ReportShell } from './ReportShell';
import { StockMovementReportContent } from './StockMovementReportContent';

export function StockMovementReportPage() {
  const { selection, setSelection } = useReportPeriod();
  const exportReport = useStockMovementReportExport(selection);

  return (
    <ReportShell
      title="Laporan Pergerakan Stok"
      filters={<PeriodFilter selection={selection} periods={REPORT_PERIODS} onChange={setSelection} />}
      actions={
        <ReportActions
          onExport={exportReport.mutate}
          pendingFormat={exportReport.isPending ? exportReport.variables : null}
          error={exportReport.error}
        />
      }
    >
      <StockMovementReportContent selection={selection} />
    </ReportShell>
  );
}
