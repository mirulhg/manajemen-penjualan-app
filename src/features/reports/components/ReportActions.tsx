import type { ExportFormat } from '../report-tables';
import { Alert } from '@/components/ui/alert';

type ReportActionsProps = {
  onExport: (format: ExportFormat) => void;
  // Format yang sedang disiapkan; null bila tidak ada ekspor berjalan.
  pendingFormat: ExportFormat | null;
  error: Error | null;
};

const BUTTON_CLASS = 'min-h-11 rounded-md border border-border bg-card px-4 font-medium disabled:opacity-60';

export function ReportActions({ onExport, pendingFormat, error }: ReportActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    onExport('csv');
  }

  function handleExportXlsx() {
    onExport('xlsx');
  }

  return (
    <div className="space-y-2 print:hidden">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handlePrint} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
          Cetak / Simpan PDF
        </button>
        <button type="button" onClick={handleExportCsv} disabled={pendingFormat !== null} className={BUTTON_CLASS}>
          {pendingFormat === 'csv' ? 'Menyiapkan…' : 'Unduh CSV'}
        </button>
        <button type="button" onClick={handleExportXlsx} disabled={pendingFormat !== null} className={BUTTON_CLASS}>
          {pendingFormat === 'xlsx' ? 'Menyiapkan…' : 'Unduh Excel'}
        </button>
      </div>
      {error && (
        <Alert variant="destructive" className="p-3">
          File laporan gagal dibuat: {error.message}. Coba lagi; jika masih gagal, muat ulang halaman.
        </Alert>
      )}
    </div>
  );
}
