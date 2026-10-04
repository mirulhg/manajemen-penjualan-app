import { applyDailySalesChange } from '../../../lib/db/daily-sales';
import { saleContribution } from '../../../lib/db/daily-sales-rows';
import { db } from '../../../lib/db/database';
import { saleSchema } from '../../../lib/db/records';
import type { Sale } from '../../../lib/db/records';
import { getCurrentActor } from '../../../lib/db/settings';
import { cancelSaleInputSchema } from '../schema';
import { loadActiveSale } from './load-active-sale';
import { restoreStock } from './restore-stock';

export async function cancelSale(saleId: string, reason: string): Promise<Sale> {
  const request = cancelSaleInputSchema.parse({ reason });
  const nowIso = new Date().toISOString();

  return db.transaction(
    'rw',
    [
      db.sales,
      db.saleItems,
      db.saleReturns,
      db.products,
      db.stockMovements,
      db.counters,
      db.settings,
      db.dailySales,
    ],
    async () => {
      const { sale, items, returns, progress } = await loadActiveSale(saleId);
      const actor = await getCurrentActor();

      // Hanya sisa yang belum diretur yang dikembalikan; yang sudah diretur stoknya sudah kembali lewat retur.
      await restoreStock({
        lines: progress
          .filter((entry) => entry.remaining > 0)
          .map((entry) => ({ productId: entry.item.productId, quantity: entry.remaining })),
        type: 'batal',
        reason: `Batal ${sale.number}: ${request.reason}`,
        saleId,
        actor,
        now: nowIso,
      });
      const cancelled = saleSchema.parse({
        ...sale,
        status: 'dibatalkan',
        cancelledAt: nowIso,
        cancelReason: request.reason,
        cancelledBy: actor,
      });
      await db.sales.put(cancelled);
      await applyDailySalesChange(
        sale.createdAt,
        saleContribution(sale, items, returns),
        saleContribution(cancelled, items, returns),
      );
      return cancelled;
    },
  );
}
