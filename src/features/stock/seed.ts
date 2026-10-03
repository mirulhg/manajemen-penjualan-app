import { db } from '../../lib/db/database';
import { buildProductRecords } from './build-product-records';
import { generateExtraProducts } from './generate-extra-products';
import { SEED_PRODUCTS } from './seed-data';

export async function seedSampleProducts(extraCount = 0): Promise<void> {
  // Cek tabel kosong di dalam transaksi yang sama dengan penulisan, supaya dua pemanggilan bersamaan tidak menggandakan data.
  await db.transaction('rw', db.products, db.stockMovements, async () => {
    if ((await db.products.count()) > 0) return;

    const now = new Date().toISOString();
    const records = [...SEED_PRODUCTS, ...generateExtraProducts(extraCount)].map((fields) =>
      buildProductRecords(fields, now),
    );

    await db.products.bulkAdd(records.map((record) => record.product));
    await db.stockMovements.bulkAdd(records.map((record) => record.movement));
  });
}
