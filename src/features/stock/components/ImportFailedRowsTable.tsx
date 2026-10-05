import type { FailedImportRow } from '../import/validate-import-rows';

type ImportFailedRowsTableProps = {
  failed: FailedImportRow[];
};

const MAX_SHOWN_ROWS = 50;

export function ImportFailedRowsTable({ failed }: ImportFailedRowsTableProps) {
  const shown = failed.slice(0, MAX_SHOWN_ROWS);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Baris yang gagal</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-2">Baris</th>
              <th scope="col" className="px-3 py-2">SKU</th>
              <th scope="col" className="px-3 py-2">Alasan</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.rowNumber} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{row.rowNumber}</td>
                <td className="px-3 py-2">{row.sku || '(kosong)'}</td>
                <td className="px-3 py-2">{row.messages.join(' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {failed.length > shown.length && (
        <p className="text-sm text-muted-foreground">
          Menampilkan {shown.length} dari {failed.length} baris gagal. Daftar lengkap ada di laporan yang bisa diunduh
          setelah impor.
        </p>
      )}
    </div>
  );
}
