import type { Sale } from './records';

export const NO_CATEGORY = 'Tanpa kategori';

export type CategoryRevenue = { category: string; revenue: number };
export type HourCount = { hour: number; count: number };

// Jumlah semua kategori = omzet periode, karena revenue per produk sudah bersih dari diskon transaksi dan retur.
export function groupRevenueByCategory(
  totals: { productId: string; revenue: number }[],
  categoryByProductId: Map<string, string>,
): CategoryRevenue[] {
  const byCategory = new Map<string, number>();
  for (const entry of totals) {
    const category = categoryByProductId.get(entry.productId) ?? NO_CATEGORY;
    byCategory.set(category, (byCategory.get(category) ?? 0) + entry.revenue);
  }
  return [...byCategory.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .filter((entry) => entry.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue || a.category.localeCompare(b.category, 'id'));
}

export const HOURS_PER_DAY = 24;

// Jam lokal 00-23; transaksi dibatalkan tidak dihitung.
export function countTransactionsByHour(sales: Sale[]): number[] {
  const counts = Array.from({ length: HOURS_PER_DAY }, () => 0);
  for (const sale of sales) {
    if (sale.status === 'dibatalkan') continue;
    const hour = new Date(sale.createdAt).getHours();
    counts[hour] = (counts[hour] ?? 0) + 1;
  }
  return counts;
}

// Dari jam pertama sampai terakhir yang ada transaksinya; jam kosong di tengah tetap tampil 0.
export function trimHours(counts: number[]): HourCount[] {
  const first = counts.findIndex((count) => count > 0);
  if (first === -1) return [];
  const last = counts.length - 1 - [...counts].reverse().findIndex((count) => count > 0);
  return counts.slice(first, last + 1).map((count, offset) => ({ hour: first + offset, count }));
}
