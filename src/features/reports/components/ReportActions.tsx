import type { ExportFormat } from '../report-tables';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ReportActionsProps = {
  onExport: (format: ExportFormat) => void;
  // Format yang sedang disiapkan; null bila tidak ada ekspor berjalan.
  pendingFormat: ExportFormat | null;
  error: Error | null;
};

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
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg" type="button" onClick={handlePrint}>
          Cetak / Simpan PDF
        </Button>
        <Button type="button" variant="outline" onClick={handleExportCsv} disabled={pendingFormat !== null}>
          {pendingFormat === 'csv' ? 'Menyiapkan…' : 'Unduh CSV'}
        </Button>
        <Button type="button" variant="outline" onClick={handleExportXlsx} disabled={pendingFormat !== null}>
          {pendingFormat === 'xlsx' ? 'Menyiapkan…' : 'Unduh Excel'}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="p-3">
          File laporan gagal dibuat: {error.message}. Coba lagi; jika masih gagal, muat ulang halaman.
        </Alert>
      )}
    </div>
  );
}
