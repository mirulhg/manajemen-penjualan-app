import { allocateLineNets, sortSaleItems } from './sale-line-nets';
import type { Sale, SaleItem, SaleReturn } from './records';

export const NO_CATEGORY = 'Tanpa kategori';

export type CategoryRevenue = { category: string; revenue: number };
export type HourCount = { hour: number; count: number };

// Nilai bersih baris (sudah termasuk bagian diskon transaksi) dikurangi uang retur baris itu, dijumlah per kategori.
// Transaksi dibatalkan diabaikan. Jumlah semua kategori = omzet periode (total - refundedTotal).
export function computeRevenueByCategory(
  sales: Sale[],
  items: SaleItem[],
  returns: SaleReturn[],
  categoryByProductId: Map<string, string>,
): CategoryRevenue[] {
  const refundedByItem = new Map<string, number>();
  for (const saleReturn of returns) {
    for (const line of saleReturn.items) {
      refundedByItem.set(line.saleItemId, (refundedByItem.get(line.saleItemId) ?? 0) + line.refundAmount);
    }
  }
  const itemsBySale = new Map<string, SaleItem[]>();
  for (const item of items) {
    itemsBySale.set(item.saleId, [...(itemsBySale.get(item.saleId) ?? []), item]);
  }

  const totals = new Map<string, number>();
  for (const sale of sales) {
    if (sale.status === 'dibatalkan') continue;
    // Urutan baris harus sama dengan yang dipakai saat retur dihitung, supaya pembulatan alokasinya identik.
    const saleItems = sortSaleItems(itemsBySale.get(sale.id) ?? []);
    const nets = allocateLineNets(sale, saleItems);
    saleItems.forEach((item, index) => {
      const category = categoryByProductId.get(item.productId) ?? NO_CATEGORY;
      const net = (nets[index] ?? 0) - (refundedByItem.get(item.id) ?? 0);
      totals.set(category, (totals.get(category) ?? 0) + net);
    });
  }

  return [...totals.entries()]
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
