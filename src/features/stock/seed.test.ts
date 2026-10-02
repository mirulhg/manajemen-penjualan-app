import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db';
import { getProducts } from './api/get-products';
import { seedSampleProducts } from './seed';
import { getStockStatus } from './stock-status';

describe('seedSampleProducts', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
  });

  it('mengisi database kosong dengan 30 produk dan 30 pergerakan awal', async () => {
    await seedSampleProducts();

    expect(await db.products.count()).toBe(30);
    const movements = await db.stockMovements.toArray();
    expect(movements).toHaveLength(30);
    expect(movements.every((movement) => movement.type === 'awal')).toBe(true);
  });

  it('tidak menggandakan data saat dipanggil dua kali', async () => {
    await seedSampleProducts();
    await seedSampleProducts();

    expect(await db.products.count()).toBe(30);
    expect(await db.stockMovements.count()).toBe(30);
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
