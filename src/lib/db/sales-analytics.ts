import type { DateRange } from '../../utils/date-period';
import { getProductSalesInRange } from './daily-product-sales';
import { db } from './database';
import { productSchema, saleSchema } from './records';
import type { Sale } from './records';
import { countTransactionsByHour, groupRevenueByCategory } from './sales-analytics-rows';
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
  const totals = await getProductSalesInRange(range);
  if (totals.length === 0) return [];

  // Kategori produk SAAT INI (bukan saat transaksi); produk yang sudah tidak ada menjadi "Tanpa kategori".
  const products = (await db.products.bulkGet(totals.map((entry) => entry.productId))).flatMap((row) =>
    row ? [productSchema.parse(row)] : [],
  );
  return groupRevenueByCategory(totals, new Map(products.map((product) => [product.id, product.category])));
}

export async function getTransactionsByHour(range: DateRange): Promise<number[]> {
  return countTransactionsByHour(await getSalesInRange(range));
}
