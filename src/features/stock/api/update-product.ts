import { db } from '../../../lib/db/database';
import { PRICE_CHANGE_COUNTER, priceChangeSchema, productSchema } from '../../../lib/db/records';
import type { PriceChange, Product } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { getCurrentActor } from '../../../lib/db/settings';
import { matchExistingSpelling } from '../match-existing-spelling';
import { resolveCategory } from '../resolve-category';
import { editProductSchema } from '../schema';
import type { ProductFieldsInput } from '../schema';

type UpdateProductErrorCode = 'PRODUCT_NOT_FOUND' | 'DUPLICATE_SKU' | 'NO_CHANGE';

export class UpdateProductError extends Error {
  readonly code: UpdateProductErrorCode;
  readonly ownerName: string | null;

  constructor(code: UpdateProductErrorCode, sku = '', ownerName: string | null = null) {
    super(
      code === 'DUPLICATE_SKU'
        ? `SKU ${sku} sudah dipakai oleh ${ownerName}.`
        : code === 'NO_CHANGE'
          ? 'Tidak ada perubahan untuk disimpan.'
          : 'Barang tidak ditemukan.',
    );
    this.name = 'UpdateProductError';
    this.code = code;
    this.ownerName = ownerName;
  }
}

const PRICE_FIELDS = ['purchasePrice', 'sellingPrice'] as const;
const EDITABLE_FIELDS = ['name', 'sku', 'category', 'unit', 'minStock', ...PRICE_FIELDS] as const;

export async function updateProduct(productId: string, input: ProductFieldsInput): Promise<Product> {
  const fields = editProductSchema.parse(input);

  try {
    return await db.transaction('rw', db.products, db.priceChanges, db.counters, db.categories, db.settings, async () => {
      const row = await db.products.get(productId);
      if (!row) throw new UpdateProductError('PRODUCT_NOT_FOUND');
      const product = productSchema.parse(row);

      const owner = await db.products.where('sku').equals(fields.sku).first();
      if (owner && owner.id !== productId) throw new UpdateProductError('DUPLICATE_SKU', fields.sku, owner.name);

      const all = await db.products.toArray();
      const now = new Date().toISOString();
      const next = {
        ...product,
        ...fields,
        category: await resolveCategory(fields.category, now),
        unit: matchExistingSpelling(all.map((item) => item.unit), fields.unit),
      };
      if (EDITABLE_FIELDS.every((field) => next[field] === product[field])) {
        throw new UpdateProductError('NO_CHANGE');
      }

      const actor = await getCurrentActor();
      const changedPrices = PRICE_FIELDS.filter((field) => next[field] !== product[field]);
      const firstSeq =
        changedPrices.length > 0 ? await nextSequences(PRICE_CHANGE_COUNTER, changedPrices.length) : 0;
      const priceChanges: PriceChange[] = changedPrices.map((field, index) =>
        priceChangeSchema.parse({
          id: crypto.randomUUID(),
          seq: firstSeq + index,
          productId,
          field,
          before: product[field],
          after: next[field],
          actor,
          createdAt: now,
        }),
      );

      // stockQuantity sengaja tidak disentuh: stok hanya berubah lewat penyesuaian atau penjualan.
      const updated = productSchema.parse({ ...next, updatedAt: now });
      await db.products.put(updated);
      await db.priceChanges.bulkAdd(priceChanges);
      return updated;
    });
  } catch (error) {
    // Balapan antar tab: indeks unik &sku bisa menolak setelah pengecekan di atas lolos.
    if (error instanceof Error && error.name === 'ConstraintError') {
      const owner = await db.products.where('sku').equals(fields.sku).first();
      if (owner && owner.id !== productId) throw new UpdateProductError('DUPLICATE_SKU', fields.sku, owner.name);
    }
    throw error;
  }
}
