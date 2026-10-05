import { PeriodFilter } from '../../../components/ui/PeriodFilter';
import { useProfitReportExport } from '../api/use-profit-report';
import { REPORT_PERIODS, useReportPeriod } from '../hooks/use-report-period';
import { ProfitReportContent } from './ProfitReportContent';
import { ReportActions } from './ReportActions';
import { ReportShell } from './ReportShell';

export function ProfitReportPage() {
  const { selection, setSelection } = useReportPeriod();
  const exportReport = useProfitReportExport(selection);

  return (
    <ReportShell
      title="Laporan Laba Kotor"
      filters={<PeriodFilter selection={selection} periods={REPORT_PERIODS} onChange={setSelection} />}
      actions={
        <ReportActions
          onExport={exportReport.mutate}
          pendingFormat={exportReport.isPending ? exportReport.variables : null}
          error={exportReport.error}
        />
      }
    >
      <ProfitReportContent selection={selection} />
    </ReportShell>
  );
}
