import { toLocalDateText } from '../../utils/date-period';
import type { DailySales, Sale, SaleItem, SaleReturn } from './records';

export type SaleContribution = Omit<DailySales, 'date'>;

export const NO_CONTRIBUTION: SaleContribution = {
  transactionCount: 0,
  grossTotal: 0,
  refundedTotal: 0,
  cogs: 0,
};

// Kontribusi SATU transaksi ke rekap harian; transaksi yang dibatalkan tidak menyumbang apa pun.
export function saleContribution(
  sale: Sale,
  items: SaleItem[],
  returns: SaleReturn[],
): SaleContribution {
  if (sale.status === 'dibatalkan') return NO_CONTRIBUTION;

  const returnedByItem = new Map<string, number>();
  for (const saleReturn of returns) {
    for (const line of saleReturn.items) {
      returnedByItem.set(line.saleItemId, (returnedByItem.get(line.saleItemId) ?? 0) + line.quantity);
    }
  }
  const cogs = items.reduce(
    (sum, item) => sum + item.unitCost * (item.quantity - (returnedByItem.get(item.id) ?? 0)),
    0,
  );
  return { transactionCount: 1, grossTotal: sale.total, refundedTotal: sale.refundedTotal, cogs };
}

export function getSaleDateKey(createdAt: string): string {
  return toLocalDateText(new Date(createdAt));
}

function groupBySaleId<T extends { saleId: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) grouped.set(row.saleId, [...(grouped.get(row.saleId) ?? []), row]);
  return grouped;
}

// Murni: dipakai rebuildDailySales dan upgrade Dexie v7 (yang hanya punya akses tabel, bukan `db`).
export function buildDailySalesRows(
  sales: Sale[],
  items: SaleItem[],
  returns: SaleReturn[],
): DailySales[] {
  const itemsBySale = groupBySaleId(items);
  const returnsBySale = groupBySaleId(returns);
  const byDate = new Map<string, DailySales>();

  for (const sale of sales) {
    const contribution = saleContribution(
      sale,
      itemsBySale.get(sale.id) ?? [],
      returnsBySale.get(sale.id) ?? [],
    );
    if (contribution.transactionCount === 0) continue;
    const date = getSaleDateKey(sale.createdAt);
    const current = byDate.get(date) ?? { date, ...NO_CONTRIBUTION };
    byDate.set(date, {
      date,
      transactionCount: current.transactionCount + contribution.transactionCount,
      grossTotal: current.grossTotal + contribution.grossTotal,
      refundedTotal: current.refundedTotal + contribution.refundedTotal,
      cogs: current.cogs + contribution.cogs,
    });
  }
  return [...byDate.values()];
}

export type SalesMetrics = {
  revenue: number;
  transactionCount: number;
  averageTransaction: number;
  grossProfit: number;
};

export function toMetrics(rows: DailySales[]): SalesMetrics {
  const totals = rows.reduce(
    (sum, row) => ({
      transactionCount: sum.transactionCount + row.transactionCount,
      revenue: sum.revenue + row.grossTotal - row.refundedTotal,
      cogs: sum.cogs + row.cogs,
    }),
    { transactionCount: 0, revenue: 0, cogs: 0 },
  );
  return {
    revenue: totals.revenue,
    transactionCount: totals.transactionCount,
    averageTransaction:
      totals.transactionCount > 0 ? Math.round(totals.revenue / totals.transactionCount) : 0,
    grossProfit: totals.revenue - totals.cogs,
  };
}
