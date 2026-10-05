import type { ProductTotals } from '../../lib/db/daily-product-sales';
import type { Product } from '../../lib/db/records';
import type { ProfitCategoryRow, ProfitRow } from './report-columns';

export const NO_CATEGORY = 'Tanpa kategori';

export type ProfitReport = {
  summary: { revenue: number; cogs: number; grossProfit: number; margin: number };
  byCategory: ProfitCategoryRow[];
  byProduct: ProfitRow[];
};

export function marginPercent(grossProfit: number, revenue: number): number {
  return revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;
}

// Laba terbesar dulu; nilai seri diurutkan nama supaya hasil selalu sama.
function byProfitThenName<Row extends { grossProfit: number }>(label: (row: Row) => string) {
  return (a: Row, b: Row) => b.grossProfit - a.grossProfit || label(a).localeCompare(label(b), 'id');
}

// Murni. Omzet dan HPP dari rekap per produk, jadi totalnya sama dengan rekap harian yang dipakai dasbor.
export function buildProfitReport(totals: ProductTotals[], products: Map<string, Product>): ProfitReport {
  const byProduct: ProfitRow[] = totals
    .map((entry) => {
      const product = products.get(entry.productId);
      const grossProfit = entry.revenue - entry.cogs;
      return {
        sku: product?.sku ?? '',
        name: product?.name ?? 'Produk tidak ditemukan',
        category: product?.category ?? NO_CATEGORY,
        status: product?.archivedAt ? 'Diarsipkan' : 'Aktif',
        quantity: entry.quantity,
        revenue: entry.revenue,
        cogs: entry.cogs,
        grossProfit,
        margin: marginPercent(grossProfit, entry.revenue),
      };
    })
    .sort(byProfitThenName((row) => row.name));

  const categories = new Map<string, { revenue: number; cogs: number }>();
  for (const row of byProduct) {
    const current = categories.get(row.category) ?? { revenue: 0, cogs: 0 };
    categories.set(row.category, { revenue: current.revenue + row.revenue, cogs: current.cogs + row.cogs });
  }
  const byCategory: ProfitCategoryRow[] = [...categories.entries()]
    .map(([category, sums]) => {
      const grossProfit = sums.revenue - sums.cogs;
      return { category, ...sums, grossProfit, margin: marginPercent(grossProfit, sums.revenue) };
    })
    .sort(byProfitThenName((row) => row.category));

  const revenue = byProduct.reduce((sum, row) => sum + row.revenue, 0);
  const cogs = byProduct.reduce((sum, row) => sum + row.cogs, 0);
  return {
    summary: { revenue, cogs, grossProfit: revenue - cogs, margin: marginPercent(revenue - cogs, revenue) },
    byCategory,
    byProduct,
  };
}
