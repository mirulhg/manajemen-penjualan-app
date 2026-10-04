import { buildStockMovement } from '../../../lib/db/build-stock-movement';
import { db } from '../../../lib/db/database';
import { syncStockAlerts } from '../../../lib/db/stock-alerts';
import { productSchema, STOCK_MOVEMENT_COUNTER } from '../../../lib/db/records';
import type { Product } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { SaleActionError } from './sale-action-error';

type RestoreStockParams = {
  lines: { productId: string; quantity: number }[];
  type: 'retur' | 'batal';
  reason: string;
  saleId: string;
  actor: string;
  now: string;
};

// Mengembalikan stok dan mencatat pergerakannya; harus dipanggil di dalam transaksi pemanggil (butuh db.counters,
// db.settings, dan db.stockAlerts). Peringatan stok ikut dievaluasi karena stok naik bisa menutupnya.
export async function restoreStock({ lines, type, reason, saleId, actor, now }: RestoreStockParams) {
  if (lines.length === 0) return;

  const products: Product[] = [];
  for (const line of lines) {
    const row = await db.products.get(line.productId);
    if (!row) throw new SaleActionError('PRODUCT_NOT_FOUND');
    products.push(productSchema.parse(row));
  }

  const firstSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, lines.length);
  const movements = lines.map((line, index) => {
    const product = products[index];
    if (!product) throw new SaleActionError('PRODUCT_NOT_FOUND');
    return buildStockMovement({
      seq: firstSeq + index,
      productId: line.productId,
      type,
      quantityBefore: product.stockQuantity,
      quantityAfter: product.stockQuantity + line.quantity,
      reason,
      actor,
      createdAt: now,
      saleId,
    });
  });
  const updated = products.map((product, index) =>
    productSchema.parse({
      ...product,
      stockQuantity: product.stockQuantity + (lines[index]?.quantity ?? 0),
      updatedAt: now,
    }),
  );

  await db.products.bulkPut(updated);
  await db.stockMovements.bulkAdd(movements);
  await syncStockAlerts(lines.map((line) => line.productId), now);
}
