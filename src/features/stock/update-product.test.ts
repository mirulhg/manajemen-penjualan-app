import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { getPriceChanges, PRICE_CHANGES_PAGE_SIZE } from './api/get-price-changes';
import { updateProduct } from './api/update-product';
import type { ProductFieldsInput } from './schema';

const BERAS_UNCHANGED: ProductFieldsInput = {
  name: 'Beras Premium 5 kg',
  sku: 'SBK-001',
  category: 'Sembako',
  unit: 'sak',
  minStock: '5',
  purchasePrice: '68.000',
  sellingPrice: '74.000',
};

function edit(overrides: Partial<ProductFieldsInput>): ProductFieldsInput {
  return { ...BERAS_UNCHANGED, ...overrides };
}

describe('updateProduct', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mengubah harga jual dan beli: dua baris riwayat berurutan, stok tetap, updatedAt berubah', async () => {
    const before = await findProductBySku('SBK-001');
    vi.setSystemTime(new Date(Date.now() + 60_000));

    const updated = await updateProduct(
      before.id,
      edit({ sellingPrice: '75.000', purchasePrice: '69.000' }),
    );

    expect(updated).toMatchObject({ sellingPrice: 75000, purchasePrice: 69000, stockQuantity: 18 });
    expect(updated.updatedAt > before.updatedAt).toBe(true);
    const changes = await db.priceChanges.where('productId').equals(before.id).sortBy('seq');
    expect(changes).toHaveLength(2);
    expect(changes.map((change) => change.seq)).toEqual([1, 2]);
    expect(changes.map((change) => [change.field, change.before, change.after])).toEqual([
      ['purchasePrice', 68000, 69000],
      ['sellingPrice', 74000, 75000],
    ]);
    expect(changes[0]?.actor).toBe('Pemilik');
  });

  it('tanpa perubahan: NO_CHANGE, tidak ada riwayat dan updatedAt tidak berubah', async () => {
    const before = await findProductBySku('SBK-001');

    await expect(updateProduct(before.id, BERAS_UNCHANGED)).rejects.toMatchObject({ code: 'NO_CHANGE' });

    expect(await db.priceChanges.count()).toBe(0);
    expect((await findProductBySku('SBK-001')).updatedAt).toBe(before.updatedAt);
  });

  it('SKU milik barang lain ditolak dengan nama pemiliknya', async () => {
    const before = await findProductBySku('SBK-001');

    await expect(updateProduct(before.id, edit({ sku: 'mkr-001' }))).rejects.toMatchObject({
      code: 'DUPLICATE_SKU',
      ownerName: 'Mi Instan Goreng',
      message: 'SKU MKR-001 sudah dipakai oleh Mi Instan Goreng.',
    });
    expect((await findProductBySku('SBK-001')).sku).toBe('SBK-001');
  });

  it('memakai SKU miliknya sendiri (huruf kecil) bukan duplikat', async () => {
    const before = await findProductBySku('SBK-001');
    const updated = await updateProduct(before.id, edit({ sku: ' sbk-001 ', name: 'Beras Premium 5 kg Baru' }));
    expect(updated).toMatchObject({ sku: 'SBK-001', name: 'Beras Premium 5 kg Baru' });
  });

  it('kategori dan satuan diseragamkan dengan ejaan yang sudah ada', async () => {
    const before = await findProductBySku('SBK-001');

    const updated = await updateProduct(before.id, edit({ category: 'sembako', unit: 'SAK', name: 'Beras Baru' }));

    expect(updated).toMatchObject({ category: 'Sembako', unit: 'sak' });
    expect(await db.categories.count()).toBe(6);
  });

  it('mengubah selain harga tidak menambah riwayat harga', async () => {
    const before = await findProductBySku('SBK-001');

    await updateProduct(before.id, edit({ name: 'Beras Super 5 kg', minStock: '' }));

    expect(await db.priceChanges.count()).toBe(0);
    expect(await findProductBySku('SBK-001')).toMatchObject({ name: 'Beras Super 5 kg', minStock: null });
  });

  it('barang yang tidak ada: PRODUCT_NOT_FOUND', async () => {
    await expect(updateProduct(crypto.randomUUID(), BERAS_UNCHANGED)).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
    });
  });

  it('input tidak valid ditolak tanpa menyimpan apa pun', async () => {
    const before = await findProductBySku('SBK-001');
    await expect(updateProduct(before.id, edit({ sellingPrice: '12,5' }))).rejects.toThrow();
    await expect(updateProduct(before.id, edit({ name: 'A' }))).rejects.toThrow();
    expect(await db.priceChanges.count()).toBe(0);
  });
});

describe('getPriceChanges', () => {
  beforeEach(resetDatabaseWithSeed);

  it('25 perubahan: halaman 1 berisi 20 dengan yang terbaru di atas, halaman 2 berisi 5', async () => {
    const product = await findProductBySku('SBK-001');
    await db.priceChanges.bulkAdd(
      Array.from({ length: 25 }, (_, index) => ({
        id: crypto.randomUUID(),
        seq: index + 1,
        productId: product.id,
        field: 'sellingPrice' as const,
        before: 1000 + index,
        after: 1001 + index,
        actor: 'Pemilik',
        createdAt: new Date(Date.UTC(2026, 9, 3, 0, 0, index)).toISOString(),
      })),
    );

    const first = await getPriceChanges(product.id, 1);
    const second = await getPriceChanges(product.id, 2);

    expect(first.total).toBe(25);
    expect(first.items).toHaveLength(PRICE_CHANGES_PAGE_SIZE);
    expect(first.items[0]?.seq).toBe(25);
    expect(second.items).toHaveLength(5);
    expect(second.items.at(-1)?.seq).toBe(1);
    expect((await getPriceChanges(product.id, 9)).page).toBe(1);
  });

  it('barang tanpa perubahan harga: total 0', async () => {
    const product = await findProductBySku('SBK-002');
    expect((await getPriceChanges(product.id, 1)).total).toBe(0);
  });
});
