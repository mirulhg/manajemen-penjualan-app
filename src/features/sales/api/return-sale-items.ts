import { applyDailySalesChange } from '../../../lib/db/daily-sales';
import { saleContribution } from '../../../lib/db/daily-sales-rows';
import { db } from '../../../lib/db/database';
import { saleReturnSchema, saleSchema } from '../../../lib/db/records';
import type { SaleReturn } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { getCurrentActor } from '../../../lib/db/settings';
import { calculateReturn } from '../sale-returns';
import { formatReturnNumber, getReturnCounterName } from '../sale-number';
import { returnSaleItemsInputSchema } from '../schema';
import type { ReturnSaleItemsInput } from '../schema';
import { loadActiveSale } from './load-active-sale';
import { restoreStock } from './restore-stock';
import { SaleActionError } from './sale-action-error';

export async function returnSaleItems(saleId: string, input: ReturnSaleItemsInput): Promise<SaleReturn> {
  const request = returnSaleItemsInputSchema.parse(input);
  const now = new Date();
  const nowIso = now.toISOString();

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
      db.dailyProductSales,
    ],
    async () => {
      const { sale, items, returns, progress } = await loadActiveSale(saleId);
      const actor = await getCurrentActor();

      for (const line of request.items) {
        const entry = progress.find((candidate) => candidate.item.id === line.saleItemId);
        if (!entry) throw new SaleActionError('ITEM_NOT_IN_SALE', line.saleItemId);
        if (line.quantity > entry.remaining) {
          throw new SaleActionError('RETURN_EXCEEDS_REMAINING', line.saleItemId);
        }
      }

      const { lines, refundTotal } = calculateReturn(progress, request.items);
      const number = formatReturnNumber(now, await nextSequences(getReturnCounterName(now), 1));
      const saleReturn = saleReturnSchema.parse({
        id: crypto.randomUUID(),
        number,
        saleId,
        items: lines,
        refundTotal,
        reason: request.reason,
        actor,
        createdAt: nowIso,
      });

      await restoreStock({
        lines: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        type: 'retur',
        reason: `Retur ${number} (${sale.number}): ${request.reason}`,
        saleId,
        actor,
        now: nowIso,
      });
      await db.saleReturns.add(saleReturn);
      const updatedSale = saleSchema.parse({ ...sale, refundedTotal: sale.refundedTotal + refundTotal });
      await db.sales.put(updatedSale);
      // Retur mengurangi rekap di tanggal transaksi asal, bukan tanggal retur.
      await applyDailySalesChange(
        sale.createdAt,
        saleContribution(sale, items, returns),
        saleContribution(updatedSale, items, [...returns, saleReturn]),
      );
      return saleReturn;
    },
  );
}
