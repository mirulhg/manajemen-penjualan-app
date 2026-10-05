import { STOCK_COLUMNS } from './report-columns';
import type { StockReport } from './stock-report';
import { buildXlsxBlob, toCsvTable, toSheet } from './report-tables';

export function buildStockReportCsv(report: StockReport): string {
  return toCsvTable(report.rows, STOCK_COLUMNS);
}

export function buildStockReportXlsx(report: StockReport): Promise<Blob> {
  return buildXlsxBlob([toSheet('Stok', report.rows, STOCK_COLUMNS)]);
}
