import { db } from '../../lib/db/database';
import { STOCK_MOVEMENT_COUNTER } from '../../lib/db/records';
import { nextSequences } from '../../lib/db/sequence';
import { buildProductRecords } from './build-product-records';
import { generateExtraProducts } from './generate-extra-products';
import { SEED_PRODUCTS } from './seed-data';

export async function seedSampleProducts(extraCount = 0): Promise<void> {
  // Cek tabel kosong di dalam transaksi yang sama dengan penulisan, supaya dua pemanggilan bersamaan tidak menggandakan data.
  await db.transaction('rw', db.products, db.stockMovements, db.counters, async () => {
    if ((await db.products.count()) > 0) return;

    const now = new Date().toISOString();
    const allFields = [...SEED_PRODUCTS, ...generateExtraProducts(extraCount)];
    const firstSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, allFields.length);
    const records = allFields.map((fields, index) =>
      buildProductRecords(fields, now, firstSeq + index),
    );

    await db.products.bulkAdd(records.map((record) => record.product));
    await db.stockMovements.bulkAdd(records.map((record) => record.movement));
  });
}
