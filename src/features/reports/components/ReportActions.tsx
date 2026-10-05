import { useSalesReportExport } from '../api/use-sales-report-export';
import type { PeriodSelection } from '../../../utils/date-period';

type ReportActionsProps = {
  selection: PeriodSelection;
};

const BUTTON_CLASS = 'min-h-11 rounded-md border border-border bg-surface px-4 font-medium disabled:opacity-60';

export function ReportActions({ selection }: ReportActionsProps) {
  const exportReport = useSalesReportExport(selection);

  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    exportReport.mutate('csv');
  }

  function handleExportXlsx() {
    exportReport.mutate('xlsx');
  }

  return (
    <div className="space-y-2 print:hidden">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handlePrint} className="min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary">
          Cetak / Simpan PDF
        </button>
        <button type="button" onClick={handleExportCsv} disabled={exportReport.isPending} className={BUTTON_CLASS}>
          {exportReport.isPending && exportReport.variables === 'csv' ? 'Menyiapkan…' : 'Unduh CSV'}
        </button>
        <button type="button" onClick={handleExportXlsx} disabled={exportReport.isPending} className={BUTTON_CLASS}>
          {exportReport.isPending && exportReport.variables === 'xlsx' ? 'Menyiapkan…' : 'Unduh Excel'}
        </button>
      </div>
      {exportReport.isError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          File laporan gagal dibuat: {exportReport.error.message}. Coba lagi; jika masih gagal, muat ulang halaman.
        </p>
      )}
    </div>
  );
}
