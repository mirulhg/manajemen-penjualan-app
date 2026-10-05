import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { formatLocalDate } from '../../../utils/format-date-time';
import { useStockReportExport } from '../api/use-stock-report';
import { useReportDate } from '../hooks/use-report-date';
import { ReportActions } from './ReportActions';
import { ReportShell } from './ReportShell';
import { StockReportContent } from './StockReportContent';

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
            <input
              {...control}
              type="date"
              value={date}
              onChange={(event) => handleDateChange(event.target.value)}
              className={FIELD_CLASS}
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
