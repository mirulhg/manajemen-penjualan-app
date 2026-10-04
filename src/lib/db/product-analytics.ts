import Dexie from 'dexie';

import { startOfDay } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { getProductSalesInRange, getProductSalesRows, sumByProduct } from './daily-product-sales';
import { db } from './database';
import { getDefaultMinStock } from './settings';
import { productSchema } from './records';
import type { Product } from './records';
import {
  computeReadiness,
  computeStockForecast,
  FORECAST_DAYS,
  joinProductTotals,
  selectSlowMovers,
} from './product-analytics-rows';
import type { ProductSalesRow, SlowMover, StockForecastRow } from './product-analytics-rows';

// Dipakai penulis stok/penjualan (untuk invalidasi) dan pembaca analisis tanpa saling mengimpor fitur.
export const PRODUCT_ANALYTICS_QUERY_KEY = ['product-analytics'] as const;

async function getActiveProducts(): Promise<Product[]> {
  const rows = await db.products.filter((product) => product.archivedAt === null).toArray();
  return productSchema.array().parse(rows);
}

// Termasuk produk yang kini diarsipkan: penjualannya nyata dan tetap dihitung di peringkat.
export async function getProductSalesWithProducts(range: DateRange): Promise<ProductSalesRow[]> {
  const totals = await getProductSalesInRange(range);
  const rows = await db.products.bulkGet(totals.map((entry) => entry.productId));
  const products = new Map(rows.flatMap((row) => (row ? [[row.id, productSchema.parse(row)] as const] : [])));
  return joinProductTotals(totals, products);
}

export async function getSlowMovers(thresholdDays: number, now: Date): Promise<SlowMover[]> {
  const window = { start: startOfDay(now, -(thresholdDays - 1)), end: startOfDay(now, 1) };
  const sold = new Set((await getProductSalesInRange(window)).map((entry) => entry.productId));
  const stale = (await getActiveProducts()).filter((product) => !sold.has(product.id));

  // Baris bernilai nol dihapus dari rekap, jadi baris terbaru produk itu = terakhir terjual.
  const lastSold = new Map<string, string>();
  await Promise.all(
    stale.map(async (product) => {
      const last = await db.dailyProductSales
        .where('[productId+date]')
        .between([product.id, Dexie.minKey], [product.id, Dexie.maxKey])
        .last();
      if (last) lastSold.set(product.id, last.date);
    }),
  );
  return selectSlowMovers(stale, new Set(), lastSold);
}

export async function getStockForecast(now: Date): Promise<StockForecastRow[]> {
  const window = { start: startOfDay(now, -(FORECAST_DAYS - 1)), end: startOfDay(now, 1) };
  const sold = sumByProduct(await getProductSalesRows(window));
  const active = new Map((await getActiveProducts()).map((product) => [product.id, product]));
  return computeStockForecast(sold, active, await getDefaultMinStock());
}

export async function getAnalysisReadiness(now: Date): Promise<{ ready: boolean; daysOfData: number }> {
  const first = await db.dailySales
    .orderBy('date')
    .filter((row) => row.transactionCount > 0)
    .first();
  return computeReadiness(first?.date ?? null, now);
}
