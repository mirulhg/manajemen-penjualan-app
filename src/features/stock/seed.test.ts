import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db/database';
import { DEFAULT_ACTOR } from './actor';
import { getProducts } from './api/get-products';
import { seedSampleProducts } from './seed';
import { getStockStatus } from './stock-status';

describe('seedSampleProducts', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await db.categories.clear();
  });

  it('mengisi database kosong dengan 30 produk dan 30 pergerakan awal', async () => {
    await seedSampleProducts();

    expect(await db.products.count()).toBe(30);
    const movements = await db.stockMovements.toArray();
    expect(movements).toHaveLength(30);
    expect(movements.every((movement) => movement.type === 'awal')).toBe(true);
  });

  it('semua pergerakan awal dicatat oleh aktor bawaan', async () => {
    await seedSampleProducts();

    const movements = await db.stockMovements.toArray();
    expect(movements.every((movement) => movement.actor === DEFAULT_ACTOR)).toBe(true);
  });

  it('tidak menggandakan data saat dipanggil dua kali', async () => {
    await seedSampleProducts();
    await seedSampleProducts();

    expect(await db.products.count()).toBe(30);
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('membuat 6 kategori dan tetap 6 setelah dua kali seed', async () => {
    await seedSampleProducts();
    await seedSampleProducts();

    const categories = await db.categories.toArray();
    expect(categories.map((category) => category.name).sort()).toEqual([
      'Bumbu Dapur',
      'Kebutuhan Rumah',
      'Makanan Ringan',
      'Minuman',
      'Perlengkapan Mandi',
      'Sembako',
    ]);
    expect(new Set(categories.map((category) => category.nameKey)).size).toBe(6);
  });

  it('tidak menggandakan data saat dipanggil bersamaan', async () => {
    await Promise.all([seedSampleProducts(), seedSampleProducts()]);

    expect(await db.products.count()).toBe(30);
  });

  it('menghasilkan ringkasan yang cocok dengan Data Contoh Produk', async () => {
    await seedSampleProducts();
    const products = await getProducts();

    const totalUnits = products.reduce((sum, product) => sum + product.stockQuantity, 0);
    const stockValue = products.reduce(
      (sum, product) => sum + product.stockQuantity * product.purchasePrice,
      0,
    );
    const statusCount = { aman: 0, menipis: 0, habis: 0 };
    for (const product of products) {
      statusCount[getStockStatus(product.stockQuantity, product.minStock)] += 1;
    }

    expect(totalUnits).toBe(406);
    expect(stockValue).toBe(4_025_100);
    expect(statusCount).toEqual({ aman: 18, menipis: 8, habis: 4 });
  });
});

describe('seedSampleProducts dengan produk tambahan', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
  });

  it('1970 produk tambahan menjadi total 2.000 dengan SKU unik', async () => {
    await seedSampleProducts(1970);

    const products = await db.products.toArray();
    expect(products).toHaveLength(2000);
    expect(new Set(products.map((product) => product.sku)).size).toBe(2000);
    expect(await db.stockMovements.count()).toBe(2000);
  });

  it('produk tambahan memunculkan ketiga status', async () => {
    await seedSampleProducts(100);

    const extra = (await getProducts()).filter((product) => product.sku.startsWith('GEN-'));
    const statuses = new Set(
      extra.map((product) => getStockStatus(product.stockQuantity, product.minStock)),
    );
    expect(statuses).toEqual(new Set(['aman', 'menipis', 'habis']));
  });
});
