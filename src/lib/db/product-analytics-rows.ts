import { daysBetween, parseLocalDate, startOfDay } from '../../utils/date-period';
import type { ProductTotals } from './daily-product-sales';
import type { Product } from './records';

export const MISSING_PRODUCT_NAME = 'Produk tidak ditemukan';

export type ProductSalesRow = ProductTotals & {
  name: string;
  unit: string;
  isArchived: boolean;
};

export type RankedProduct = ProductSalesRow & {
  grossProfit: number;
  // Persen dengan satu desimal; null bila omzet 0.
  margin: number | null;
};

const compareNames = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'id');

export function joinProductTotals(totals: ProductTotals[], products: Map<string, Product>): ProductSalesRow[] {
  return totals.map((entry) => {
    const product = products.get(entry.productId);
    return {
      ...entry,
      name: product?.name ?? MISSING_PRODUCT_NAME,
      unit: product?.unit ?? '',
      isArchived: product ? product.archivedAt !== null : false,
    };
  });
}

// Jumlah terjual terbanyak; nilai seri diurutkan nama supaya hasil selalu sama.
export function topByQuantity(rows: ProductSalesRow[], limit: number): ProductSalesRow[] {
  return rows
    .filter((row) => row.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity || compareNames(a, b))
    .slice(0, limit);
}

// Peringkat penuh (tanpa batas) supaya pareto dihitung dari seluruh produk; tampilan memotongnya sendiri.
export function rankBy(rows: ProductSalesRow[], key: 'revenue' | 'grossProfit'): RankedProduct[] {
  return rows
    .filter((row) => row.quantity > 0)
    .map((row) => {
      const grossProfit = row.revenue - row.cogs;
      return {
        ...row,
        grossProfit,
        margin: row.revenue > 0 ? Math.round((grossProfit / row.revenue) * 1000) / 10 : null,
      };
    })
    .sort((a, b) => b[key] - a[key] || compareNames(a, b));
}

// Produk diberi tanda sampai omzet kumulatifnya mencapai ambang, termasuk produk yang melewati batas itu.
// Dibandingkan sebagai bilangan bulat (persen x 100) supaya tidak terkena pembulatan pecahan.
export function markParetoContributors(
  rankedByRevenue: RankedProduct[],
  threshold: number,
): { contributorIds: Set<string>; count: number } {
  const total = rankedByRevenue.reduce((sum, row) => sum + row.revenue, 0);
  const contributorIds = new Set<string>();
  if (total <= 0) return { contributorIds, count: 0 };

  const percent = Math.round(threshold * 100);
  let cumulative = 0;
  for (const row of rankedByRevenue) {
    contributorIds.add(row.productId);
    cumulative += row.revenue;
    if (cumulative * 100 >= total * percent) break;
  }
  return { contributorIds, count: contributorIds.size };
}

export type SlowMover = {
  productId: string;
  name: string;
  unit: string;
  stockQuantity: number;
  stockValue: number;
  // Tanggal lokal YYYY-MM-DD; null = belum pernah terjual.
  lastSoldDate: string | null;
};

// Produk aktif tanpa penjualan di jendela waktu; urut nilai stok terbesar (modal yang tertahan), lalu nama.
export function selectSlowMovers(
  activeProducts: Product[],
  soldProductIds: Set<string>,
  lastSoldByProductId: Map<string, string>,
): SlowMover[] {
  return activeProducts
    .filter((product) => !soldProductIds.has(product.id))
    .map((product) => ({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      stockQuantity: product.stockQuantity,
      stockValue: Math.max(product.stockQuantity, 0) * product.purchasePrice,
      lastSoldDate: lastSoldByProductId.get(product.id) ?? null,
    }))
    .sort((a, b) => b.stockValue - a.stockValue || compareNames(a, b));
}

export const FORECAST_DAYS = 14;

export type StockForecastRow = {
  productId: string;
  name: string;
  unit: string;
  stockQuantity: number;
  averagePerDay: number;
  daysUntilOut: number;
  restockSuggestion: number;
};

// Rata-rata = terjual FORECAST_DAYS hari terakhir / FORECAST_DAYS. Saran restock = kebutuhan FORECAST_DAYS hari ke depan
// dikurangi stok; avg x 14 sama dengan jumlah terjual, jadi dipakai langsung agar tidak terkena galat pecahan.
export function computeStockForecast(soldInWindow: ProductTotals[], activeProducts: Map<string, Product>): StockForecastRow[] {
  const rows: StockForecastRow[] = [];
  for (const entry of soldInWindow) {
    const product = activeProducts.get(entry.productId);
    if (!product || entry.quantity <= 0) continue;
    const averagePerDay = entry.quantity / FORECAST_DAYS;
    rows.push({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      stockQuantity: product.stockQuantity,
      averagePerDay,
      daysUntilOut: product.stockQuantity <= 0 ? 0 : product.stockQuantity / averagePerDay,
      restockSuggestion: Math.max(0, entry.quantity - product.stockQuantity),
    });
  }
  return rows.sort((a, b) => a.daysUntilOut - b.daysUntilOut || compareNames(a, b));
}

export function describeDaysUntilOut(daysUntilOut: number): string {
  if (daysUntilOut <= 0) return 'Sudah habis';
  if (daysUntilOut < 1) return 'kurang dari 1 hari';
  return `sekitar ${Math.round(daysUntilOut)} hari`;
}

export const MIN_ANALYSIS_DAYS = 7;

// Hari ini ikut dihitung: penjualan pertama 3 hari lalu = 4 hari data.
export function computeReadiness(firstSaleDate: string | null, now: Date): { ready: boolean; daysOfData: number } {
  const first = parseLocalDate(firstSaleDate);
  const daysOfData = first ? daysBetween(first, startOfDay(now)) + 1 : 0;
  return { ready: daysOfData >= MIN_ANALYSIS_DAYS, daysOfData };
}
