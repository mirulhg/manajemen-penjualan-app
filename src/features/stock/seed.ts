import { db } from '../../lib/db/database';
import { STOCK_MOVEMENT_COUNTER } from '../../lib/db/records';
import { nextSequences } from '../../lib/db/sequence';
import { OWNER_ACTOR } from '../../lib/db/settings';
import { buildProductRecords } from './build-product-records';
import { generateExtraProducts } from './generate-extra-products';
import { resolveCategory } from './resolve-category';
import { SEED_PRODUCTS } from './seed-data';

// Mengembalikan true hanya bila seed benar-benar menulis data (tabel produk tadinya kosong).
export async function seedSampleProducts(extraCount = 0): Promise<boolean> {
  // Cek tabel kosong di dalam transaksi yang sama dengan penulisan, supaya dua pemanggilan bersamaan tidak menggandakan data.
  return db.transaction('rw', db.products, db.stockMovements, db.counters, db.categories, async () => {
    if ((await db.products.count()) > 0) return false;

    const now = new Date().toISOString();
    const allFields = [...SEED_PRODUCTS, ...generateExtraProducts(extraCount)];
    const firstSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, allFields.length);
    const records = allFields.map((fields, index) =>
      buildProductRecords(fields, now, firstSeq + index, OWNER_ACTOR),
    );

    for (const name of new Set(allFields.map((fields) => fields.category))) {
      await resolveCategory(name, now);
    }
    await db.products.bulkAdd(records.map((record) => record.product));
    await db.stockMovements.bulkAdd(records.map((record) => record.movement));
    return true;
  });
}
