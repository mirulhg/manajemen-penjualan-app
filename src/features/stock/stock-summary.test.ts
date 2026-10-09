import { beforeEach, describe, expect, it } from 'vitest';

import { SEED_AS_PRODUCTS } from '../../test/seed-products';
import { db } from '../../lib/db/database';
import { adjustStock } from './api/adjust-stock';
import { getProducts } from './api/get-products';
import { seedSampleProducts } from './seed';
import { getStockSummary } from './stock-summary';

describe('getStockSummary', () => {
  it('seed: 30 jenis, 406 unit, Rp 4.025.100', () => {
    expect(getStockSummary(SEED_AS_PRODUCTS)).toEqual({
      productCount: 30,
      totalUnits: 406,
      stockValue: 4_025_100,
    });
  });

  it('stok minus tidak mengurangi nilai stok, tetapi tetap mengurangi total unit', () => {
    const [first, ...others] = SEED_AS_PRODUCTS;
    if (!first) throw new Error('seed kosong');
    const withNegative = [{ ...first, stockQuantity: -3 }, ...others];

    expect(getStockSummary(withNegative)).toEqual({
      productCount: 30,
      totalUnits: 406 - 18 - 3,
      stockValue: 4_025_100 - 18 * 68_000,
    });
  });

  it('daftar kosong menghasilkan nol', () => {
    expect(getStockSummary([])).toEqual({ productCount: 0, totalUnits: 0, stockValue: 0 });
  });

  describe('setelah penyesuaian', () => {
    beforeEach(async () => {
      await db.products.clear();
      await db.stockMovements.clear();
      await seedSampleProducts();
    });

    it('stok masuk +7 pada SBK-001: 30 / 413 / 4.501.100', async () => {
      const beras = await db.products.where('sku').equals('SBK-001').first();
      if (!beras) throw new Error('SBK-001 tidak ada di seed');
      await adjustStock(beras.id, { type: 'masuk', quantity: '7', reason: 'Kiriman supplier' });

      expect(getStockSummary(await getProducts())).toEqual({
        productCount: 30,
        totalUnits: 413,
        stockValue: 4_501_100,
      });
    });
  });
});
