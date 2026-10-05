import { getDailySalesRange } from '../../../lib/db/daily-sales';
import { toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildSalesReport, buildTransactionRows } from '../sales-report';
import type { SalesReport } from '../sales-report';
import type { TransactionRow } from '../report-columns';
import { getReportRange, readReportSales } from './read-report-sales';

export async function getSalesReport(selection: PeriodSelection, now: Date): Promise<SalesReport> {
  const range = getReportRange(selection, now);
  const [sales, dailyRows] = await Promise.all([
    readReportSales(range),
    getDailySalesRange(toLocalDateText(range.start), toLocalDateText(range.end)),
  ]);
  return buildSalesReport(sales, dailyRows, range);
}

// Rincian per transaksi untuk ekspor; dibaca hanya saat tombol unduh diklik.
export async function getSalesReportRows(selection: PeriodSelection, now: Date): Promise<TransactionRow[]> {
  return buildTransactionRows(await readReportSales(getReportRange(selection, now)));
}
