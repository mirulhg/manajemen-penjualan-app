import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { stockMovementSchema } from '../../lib/db/records';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { getStockStatus } from '../stock';
import { createSale, CreateSaleError } from './api/create-sale';
import type { CreateSaleInput } from './schema';

const DAY_ONE = new Date(2026, 9, 3, 10, 0, 0);
const DAY_TWO = new Date(2026, 9, 4, 10, 0, 0);

async function item(sku: string, quantity: number, discount = 0) {
  return { productId: (await findProductBySku(sku)).id, quantity, discount };
}

async function threeItemSale(overrides: Partial<CreateSaleInput> = {}): Promise<CreateSaleInput> {
  return {
    items: [await item('SBK-001', 2), await item('MKR-001', 3), await item('MNM-001', 1)],
    paymentMethod: 'tunai',
    transactionDiscount: 0,
    amountPaid: 200000,
    expectedTotal: 162000,
    ...overrides,
  };
}

async function snapshot() {
  return {
    products: await db.products.toArray(),
    movements: await db.stockMovements.count(),
    counters: await db.counters.toArray(),
    sales: await db.sales.count(),
    saleItems: await db.saleItems.count(),
  };
}

describe('createSale', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(DAY_ONE);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('tunai: total, kembalian, nomor, stok, pergerakan, dan salinan harga tersimpan', async () => {
    const sale = await createSale(await threeItemSale());

    expect(sale).toMatchObject({
      number: 'TRX-20261003-0001',
      subtotal: 162000,
      total: 162000,
      amountPaid: 200000,
      change: 38000,
      itemCount: 6,
      paymentMethod: 'tunai',
    });
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(16);
    expect((await findProductBySku('MKR-001')).stockQuantity).toBe(57);
    expect((await findProductBySku('MNM-001')).stockQuantity).toBe(47);

    const movements = await db.stockMovements.filter((movement) => movement.type === 'jual').sortBy('seq');
    expect(movements).toHaveLength(3);
    expect(new Set(movements.map((movement) => movement.saleId))).toEqual(new Set([sale.id]));
    expect(movements.map((movement) => movement.seq)).toEqual([31, 32, 33]);
    expect(movements[0]?.reason).toBe('Penjualan TRX-20261003-0001');

    const items = await db.saleItems.where('saleId').equals(sale.id).toArray();
    const bySku = new Map(items.map((saleItem) => [saleItem.sku, saleItem]));
    expect(bySku.get('SBK-001')).toMatchObject({ unitPrice: 74000, unitCost: 68000, quantity: 2 });
    expect(bySku.get('MKR-001')).toMatchObject({ unitPrice: 3500, unitCost: 2800 });
    expect(bySku.get('MNM-001')).toMatchObject({ unitPrice: 3500, unitCost: 2500 });
  });

  it('transaksi kedua di hari sama bernomor 0002, ganti hari kembali ke 0001', async () => {
    const first = await createSale(await threeItemSale());
    const second = await createSale(await threeItemSale());
    vi.setSystemTime(DAY_TWO);
    const nextDay = await createSale(await threeItemSale());

    expect([first.number, second.number, nextDay.number]).toEqual([
      'TRX-20261003-0001',
      'TRX-20261003-0002',
      'TRX-20261004-0001',
    ]);
  });

  it('diskon baris dan diskon transaksi mengurangi total', async () => {
    const sale = await createSale(
      await threeItemSale({
        items: [await item('SBK-001', 2, 4000), await item('MKR-001', 3), await item('MNM-001', 1)],
        transactionDiscount: 2000,
        expectedTotal: 156000,
      }),
    );
    expect(sale).toMatchObject({ total: 156000, itemDiscountTotal: 4000, transactionDiscount: 2000 });
  });

  it('diskon baris melebihi subtotal barisnya ditolak tanpa menyimpan apa pun', async () => {
    const before = await snapshot();

    await expect(
      createSale(
        await threeItemSale({
          items: [await item('MNM-001', 1, 4000)],
          expectedTotal: 0,
          paymentMethod: 'transfer',
        }),
      ),
    ).rejects.toMatchObject({ code: 'INVALID_DISCOUNT' });

    expect(await snapshot()).toEqual(before);
  });

  it('transfer dicatat pas tanpa kembalian', async () => {
    const sale = await createSale(
      await threeItemSale({ paymentMethod: 'transfer', amountPaid: undefined }),
    );
    expect(sale).toMatchObject({ amountPaid: 162000, change: 0, paymentMethod: 'transfer' });
  });

  it('tunai kurang dari total ditolak sebagai INSUFFICIENT_PAYMENT', async () => {
    const before = await snapshot();

    await expect(createSale(await threeItemSale({ amountPaid: 150000 }))).rejects.toMatchObject({
      code: 'INSUFFICIENT_PAYMENT',
    });

    expect(await snapshot()).toEqual(before);
  });

  it('stok 0 ditolak saat allowOversell false, termasuk penghitung nomor', async () => {
    const before = await snapshot();

    const failure = await createSale({
      items: [await item('SBK-005', 1)],
      paymentMethod: 'transfer',
      transactionDiscount: 0,
      expectedTotal: 30000,
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(CreateSaleError);
    expect(failure).toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      shortages: [{ productName: 'Telur Ayam 1 kg', available: 0, requested: 1 }],
    });
    expect(await snapshot()).toEqual(before);
    expect(await db.counters.get('sale:20261003')).toBeUndefined();
  });

  it('stok 0 boleh dijual saat allowOversell true: stok menjadi -1 dan berstatus habis', async () => {
    await db.settings.put({ key: 'allowOversell', value: true });

    await createSale({
      items: [await item('SBK-005', 1)],
      paymentMethod: 'transfer',
      transactionDiscount: 0,
      expectedTotal: 30000,
    });

    const product = await findProductBySku('SBK-005');
    expect(product.stockQuantity).toBe(-1);
    expect(getStockStatus(product.stockQuantity, product.minStock, 5)).toBe('habis');
    const movement = await db.stockMovements
      .where('productId')
      .equals(product.id)
      .filter((row) => row.type === 'jual')
      .first();
    expect(movement).toMatchObject({ type: 'jual', quantityBefore: 0, quantityAfter: -1 });
  });

  it('harga berubah setelah kasir melihat total: TOTAL_CHANGED dan tidak ada yang tersimpan', async () => {
    const input = await threeItemSale();
    const beras = await findProductBySku('SBK-001');
    await db.products.update(beras.id, { sellingPrice: 76000 });
    const before = await snapshot();

    await expect(createSale(input)).rejects.toMatchObject({ code: 'TOTAL_CHANGED' });

    expect(await snapshot()).toEqual(before);
  });

  it('atomisitas: saleItems gagal ditulis, stok, pergerakan, counter, dan sales tidak berubah', async () => {
    const input = await threeItemSale();
    const before = await snapshot();
    vi.spyOn(db.saleItems, 'bulkAdd').mockRejectedValueOnce(new Error('penyimpanan penuh'));

    await expect(createSale(input)).rejects.toThrow('penyimpanan penuh');

    expect(await snapshot()).toEqual(before);
  });

  it('dua transaksi bersamaan: nomor 0001 dan 0002, stok akhir benar', async () => {
    const single = async () => ({
      items: [await item('SBK-001', 1)],
      paymentMethod: 'transfer' as const,
      transactionDiscount: 0,
      expectedTotal: 74000,
    });

    const [a, b] = await Promise.all([createSale(await single()), createSale(await single())]);

    expect(new Set([a.number, b.number])).toEqual(new Set(['TRX-20261003-0001', 'TRX-20261003-0002']));
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(16);
    expect(await db.sales.count()).toBe(2);
  });

  it('pergerakan lama tanpa saleId tetap lolos skema', () => {
    const legacy = {
      id: crypto.randomUUID(),
      seq: 1,
      productId: crypto.randomUUID(),
      type: 'awal',
      quantityBefore: 0,
      quantityAfter: 18,
      reason: 'Stok awal',
      actor: 'Pemilik',
      createdAt: new Date().toISOString(),
    };
    expect(stockMovementSchema.safeParse(legacy).success).toBe(true);
  });
});
