import type { DateRange } from '../../utils/date-period';
import { db } from './database';
import { productSchema, saleItemSchema, saleReturnSchema, saleSchema } from './records';
import type { Sale } from './records';
import { computeRevenueByCategory, countTransactionsByHour } from './sales-analytics-rows';
import type { CategoryRevenue } from './sales-analytics-rows';

// Dipakai penulis penjualan (untuk invalidasi) dan pembaca dasbor tanpa saling mengimpor fitur.
export const REVENUE_BY_CATEGORY_QUERY_KEY = ['revenue-by-category'] as const;
export const TRANSACTIONS_BY_HOUR_QUERY_KEY = ['transactions-by-hour'] as const;

async function getSalesInRange(range: DateRange): Promise<Sale[]> {
  const rows = await db.sales
    .where('createdAt')
    .between(range.start.toISOString(), range.end.toISOString(), true, false)
    .toArray();
  return saleSchema.array().parse(rows);
}

export async function getRevenueByCategory(range: DateRange): Promise<CategoryRevenue[]> {
  const sales = (await getSalesInRange(range)).filter((sale) => sale.status !== 'dibatalkan');
  if (sales.length === 0) return [];

  const saleIds = sales.map((sale) => sale.id);
  const items = saleItemSchema.array().parse(await db.saleItems.where('saleId').anyOf(saleIds).toArray());
  const returns = saleReturnSchema.array().parse(await db.saleReturns.where('saleId').anyOf(saleIds).toArray());
  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = (await db.products.bulkGet(productIds)).flatMap((row) => (row ? [productSchema.parse(row)] : []));

  return computeRevenueByCategory(
    sales,
    items,
    returns,
    new Map(products.map((product) => [product.id, product.category])),
  );
}

export async function getTransactionsByHour(range: DateRange): Promise<number[]> {
  return countTransactionsByHour(await getSalesInRange(range));
}
