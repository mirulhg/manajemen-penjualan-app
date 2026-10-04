import { db } from '../../../lib/db/database';
import { syncStockAlerts } from '../../../lib/db/stock-alerts';
import { STOCK_MOVEMENT_COUNTER } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { getCurrentActor } from '../../../lib/db/settings';
import { buildProductRecords } from '../build-product-records';
import { matchExistingSpelling } from '../match-existing-spelling';
import { resolveCategory } from '../resolve-category';
import { newProductSchema } from '../schema';
import type { NewProductInput, Product } from '../schema';

export class CreateProductError extends Error {
  readonly code = 'DUPLICATE_SKU';
  readonly ownerName: string;

  constructor(sku: string, ownerName: string) {
    super(`SKU ${sku} sudah dipakai oleh ${ownerName}.`);
    this.name = 'CreateProductError';
    this.ownerName = ownerName;
  }
}

export async function createProduct(input: NewProductInput): Promise<Product> {
  const fields = newProductSchema.parse(input);

  try {
    return await db.transaction(
      'rw',
      [db.products, db.stockMovements, db.counters, db.categories, db.settings, db.stockAlerts],
      async () => {
      const owner = await db.products.where('sku').equals(fields.sku).first();
      if (owner) throw new CreateProductError(fields.sku, owner.name);

      const existing = await db.products.toArray();
      const now = new Date().toISOString();
      const movementSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, 1);
      const { product, movement } = buildProductRecords(
        {
          sku: fields.sku,
          name: fields.name,
          category: await resolveCategory(fields.category, now),
          unit: matchExistingSpelling(existing.map((item) => item.unit), fields.unit),
          stockQuantity: fields.initialStock,
          minStock: fields.minStock,
          purchasePrice: fields.purchasePrice,
          sellingPrice: fields.sellingPrice,
        },
        now,
        movementSeq,
        await getCurrentActor(),
      );

      await db.products.add(product);
      await db.stockMovements.add(movement);
      await syncStockAlerts([product.id], now);
      return product;
    },
    );
  } catch (error) {
    // Balapan antar tab: indeks unik &sku bisa menolak setelah pengecekan di atas lolos.
    if (error instanceof Error && error.name === 'ConstraintError') {
      const owner = await db.products.where('sku').equals(fields.sku).first();
      if (owner) throw new CreateProductError(fields.sku, owner.name);
    }
    throw error;
  }
}
