import { getProductSalesInRange } from '../../../lib/db/daily-product-sales';
import { db } from '../../../lib/db/database';
import { productSchema } from '../../../lib/db/records';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildProfitReport } from '../profit-report';
import type { ProfitReport } from '../profit-report';
import { getReportRange } from './read-report-sales';

export async function getProfitReport(selection: PeriodSelection, now: Date): Promise<ProfitReport> {
  const totals = await getProductSalesInRange(getReportRange(selection, now));
  const rows = await db.products.bulkGet(totals.map((entry) => entry.productId));
  const products = new Map(rows.flatMap((row) => (row ? [[row.id, productSchema.parse(row)] as const] : [])));
  return buildProfitReport(totals, products);
}
