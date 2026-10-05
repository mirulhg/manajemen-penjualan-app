import { FormField } from '../../../components/ui/FormField';
import { formatLocalDate } from '../../../utils/format-date-time';
import { useStockReportExport } from '../api/use-stock-report';
import { useReportDate } from '../hooks/use-report-date';
import { ReportActions } from './ReportActions';
import { ReportShell } from './ReportShell';
import { StockReportContent } from './StockReportContent';
import { Input } from '@/components/ui/input';

export function StockReportPage() {
  const { date, setDate } = useReportDate();
  const exportReport = useStockReportExport(date);

  function handleDateChange(value: string) {
    setDate(value);
  }

  return (
    <ReportShell
      title={`Laporan Stok per ${formatLocalDate(date)}`}
      filters={
        <FormField id="report-date" label="Tanggal posisi stok" error={undefined}>
          {(control) => (
            <Input
              {...control}
              type="date"
              value={date}
              onChange={(event) => handleDateChange(event.target.value)}
              className="mt-1"
            />
          )}
        </FormField>
      }
      actions={
        <ReportActions
          onExport={exportReport.mutate}
          pendingFormat={exportReport.isPending ? exportReport.variables : null}
          error={exportReport.error}
        />
      }
    >
      <StockReportContent date={date} />
    </ReportShell>
  );
}
