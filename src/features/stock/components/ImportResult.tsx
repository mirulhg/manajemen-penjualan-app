import { Link } from 'react-router';

import { downloadTextFile } from '../../../utils/download-text-file';
import { formatNumber } from '../../../utils/format-number';
import { buildFailedRowsCsv } from '../import/import-reports';
import type { FailedImportRow } from '../import/validate-import-rows';
import { Alert } from '@/components/ui/alert';

type ImportResultProps = {
  imported: number;
  skippedCount: number;
  failed: FailedImportRow[];
  onImportAnother: () => void;
};

export function ImportResult({ imported, skippedCount, failed, onImportAnother }: ImportResultProps) {
  function handleDownloadFailed() {
    downloadTextFile('laporan-baris-gagal.csv', buildFailedRowsCsv(failed), 'text/csv;charset=utf-8');
  }

  return (
    <div className="space-y-4">
      <Alert variant="success" role="status" className="space-y-1 p-4">
        <p className="font-medium">{formatNumber(imported)} barang berhasil diimpor.</p>
        <p>Dilewati {formatNumber(skippedCount)}</p>
        <p>Gagal {formatNumber(failed.length)}</p>
      </Alert>
      <div className="flex flex-wrap gap-3">
        {failed.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadFailed}
            className="min-h-11 rounded-md border border-border bg-card px-4 font-medium"
          >
            Unduh laporan baris gagal
          </button>
        )}
        <Link to="/stok" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-primary-foreground">
          Lihat daftar stok
        </Link>
        <button
          type="button"
          onClick={onImportAnother}
          className="min-h-11 rounded-md border border-border bg-card px-4 font-medium"
        >
          Impor file lain
        </button>
      </div>
    </div>
  );
}
