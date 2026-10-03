import { db } from '../../../lib/db/database';
import { saleItemSchema, saleReturnSchema, saleSchema } from '../../../lib/db/records';
import { getItemProgress } from '../sale-returns';
import { SaleActionError } from './sale-action-error';

// Dipanggil di dalam transaksi pemanggil: data dibaca ulang dari database, bukan dari layar yang bisa basi.
export async function loadActiveSale(saleId: string) {
  const row = await db.sales.get(saleId);
  if (!row) throw new SaleActionError('SALE_NOT_FOUND');
  const sale = saleSchema.parse(row);
  if (sale.status === 'dibatalkan') throw new SaleActionError('ALREADY_CANCELLED');

  const items = saleItemSchema.array().parse(await db.saleItems.where('saleId').equals(saleId).toArray());
  const returns = saleReturnSchema.array().parse(await db.saleReturns.where('saleId').equals(saleId).toArray());
  return { sale, items, returns, progress: getItemProgress(sale, items, returns) };
}
