import { Download, Printer } from 'lucide-react';

import type { ExportFormat } from '../report-tables';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
          <Printer aria-hidden="true" />
          Cetak / Simpan PDF
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" disabled={pendingFormat !== null}>
              <Download aria-hidden="true" />
              {pendingFormat !== null ? 'Menyiapkan…' : 'Unduh'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={handleExportCsv}>CSV</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportXlsx}>Excel (.xlsx)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {error && (
        <Alert variant="destructive" className="p-3">
          File laporan gagal dibuat: {error.message}. Coba lagi; jika masih gagal, muat ulang halaman.
        </Alert>
      )}
    </div>
  );
}
