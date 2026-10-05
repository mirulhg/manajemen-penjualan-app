import { MOVEMENT_COLUMNS } from './report-columns';
import type { StockMovementReport } from './stock-movement-report';
import { buildXlsxBlob, toCsvTable, toSheet } from './report-tables';

// Ekspor selalu memuat semua barang, termasuk yang tidak bergerak; hanya tampilan layar dan cetakan yang menyaring.
export function buildStockMovementReportCsv(report: StockMovementReport): string {
  return toCsvTable(report.rows, MOVEMENT_COLUMNS);
}

export function buildStockMovementReportXlsx(report: StockMovementReport): Promise<Blob> {
  return buildXlsxBlob([toSheet('Pergerakan stok', report.rows, MOVEMENT_COLUMNS)]);
}
