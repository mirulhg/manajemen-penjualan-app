import { db } from '../../../lib/db/database';
import { STOCK_MOVEMENT_COUNTER } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { buildProductRecords } from '../build-product-records';
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

// Mencegah "Sembako" dan "sembako" menjadi dua kategori: pakai ejaan yang sudah ada bila hanya beda huruf besar/kecil.
function matchExistingSpelling(existingValues: string[], value: string): string {
  const lowered = value.toLocaleLowerCase('id');
  return existingValues.find((existing) => existing.toLocaleLowerCase('id') === lowered) ?? value;
}

export async function createProduct(input: NewProductInput): Promise<Product> {
  const fields = newProductSchema.parse(input);

  try {
    return await db.transaction('rw', db.products, db.stockMovements, db.counters, async () => {
      const owner = await db.products.where('sku').equals(fields.sku).first();
      if (owner) throw new CreateProductError(fields.sku, owner.name);

      const existing = await db.products.toArray();
      const movementSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, 1);
      const { product, movement } = buildProductRecords(
        {
          sku: fields.sku,
          name: fields.name,
          category: matchExistingSpelling(existing.map((item) => item.category), fields.category),
          unit: matchExistingSpelling(existing.map((item) => item.unit), fields.unit),
          stockQuantity: fields.initialStock,
          minStock: fields.minStock,
          purchasePrice: fields.purchasePrice,
          sellingPrice: fields.sellingPrice,
        },
        new Date().toISOString(),
        movementSeq,
      );

      await db.products.add(product);
      await db.stockMovements.add(movement);
      return product;
    });
  } catch (error) {
    // Balapan antar tab: indeks unik &sku bisa menolak setelah pengecekan di atas lolos.
    if (error instanceof Error && error.name === 'ConstraintError') {
      const owner = await db.products.where('sku').equals(fields.sku).first();
      if (owner) throw new CreateProductError(fields.sku, owner.name);
    }
    throw error;
  }
}
