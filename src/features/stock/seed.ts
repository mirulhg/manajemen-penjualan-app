import { db } from '../../lib/db';
import { SEED_PRODUCTS } from './seed-data';
import { productSchema, stockMovementSchema } from './schema';

const SEED_ACTOR = 'Pemilik';

export async function seedSampleProducts(): Promise<void> {
  // Cek tabel kosong di dalam transaksi yang sama dengan penulisan, supaya dua pemanggilan bersamaan tidak menggandakan data.
  await db.transaction('rw', db.products, db.stockMovements, async () => {
    if ((await db.products.count()) > 0) return;

    const now = new Date().toISOString();
    const products = SEED_PRODUCTS.map((seed) =>
      productSchema.parse({ ...seed, id: crypto.randomUUID(), createdAt: now, updatedAt: now }),
    );
    const movements = products.map((product) =>
      stockMovementSchema.parse({
        id: crypto.randomUUID(),
        productId: product.id,
        type: 'awal',
        quantityBefore: 0,
        quantityAfter: product.stockQuantity,
        reason: 'Stok awal',
        actor: SEED_ACTOR,
        createdAt: now,
      }),
    );

    await db.products.bulkAdd(products);
    await db.stockMovements.bulkAdd(movements);
  });
}
