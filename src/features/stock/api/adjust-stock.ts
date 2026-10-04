import { buildStockMovement } from '../../../lib/db/build-stock-movement';
import { db } from '../../../lib/db/database';
import { syncStockAlerts } from '../../../lib/db/stock-alerts';
import { STOCK_MOVEMENT_COUNTER } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { getCurrentActor } from '../../../lib/db/settings';
import { productSchema, stockAdjustmentSchema } from '../schema';
import type { Product, StockAdjustmentInput } from '../schema';

type StockAdjustmentErrorCode = 'PRODUCT_NOT_FOUND' | 'NO_CHANGE';

export class StockAdjustmentError extends Error {
  readonly code: StockAdjustmentErrorCode;
  readonly currentQuantity: number | null;

  constructor(code: StockAdjustmentErrorCode, currentQuantity: number | null = null) {
    super(code === 'NO_CHANGE' ? 'Hasil penyesuaian sama dengan stok sekarang.' : 'Barang tidak ditemukan.');
    this.name = 'StockAdjustmentError';
    this.code = code;
    this.currentQuantity = currentQuantity;
  }
}

export async function adjustStock(productId: string, input: StockAdjustmentInput): Promise<Product> {
  const adjustment = stockAdjustmentSchema.parse(input);

  // Stok dibaca ulang di dalam transaksi, bukan dari data di layar, yang bisa sudah basi.
  return db.transaction('rw', db.products, db.stockMovements, db.counters, db.settings, db.stockAlerts, async () => {
    const row = await db.products.get(productId);
    if (!row) throw new StockAdjustmentError('PRODUCT_NOT_FOUND');

    const product = productSchema.parse(row);
    const quantityBefore = product.stockQuantity;
    const quantityAfter =
      adjustment.type === 'masuk' ? quantityBefore + adjustment.quantity : adjustment.quantity;
    if (quantityAfter === quantityBefore) throw new StockAdjustmentError('NO_CHANGE', quantityBefore);

    const actor = await getCurrentActor();
    const movementSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, 1);
    const now = new Date().toISOString();
    const updated = productSchema.parse({ ...product, stockQuantity: quantityAfter, updatedAt: now });
    const movement = buildStockMovement({
      seq: movementSeq,
      productId,
      type: adjustment.type,
      quantityBefore,
      quantityAfter,
      reason: adjustment.reason,
      actor,
      createdAt: now,
    });

    await db.products.put(updated);
    await db.stockMovements.add(movement);
    await syncStockAlerts([productId], now);
    return updated;
  });
}
