import Dexie from 'dexie';

import { toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { db } from './database';
import { dailyProductSalesSchema } from './records';
import type { DailyProductSales } from './records';

export type ProductTotals = { productId: string; quantity: number; revenue: number; cogs: number };

// Murni: menjumlahkan baris per hari menjadi satu total per produk.
export function sumByProduct(rows: DailyProductSales[]): ProductTotals[] {
  const totals = new Map<string, ProductTotals>();
  for (const row of rows) {
    const current = totals.get(row.productId) ?? { productId: row.productId, quantity: 0, revenue: 0, cogs: 0 };
    totals.set(row.productId, {
      productId: row.productId,
      quantity: current.quantity + row.quantity,
      revenue: current.revenue + row.revenue,
      cogs: current.cogs + row.cogs,
    });
  }
  return [...totals.values()];
}

// Rentang primary key [date+productId]: seluruh produk pada tanggal [start, end). Tanggal lokal, sama dengan rekap harian.
export async function getProductSalesRows(range: DateRange): Promise<DailyProductSales[]> {
  const rows = await db.dailyProductSales
    .where('[date+productId]')
    .between([toLocalDateText(range.start), Dexie.minKey], [toLocalDateText(range.end), Dexie.minKey], true, false)
    .toArray();
  return dailyProductSalesSchema.array().parse(rows);
}

export async function getProductSalesInRange(range: DateRange): Promise<ProductTotals[]> {
  return sumByProduct(await getProductSalesRows(range));
}
