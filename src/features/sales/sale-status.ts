import type { Sale } from '../../lib/db/records';

export type SaleDisplayStatus = 'selesai' | 'retur-sebagian' | 'diretur-penuh' | 'dibatalkan';

export function saleDisplayStatus(sale: Pick<Sale, 'status' | 'refundedTotal' | 'total'>): SaleDisplayStatus {
  if (sale.status === 'dibatalkan') return 'dibatalkan';
  if (sale.refundedTotal <= 0) return 'selesai';
  return sale.refundedTotal >= sale.total ? 'diretur-penuh' : 'retur-sebagian';
}

// Omzet bersih: total transaksi yang tidak dibatalkan dikurangi total retur. Angka ini harus sama dengan dashboard Fase 3.
export function netRevenue(sales: Pick<Sale, 'status' | 'refundedTotal' | 'total'>[]): number {
  return sales
    .filter((sale) => sale.status !== 'dibatalkan')
    .reduce((sum, sale) => sum + sale.total - sale.refundedTotal, 0);
}
