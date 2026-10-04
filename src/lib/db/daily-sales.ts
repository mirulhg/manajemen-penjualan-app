import { buildDailySalesRows, getSaleDateKey, NO_CONTRIBUTION } from './daily-sales-rows';
import type { SaleContribution } from './daily-sales-rows';
import { db } from './database';
import { dailySalesSchema } from './records';
import type { DailySales } from './records';

// Dipakai penulis penjualan (untuk invalidasi) dan pembaca rekap (dasbor) tanpa saling mengimpor fitur.
export const DAILY_SALES_QUERY_KEY = ['daily-sales'] as const;

// Harus dipanggil di dalam transaksi pemanggil (butuh db.dailySales di scope) supaya rekap tidak pernah beda dari data mentah.
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
}

// Jaring pengaman bila rekap pernah menyimpang: hitung ulang seluruhnya dari data mentah.
export async function rebuildDailySales(): Promise<void> {
  await db.transaction('rw', [db.dailySales, db.sales, db.saleItems, db.saleReturns], async () => {
    const rows = buildDailySalesRows(
      await db.sales.toArray(),
      await db.saleItems.toArray(),
      await db.saleReturns.toArray(),
    );
    await db.dailySales.clear();
    await db.dailySales.bulkAdd(rows);
  });
}

// toDateExclusive eksklusif, sama dengan rentang periode (awal hari berikutnya).
export async function getDailySalesRange(fromDate: string, toDateExclusive: string): Promise<DailySales[]> {
  const rows = await db.dailySales.where('date').between(fromDate, toDateExclusive, true, false).toArray();
  return dailySalesSchema.array().parse(rows);
}
