import { formatCsv } from '../../utils/format-csv';
import type { ReportColumn } from './report-columns';

export type ExportFormat = 'csv' | 'xlsx';

type TableRow = Record<string, string | number>;

// Angka tetap angka (tanpa "Rp" dan pemisah ribuan) supaya bisa langsung dijumlah di Excel.
function toCell<Row extends TableRow>(row: Row, column: ReportColumn<Row>): string | number {
  return row[column.key] ?? '';
}

export function toCsvTable<Row extends TableRow>(rows: Row[], columns: ReportColumn<Row>[]): string {
  return formatCsv([
    columns.map((column) => column.title),
    ...rows.map((row) => columns.map((column) => String(toCell(row, column)))),
  ]);
}

function toSheetData<Row extends TableRow>(rows: Row[], columns: ReportColumn<Row>[]) {
  return [
    columns.map((column) => ({ value: column.title, fontWeight: 'bold' as const })),
    ...rows.map((row) => columns.map((column) => toCell(row, column))),
  ];
}

export function toSheet<Row extends TableRow>(sheet: string, rows: Row[], columns: ReportColumn<Row>[]) {
  return { sheet, data: toSheetData(rows, columns), columns: columns.map((column) => ({ width: column.width })) };
}

// Library .xlsx dimuat hanya saat tombol Unduh Excel diklik, supaya bundle halaman lain tidak membesar.
export async function buildXlsxBlob(sheets: ReturnType<typeof toSheet>[]): Promise<Blob> {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  return writeExcelFile(sheets).toBlob();
}
