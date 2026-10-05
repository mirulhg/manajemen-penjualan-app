import { DAILY_COLUMNS, TRANSACTION_COLUMNS } from './report-columns';
import type { DailyRow, TransactionRow } from './report-columns';
import { buildXlsxBlob, toCsvTable, toSheet } from './report-tables';

// CSV hanya memuat rincian per transaksi; ringkasan per hari ada di sheet Excel dan cetakan.
export function buildSalesReportCsv(transactions: TransactionRow[]): string {
  return toCsvTable(transactions, TRANSACTION_COLUMNS);
}

export function buildSalesReportXlsx(transactions: TransactionRow[], daily: DailyRow[]): Promise<Blob> {
  return buildXlsxBlob([
    toSheet('Transaksi', transactions, TRANSACTION_COLUMNS),
    toSheet('Per hari', daily, DAILY_COLUMNS),
  ]);
}
