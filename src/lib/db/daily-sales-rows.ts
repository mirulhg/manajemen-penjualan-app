import { toLocalDateText } from '../../utils/date-period';
import type { DailyProductSales, DailySales, Sale, SaleItem, SaleReturn } from './records';
import { allocateLineNets, sortSaleItems } from './sale-line-nets';

export type ProductContribution = Omit<DailyProductSales, 'date'>;

export type SaleContribution = Omit<DailySales, 'date'> & { products: ProductContribution[] };

export const NO_CONTRIBUTION: SaleContribution = {
  transactionCount: 0,
  grossTotal: 0,
  refundedTotal: 0,
  cogs: 0,
  products: [],
};

// Kontribusi SATU transaksi ke rekap harian dan rekap per produk; transaksi yang dibatalkan tidak menyumbang apa pun.
export function saleContribution(
  sale: Sale,
  items: SaleItem[],
  returns: SaleReturn[],
): SaleContribution {
  if (sale.status === 'dibatalkan') return NO_CONTRIBUTION;

  const returnedQuantity = new Map<string, number>();
  const refundedAmount = new Map<string, number>();
  for (const saleReturn of returns) {
    for (const line of saleReturn.items) {
      returnedQuantity.set(line.saleItemId, (returnedQuantity.get(line.saleItemId) ?? 0) + line.quantity);
      refundedAmount.set(line.saleItemId, (refundedAmount.get(line.saleItemId) ?? 0) + line.refundAmount);
    }
  }

  // Urutan baris harus sama dengan yang dipakai saat retur dihitung, supaya pembulatan alokasinya identik.
  const sortedItems = sortSaleItems(items);
  const nets = allocateLineNets(sale, sortedItems);
  const byProduct = new Map<string, ProductContribution>();
  sortedItems.forEach((item, index) => {
    const quantity = item.quantity - (returnedQuantity.get(item.id) ?? 0);
    const current = byProduct.get(item.productId) ?? { productId: item.productId, quantity: 0, revenue: 0, cogs: 0 };
    byProduct.set(item.productId, {
      productId: item.productId,
      quantity: current.quantity + quantity,
      revenue: current.revenue + (nets[index] ?? 0) - (refundedAmount.get(item.id) ?? 0),
      cogs: current.cogs + item.unitCost * quantity,
    });
  });
  const products = [...byProduct.values()];

  return {
    transactionCount: 1,
    grossTotal: sale.total,
    refundedTotal: sale.refundedTotal,
    cogs: products.reduce((sum, product) => sum + product.cogs, 0),
    products,
  };
}

export function getSaleDateKey(createdAt: string): string {
  return toLocalDateText(new Date(createdAt));
}

function groupBySaleId<T extends { saleId: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) grouped.set(row.saleId, [...(grouped.get(row.saleId) ?? []), row]);
  return grouped;
}

export type DailyRecap = { days: DailySales[]; products: DailyProductSales[] };

function isZeroProductRow(row: ProductContribution): boolean {
  return row.quantity === 0 && row.revenue === 0 && row.cogs === 0;
}

// Murni: dipakai rebuildDailySales dan upgrade Dexie v7/v8 (yang hanya punya akses tabel, bukan `db`).
export function buildDailyRecap(sales: Sale[], items: SaleItem[], returns: SaleReturn[]): DailyRecap {
  const itemsBySale = groupBySaleId(items);
  const returnsBySale = groupBySaleId(returns);
  // Tanggal yang semua transaksinya dibatalkan tetap punya baris harian (bernilai nol), sama seperti pembaruan inkremental.
  const byDate = new Map<string, DailySales>();
  const byProduct = new Map<string, DailyProductSales>();

  for (const sale of sales) {
    const contribution = saleContribution(
      sale,
      itemsBySale.get(sale.id) ?? [],
      returnsBySale.get(sale.id) ?? [],
    );
    const date = getSaleDateKey(sale.createdAt);
    const current = byDate.get(date) ?? { date, transactionCount: 0, grossTotal: 0, refundedTotal: 0, cogs: 0 };
    byDate.set(date, {
      date,
      transactionCount: current.transactionCount + contribution.transactionCount,
      grossTotal: current.grossTotal + contribution.grossTotal,
      refundedTotal: current.refundedTotal + contribution.refundedTotal,
      cogs: current.cogs + contribution.cogs,
    });

    for (const product of contribution.products) {
      const key = `${date}|${product.productId}`;
      const existing = byProduct.get(key) ?? { date, productId: product.productId, quantity: 0, revenue: 0, cogs: 0 };
      byProduct.set(key, {
        ...existing,
        quantity: existing.quantity + product.quantity,
        revenue: existing.revenue + product.revenue,
        cogs: existing.cogs + product.cogs,
      });
    }
  }
  return {
    days: [...byDate.values()],
    // Baris yang bernilai nol semua (mis. barang diretur penuh) tidak disimpan, sama seperti pembaruan inkremental.
    products: [...byProduct.values()].filter((row) => !isZeroProductRow(row)),
  };
}

export { isZeroProductRow };

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
