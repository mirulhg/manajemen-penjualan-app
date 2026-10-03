import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from './database';

const DB_NAME = 'manajemen-stok';
const PRODUCT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_PRODUCT_ID = '00000000-0000-4000-8000-000000000002';

// Id dibuat sengaja tidak berurutan terhadap createdAt, supaya urutan hasil migrasi terbukti dari aturannya.
const LEGACY_MOVEMENTS = [
  { id: 'c0000000-0000-4000-8000-000000000003', createdAt: '2026-10-02T10:00:00.000Z', productId: PRODUCT_ID, before: 20, after: 25 },
  { id: 'a0000000-0000-4000-8000-000000000001', createdAt: '2026-10-01T09:00:00.000Z', productId: PRODUCT_ID, before: 0, after: 18 },
  { id: 'b0000000-0000-4000-8000-000000000002', createdAt: '2026-10-02T10:00:00.000Z', productId: PRODUCT_ID, before: 18, after: 20 },
  { id: 'd0000000-0000-4000-8000-000000000004', createdAt: '2026-10-01T09:30:00.000Z', productId: OTHER_PRODUCT_ID, before: 0, after: 5 },
];

async function createVersion1Database() {
  db.close();
  await Dexie.delete(DB_NAME);

  const legacy = new Dexie(DB_NAME);
  legacy.version(1).stores({
    products: 'id, &sku, category, updatedAt',
    stockMovements: 'id, productId, [productId+createdAt]',
  });
  const now = '2026-10-01T09:00:00.000Z';
  await legacy.table('products').bulkAdd(
    [PRODUCT_ID, OTHER_PRODUCT_ID].map((id, index) => ({
      id,
      sku: `TES-00${index + 1}`,
      name: `Barang Lama ${index + 1}`,
      category: 'Sembako',
      unit: 'pcs',
      stockQuantity: 25,
      minStock: null,
      purchasePrice: 1000,
      sellingPrice: 1500,
      createdAt: now,
      updatedAt: now,
    })),
  );
  await legacy.table('stockMovements').bulkAdd(
    LEGACY_MOVEMENTS.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      type: 'masuk',
      quantityBefore: movement.before,
      quantityAfter: movement.after,
      reason: 'Data lama',
      actor: 'Pemilik',
      createdAt: movement.createdAt,
    })),
  );
  legacy.close();
}

describe('migrasi database v1 ke v2', () => {
  beforeEach(createVersion1Database);

  it('memberi seq unik 1..N berurut createdAt lalu id, dan mengisi counter', async () => {
    await db.open();

    const movements = await db.stockMovements.orderBy('seq').toArray();
    expect(movements.map((movement) => movement.seq)).toEqual([1, 2, 3, 4]);
    // 1 Okt 09:00, 1 Okt 09:30, lalu dua pergerakan kembar 2 Okt 10:00 diurutkan menurut id (b sebelum c).
    expect(movements.map((movement) => movement.id.charAt(0))).toEqual(['a', 'd', 'b', 'c']);
    expect((await db.counters.get('stockMovement'))?.value).toBe(4);
  });

  it('tidak mengubah jumlah data maupun isi pergerakan yang sudah ada', async () => {
    await db.open();

    expect(await db.products.count()).toBe(2);
    expect(await db.stockMovements.count()).toBe(4);
    const first = await db.stockMovements.get('a0000000-0000-4000-8000-000000000001');
    expect(first).toMatchObject({ quantityBefore: 0, quantityAfter: 18, reason: 'Data lama' });
  });

  it('migrasi ke v3 menambah tabel penjualan kosong tanpa mengubah data lama', async () => {
    await db.open();

    expect(await db.sales.count()).toBe(0);
    expect(await db.saleItems.count()).toBe(0);
    expect(await db.settings.count()).toBe(0);
    expect(await db.products.count()).toBe(2);
    expect(await db.stockMovements.count()).toBe(4);
  });

  it('index [productId+seq] bisa dipakai setelah migrasi', async () => {
    await db.open();

    const ofProduct = await db.stockMovements
      .where('[productId+seq]')
      .between([PRODUCT_ID, Dexie.minKey], [PRODUCT_ID, Dexie.maxKey])
      .reverse()
      .toArray();
    expect(ofProduct.map((movement) => movement.seq)).toEqual([4, 3, 1]);
  });
});

describe('migrasi database v3 ke v4', () => {
  const SALE_ID = '00000000-0000-4000-8000-0000000000aa';

  beforeEach(async () => {
    db.close();
    await Dexie.delete(DB_NAME);
    const legacy = new Dexie(DB_NAME);
    legacy.version(1).stores({
      products: 'id, &sku, category, updatedAt',
      stockMovements: 'id, productId, [productId+createdAt]',
    });
    legacy.version(2).stores({
      stockMovements: 'id, productId, [productId+createdAt], &seq, [productId+seq]',
      counters: 'name',
    });
    legacy.version(3).stores({
      sales: 'id, &number, createdAt',
      saleItems: 'id, saleId, productId',
      settings: 'key',
    });
    await legacy.table('sales').bulkAdd([
      {
        id: SALE_ID,
        number: 'TRX-20261001-0001',
        paymentMethod: 'tunai',
        subtotal: 10000,
        itemDiscountTotal: 0,
        transactionDiscount: 0,
        total: 10000,
        amountPaid: 10000,
        change: 0,
        itemCount: 1,
        actor: 'Pemilik',
        createdAt: '2026-10-01T09:00:00.000Z',
      },
    ]);
    legacy.close();
  });

  it('transaksi lama mendapat status selesai dan refundedTotal 0, jumlah data tetap', async () => {
    await db.open();

    const sale = await db.sales.get(SALE_ID);
    expect(sale).toMatchObject({ status: 'selesai', refundedTotal: 0, total: 10000 });
    expect(await db.sales.count()).toBe(1);
    expect(await db.saleReturns.count()).toBe(0);
  });

  it('index actor tersedia untuk daftar kasir', async () => {
    await db.open();

    expect(await db.sales.orderBy('actor').uniqueKeys()).toEqual(['Pemilik']);
  });
});
