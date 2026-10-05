import { PROFIT_CATEGORY_COLUMNS, PROFIT_PRODUCT_COLUMNS } from './report-columns';
import type { ProfitReport } from './profit-report';
import { buildXlsxBlob, toCsvTable, toSheet } from './report-tables';

// CSV hanya memuat rincian per produk; ringkasan per kategori ada di sheet Excel dan cetakan.
export function buildProfitReportCsv(report: ProfitReport): string {
  return toCsvTable(report.byProduct, PROFIT_PRODUCT_COLUMNS);
}

export function buildProfitReportXlsx(report: ProfitReport): Promise<Blob> {
  return buildXlsxBlob([
    toSheet('Per produk', report.byProduct, PROFIT_PRODUCT_COLUMNS),
    toSheet('Per kategori', report.byCategory, PROFIT_CATEGORY_COLUMNS),
  ]);
}
