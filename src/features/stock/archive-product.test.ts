import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { archiveProduct, unarchiveProduct } from './api/archive-product';
import { getProducts } from './api/get-products';
import { filterProducts } from './filter-products';
import type { StockFilters } from './parse-filter-params';
import { getStockSummary } from './stock-summary';

const NO_FILTER: StockFilters = { query: null, category: null, status: null, sort: 'nama', archived: false };

async function activeSummary() {
  const products = await getProducts();
  return getStockSummary(products.filter((product) => product.archivedAt === null));
}

describe('arsip produk', () => {
  beforeEach(resetDatabaseWithSeed);

  it('arsipkan lalu pulihkan mengubah archivedAt dan updatedAt', async () => {
    const before = await findProductBySku('MKR-005');

    const archived = await archiveProduct(before.id);
    expect(archived.archivedAt).not.toBeNull();
    expect(archived.stockQuantity).toBe(before.stockQuantity);

    const restored = await unarchiveProduct(before.id);
    expect(restored.archivedAt).toBeNull();
  });

  it('arsipkan yang sudah arsip: ALREADY_ARCHIVED; pulihkan yang aktif: NOT_ARCHIVED', async () => {
    const product = await findProductBySku('MKR-005');
    await expect(unarchiveProduct(product.id)).rejects.toMatchObject({ code: 'NOT_ARCHIVED' });

    await archiveProduct(product.id);
    await expect(archiveProduct(product.id)).rejects.toMatchObject({ code: 'ALREADY_ARCHIVED' });
    await expect(archiveProduct(crypto.randomUUID())).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
  });

  it('daftar bawaan menyembunyikan barang arsip; opsi arsip memunculkannya', async () => {
    await archiveProduct((await findProductBySku('MKR-005')).id);
    const products = await getProducts();

    expect(filterProducts(products, NO_FILTER, 5)).toHaveLength(29);
    expect(filterProducts(products, { ...NO_FILTER, archived: true }, 5)).toHaveLength(30);
    expect(filterProducts(products, { ...NO_FILTER, query: 'roti' }, 5)).toHaveLength(0);
  });

  it('ringkasan hanya barang aktif: arsip Roti Tawar (stok 0) tidak mengubah unit dan nilai', async () => {
    await archiveProduct((await findProductBySku('MKR-005')).id);
    expect(await activeSummary()).toEqual({ productCount: 29, totalUnits: 406, stockValue: 4_025_100 });
  });

  it('ringkasan hanya barang aktif: arsip Tisu (22 × 12.500) mengurangi unit dan nilai', async () => {
    await archiveProduct((await findProductBySku('RMH-003')).id);
    expect(await activeSummary()).toEqual({ productCount: 29, totalUnits: 384, stockValue: 3_750_100 });
  });

  it('arsip Roti Tawar dan Tisu bersamaan: 28 jenis, 384 unit, Rp 3.750.100', async () => {
    await archiveProduct((await findProductBySku('MKR-005')).id);
    await archiveProduct((await findProductBySku('RMH-003')).id);
    expect(await activeSummary()).toEqual({ productCount: 28, totalUnits: 384, stockValue: 3_750_100 });
  });

  it('riwayat pergerakan barang arsip tetap ada', async () => {
    const product = await findProductBySku('SBK-001');
    await archiveProduct(product.id);
    expect(await db.stockMovements.where('productId').equals(product.id).count()).toBe(1);
  });
});
