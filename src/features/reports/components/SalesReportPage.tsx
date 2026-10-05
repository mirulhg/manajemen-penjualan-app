import { PeriodFilter } from '../../../components/ui/PeriodFilter';
import { useSalesReportExport } from '../api/use-sales-report-export';
import { REPORT_PERIODS, useReportPeriod } from '../hooks/use-report-period';
import { ReportActions } from './ReportActions';
import { ReportShell } from './ReportShell';
import { SalesReportContent } from './SalesReportContent';

export function SalesReportPage() {
  const { selection, setSelection } = useReportPeriod();
  const exportReport = useSalesReportExport(selection);

  return (
    <ReportShell
      title="Laporan Penjualan"
      filters={<PeriodFilter selection={selection} periods={REPORT_PERIODS} onChange={setSelection} />}
      actions={
        <ReportActions
          onExport={exportReport.mutate}
          pendingFormat={exportReport.isPending ? exportReport.variables : null}
          error={exportReport.error}
        />
      }
    >
      <SalesReportContent selection={selection} />
    </ReportShell>
  );
}
