import { buildDailyRecap, getSaleDateKey, isZeroProductRow, NO_CONTRIBUTION } from './daily-sales-rows';
import type { ProductContribution, SaleContribution } from './daily-sales-rows';
import { db } from './database';
import { dailyProductSalesSchema, dailySalesSchema } from './records';
import type { DailyProductSales, DailySales } from './records';

// Dipakai penulis penjualan (untuk invalidasi) dan pembaca rekap (dasbor) tanpa saling mengimpor fitur.
export const DAILY_SALES_QUERY_KEY = ['daily-sales'] as const;

// Selisih per produk: sesudah - sebelum, hanya untuk produk yang berubah.
function diffProducts(before: ProductContribution[], after: ProductContribution[]): ProductContribution[] {
  const deltas = new Map<string, ProductContribution>();
  const add = (rows: ProductContribution[], sign: 1 | -1) => {
    for (const row of rows) {
      const current = deltas.get(row.productId) ?? { productId: row.productId, quantity: 0, revenue: 0, cogs: 0 };
      deltas.set(row.productId, {
        productId: row.productId,
        quantity: current.quantity + sign * row.quantity,
        revenue: current.revenue + sign * row.revenue,
        cogs: current.cogs + sign * row.cogs,
      });
    }
  };
  add(before, -1);
  add(after, 1);
  return [...deltas.values()].filter((delta) => !isZeroProductRow(delta));
}

async function applyProductChanges(date: string, deltas: ProductContribution[]): Promise<void> {
  if (deltas.length === 0) return;
  const existing = await db.dailyProductSales.bulkGet(deltas.map((delta) => [date, delta.productId]));
  const toPut: DailyProductSales[] = [];
  const toDelete: [string, string][] = [];

  deltas.forEach((delta, index) => {
    const current = existing[index];
    const next = {
      date,
      productId: delta.productId,
      quantity: (current?.quantity ?? 0) + delta.quantity,
      revenue: (current?.revenue ?? 0) + delta.revenue,
      cogs: (current?.cogs ?? 0) + delta.cogs,
    };
    if (isZeroProductRow(next)) toDelete.push([date, delta.productId]);
    else toPut.push(dailyProductSalesSchema.parse(next));
  });
  await db.dailyProductSales.bulkDelete(toDelete);
  await db.dailyProductSales.bulkPut(toPut);
}

// Harus dipanggil di dalam transaksi pemanggil (butuh db.dailySales dan db.dailyProductSales di scope) supaya rekap
// tidak pernah beda dari data mentah.
export async function applyDailySalesChange(
  createdAt: string,
  before: SaleContribution,
  after: SaleContribution,
): Promise<void> {
  const date = getSaleDateKey(createdAt);
  const row = await db.dailySales.get(date);
  const current = row ? dailySalesSchema.parse(row) : { date, ...NO_CONTRIBUTION };
  await db.dailySales.put(
    dailySalesSchema.parse({
      date,
      transactionCount: current.transactionCount + after.transactionCount - before.transactionCount,
      grossTotal: current.grossTotal + after.grossTotal - before.grossTotal,
      refundedTotal: current.refundedTotal + after.refundedTotal - before.refundedTotal,
      cogs: current.cogs + after.cogs - before.cogs,
    }),
  );
  await applyProductChanges(date, diffProducts(before.products, after.products));
}

// Jaring pengaman bila rekap pernah menyimpang: hitung ulang seluruhnya dari data mentah.
export async function rebuildDailySales(): Promise<void> {
  await db.transaction(
    'rw',
    [db.dailySales, db.dailyProductSales, db.sales, db.saleItems, db.saleReturns],
    async () => {
      const recap = buildDailyRecap(
        await db.sales.toArray(),
        await db.saleItems.toArray(),
        await db.saleReturns.toArray(),
      );
      await db.dailySales.clear();
      await db.dailyProductSales.clear();
      await db.dailySales.bulkAdd(recap.days);
      await db.dailyProductSales.bulkAdd(recap.products);
    },
  );
}

export async function hasAnyDailySales(): Promise<boolean> {
  return (await db.dailySales.count()) > 0;
}

// toDateExclusive eksklusif, sama dengan rentang periode (awal hari berikutnya).
export async function getDailySalesRange(fromDate: string, toDateExclusive: string): Promise<DailySales[]> {
  const rows = await db.dailySales.where('date').between(fromDate, toDateExclusive, true, false).toArray();
  return dailySalesSchema.array().parse(rows);
}
