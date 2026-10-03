import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { adjustStock, StockAdjustmentError } from './api/adjust-stock';
import { getProduct } from './api/get-product';
import { seedSampleProducts } from './seed';
import { getStockStatus } from './stock-status';
import type { Product } from './schema';

async function findBySku(sku: string): Promise<Product> {
  const product = await db.products.where('sku').equals(sku).first();
  if (!product) throw new Error(`Seed tidak memuat ${sku}`);
  return product;
}

async function statusOf(sku: string) {
  const product = await findBySku(sku);
  return getStockStatus(product.stockQuantity, product.minStock);
}

describe('adjustStock', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await seedSampleProducts();
  });

  it('stok masuk menambah stok dan mencatat satu pergerakan', async () => {
    const product = await findBySku('SBK-001');

    const updated = await adjustStock(product.id, {
      type: 'masuk',
      quantity: '7',
      reason: '  Kiriman supplier  ',
    });

    expect(updated.stockQuantity).toBe(25);
    expect(await db.stockMovements.count()).toBe(31);
    const movement = await db.stockMovements
      .where('productId')
      .equals(product.id)
      .filter((row) => row.type === 'masuk')
      .first();
    expect(movement).toMatchObject({
      quantityBefore: 18,
      quantityAfter: 25,
      actor: 'Pemilik',
      reason: 'Kiriman supplier',
    });
  });

  it('koreksi memakai hasil hitung fisik dan mengubah status menipis menjadi aman', async () => {
    const product = await findBySku('MNM-003');
    expect(await statusOf('MNM-003')).toBe('menipis');

    await adjustStock(product.id, { type: 'koreksi', quantity: '9', reason: 'Hasil stock opname' });

    expect((await findBySku('MNM-003')).stockQuantity).toBe(9);
    expect(await statusOf('MNM-003')).toBe('aman');
  });

  it('koreksi ke 0 mengubah status menjadi habis', async () => {
    const product = await findBySku('SBK-003');

    await adjustStock(product.id, { type: 'koreksi', quantity: '0', reason: 'Hasil stock opname' });

    expect(await statusOf('SBK-003')).toBe('habis');
  });

  it('koreksi ke angka yang sama ditolak tanpa menyimpan apa pun', async () => {
    const product = await findBySku('MND-003');

    await expect(
      adjustStock(product.id, { type: 'koreksi', quantity: '0', reason: 'Hasil stock opname' }),
    ).rejects.toMatchObject({ code: 'NO_CHANGE', currentQuantity: 0 });

    expect(await db.products.count()).toBe(30);
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('produk yang tidak ada menghasilkan PRODUCT_NOT_FOUND', async () => {
    const promise = adjustStock(crypto.randomUUID(), {
      type: 'masuk',
      quantity: '1',
      reason: 'Kiriman supplier',
    });

    await expect(promise).rejects.toBeInstanceOf(StockAdjustmentError);
    await expect(promise).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
    expect(await db.stockMovements.count()).toBe(30);
  });

  it.each([
    ['masuk 0', { type: 'masuk', quantity: '0', reason: 'Kiriman supplier' }],
    ['desimal', { type: 'masuk', quantity: '2,5', reason: 'Kiriman supplier' }],
    ['negatif', { type: 'koreksi', quantity: '-3', reason: 'Hasil stock opname' }],
    ['huruf', { type: 'masuk', quantity: 'abc', reason: 'Kiriman supplier' }],
    ['terlalu besar', { type: 'masuk', quantity: '100001', reason: 'Kiriman supplier' }],
    ['alasan pendek', { type: 'masuk', quantity: '5', reason: 'ab' }],
    ['alasan spasi', { type: 'masuk', quantity: '5', reason: '   ' }],
  ] as const)('input tidak valid (%s) ditolak dan tidak menyimpan apa pun', async (_label, input) => {
    const product = await findBySku('SBK-001');

    await expect(adjustStock(product.id, input)).rejects.toThrow();

    expect((await findBySku('SBK-001')).stockQuantity).toBe(18);
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('memperbarui updatedAt produk', async () => {
    const OLD_TIMESTAMP = '2020-01-01T00:00:00.000Z';
    const before = await findBySku('SBK-001');
    await db.products.update(before.id, { updatedAt: OLD_TIMESTAMP });

    const updated = await adjustStock(before.id, {
      type: 'masuk',
      quantity: '1',
      reason: 'Kiriman supplier',
    });

    expect(updated.updatedAt).not.toBe(OLD_TIMESTAMP);
    expect((await findBySku('SBK-001')).updatedAt).toBe(updated.updatedAt);
  });
});

describe('adjustStock: konsistensi data', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await seedSampleProducts();
  });

  it('membatalkan perubahan stok bila pencatatan pergerakan gagal', async () => {
    const product = await findBySku('SBK-001');
    const addSpy = vi
      .spyOn(db.stockMovements, 'add')
      .mockRejectedValueOnce(new Error('penyimpanan penuh'));

    try {
      await expect(
        adjustStock(product.id, { type: 'masuk', quantity: '7', reason: 'Kiriman supplier' }),
      ).rejects.toThrow('penyimpanan penuh');
    } finally {
      addSpy.mockRestore();
    }

    expect((await findBySku('SBK-001')).stockQuantity).toBe(18);
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('dua penyesuaian bersamaan terjumlah dan rantai before/after-nya bersambung', async () => {
    const product = await findBySku('SBK-001');

    await Promise.all([
      adjustStock(product.id, { type: 'masuk', quantity: '5', reason: 'Kiriman pertama' }),
      adjustStock(product.id, { type: 'masuk', quantity: '3', reason: 'Kiriman kedua' }),
    ]);

    expect((await findBySku('SBK-001')).stockQuantity).toBe(26);
    // Diurutkan menurut quantityBefore, bukan createdAt: dua transaksi beruntun bisa berbagi milidetik yang sama.
    const added = await db.stockMovements
      .where('productId')
      .equals(product.id)
      .filter((movement) => movement.type === 'masuk')
      .sortBy('quantityBefore');
    expect(added).toHaveLength(2);
    const [first, second] = added;
    expect(first?.quantityBefore).toBe(18);
    expect(first?.quantityAfter).toBe(second?.quantityBefore);
    expect(second?.quantityAfter).toBe(26);
  });

  it('menipis turun dari 8 menjadi 7 setelah Teh Celup dikoreksi ke 9', async () => {
    const countMenipis = async () =>
      (await db.products.toArray()).filter(
        (item) => getStockStatus(item.stockQuantity, item.minStock) === 'menipis',
      ).length;
    expect(await countMenipis()).toBe(8);

    const product = await findBySku('MNM-003');
    await adjustStock(product.id, { type: 'koreksi', quantity: '9', reason: 'Hasil stock opname' });

    expect(await countMenipis()).toBe(7);
  });
});

describe('getProduct', () => {
  it('id yang bukan uuid dianggap tidak ditemukan', async () => {
    expect(await getProduct('ngawur')).toBeNull();
  });
});
