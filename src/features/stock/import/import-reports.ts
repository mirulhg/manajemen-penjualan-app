import { formatCsv } from '../../../utils/format-csv';
import { IMPORT_COLUMNS } from './map-import-headers';
import type { FailedImportRow } from './validate-import-rows';

export function buildFailedRowsCsv(failed: FailedImportRow[]): string {
  return formatCsv([
    ['Baris', 'SKU', 'Alasan'],
    ...failed.map((row) => [String(row.rowNumber), row.sku, row.messages.join(' / ')]),
  ]);
}

export function buildTemplateCsv(): string {
  return formatCsv([
    IMPORT_COLUMNS.map((column) => column.title),
    ['ATK-001', 'Pulpen Hitam', 'Alat Tulis', 'pcs', '50', '10', '2.000', '3.000'],
    ['ATK-002', 'Buku Tulis 38 Lembar', 'Alat Tulis', 'pcs', '40', '', '3.500', '5.000'],
  ]);
}
