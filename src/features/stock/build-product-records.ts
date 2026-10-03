import { buildStockMovement } from '../../lib/db/build-stock-movement';
import { DEFAULT_ACTOR } from './actor';
import { productSchema } from './schema';
import type { Product, StockMovement } from './schema';

export type NewProductFields = Pick<
  Product,
  'sku' | 'name' | 'category' | 'unit' | 'stockQuantity' | 'minStock' | 'purchasePrice' | 'sellingPrice'
>;

// Satu-satunya tempat aturan "setiap produk baru punya pergerakan awal", dipakai seed dan createProduct.
export function buildProductRecords(
  fields: NewProductFields,
  now: string,
  movementSeq: number,
): { product: Product; movement: StockMovement } {
  const product = productSchema.parse({
    ...fields,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
  const movement = buildStockMovement({
    seq: movementSeq,
    productId: product.id,
    type: 'awal',
    quantityBefore: 0,
    quantityAfter: product.stockQuantity,
    reason: 'Stok awal',
    actor: DEFAULT_ACTOR,
    createdAt: now,
  });
  return { product, movement };
}
