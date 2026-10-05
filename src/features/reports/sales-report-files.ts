import { formatCsv } from '../../utils/format-csv';
import { startOfDay, toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { DAILY_COLUMNS, TRANSACTION_COLUMNS } from './report-columns';
import type { DailyRow, ReportColumn, TransactionRow } from './report-columns';

type TableRow = Record<string, string | number>;

// Angka tetap angka (tanpa "Rp" dan pemisah ribuan) supaya bisa langsung dijumlah di Excel.
function toCell<Row extends TableRow>(row: Row, column: ReportColumn<Row>): string | number {
  return row[column.key] ?? '';
}

function toCsvTable<Row extends TableRow>(rows: Row[], columns: ReportColumn<Row>[]): string {
  return formatCsv([
    columns.map((column) => column.title),
    ...rows.map((row) => columns.map((column) => String(toCell(row, column)))),
  ]);
}

export type CsvFile = { fileName: string; content: string };

// Satu file per tabel: CSV tidak bisa memuat dua tabel dengan kolom berbeda secara bersih.
export function buildSalesReportCsvFiles(
  transactions: TransactionRow[],
  daily: DailyRow[],
  baseName: string,
): CsvFile[] {
  return [
    { fileName: `${baseName}-transaksi.csv`, content: toCsvTable(transactions, TRANSACTION_COLUMNS) },
    { fileName: `${baseName}-per-hari.csv`, content: toCsvTable(daily, DAILY_COLUMNS) },
  ];
}

export function buildSalesReportFileName(range: DateRange): string {
  const from = toLocalDateText(range.start);
  const to = toLocalDateText(range.end > range.start ? startOfDay(range.end, -1) : range.start);
  return `laporan-penjualan-${from}_${to}`;
}

function toSheetData<Row extends TableRow>(rows: Row[], columns: ReportColumn<Row>[]) {
  return [
    columns.map((column) => ({ value: column.title, fontWeight: 'bold' as const })),
    ...rows.map((row) => columns.map((column) => toCell(row, column))),
  ];
}

// Library .xlsx dimuat hanya saat tombol Unduh Excel diklik, supaya bundle halaman lain tidak membesar.
export async function buildSalesReportXlsx(transactions: TransactionRow[], daily: DailyRow[]): Promise<Blob> {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  return writeExcelFile([
    {
      sheet: 'Transaksi',
      data: toSheetData(transactions, TRANSACTION_COLUMNS),
      columns: TRANSACTION_COLUMNS.map((column) => ({ width: column.width })),
    },
    {
      sheet: 'Per hari',
      data: toSheetData(daily, DAILY_COLUMNS),
      columns: DAILY_COLUMNS.map((column) => ({ width: column.width })),
    },
  ]).toBlob();
}
