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

describe('migrasi database v4 ke v5', () => {
  const PRODUCT_ID = '00000000-0000-4000-8000-0000000000bb';

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
    legacy.version(4).stores({
      sales: 'id, &number, createdAt, actor',
      saleReturns: 'id, &number, saleId, createdAt',
    });
    await legacy.table('products').bulkAdd([
      {
        id: PRODUCT_ID,
        sku: 'TES-100',
        name: 'Barang Lama',
        category: 'Sembako',
        unit: 'pcs',
        stockQuantity: 7,
        minStock: null,
        purchasePrice: 1000,
        sellingPrice: 1500,
        createdAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-10-01T09:00:00.000Z',
      },
    ]);
    legacy.close();
  });

  it('produk lama mendapat archivedAt null dan jumlah data tidak berubah', async () => {
    await db.open();

    const product = await db.products.get(PRODUCT_ID);
    expect(product).toMatchObject({ archivedAt: null, stockQuantity: 7, name: 'Barang Lama' });
    expect(await db.products.count()).toBe(1);
    expect(await db.priceChanges.count()).toBe(0);
    expect(await db.productPhotos.count()).toBe(0);
  });

  it('index [productId+seq] pada priceChanges dan kunci productId pada foto tersedia', async () => {
    await db.open();

    await db.priceChanges.add({
      id: crypto.randomUUID(),
      seq: 1,
      productId: PRODUCT_ID,
      field: 'sellingPrice',
      before: 1500,
      after: 1600,
      actor: 'Pemilik',
      createdAt: new Date().toISOString(),
    });
    const rows = await db.priceChanges.where('[productId+seq]').equals([PRODUCT_ID, 1]).toArray();
    expect(rows).toHaveLength(1);
  });
});

describe('migrasi database v5 ke v6', () => {
  function legacyProduct(id: string, sku: string, name: string, category: string) {
    return {
      id,
      sku,
      name,
      category,
      unit: 'pcs',
      stockQuantity: 5,
      minStock: null,
      purchasePrice: 1000,
      sellingPrice: 1500,
      createdAt: '2026-10-01T09:00:00.000Z',
      updatedAt: '2026-10-01T09:00:00.000Z',
      archivedAt: null,
    };
  }

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
    legacy.version(4).stores({
      sales: 'id, &number, createdAt, actor',
      saleReturns: 'id, &number, saleId, createdAt',
    });
    legacy.version(5).stores({
      priceChanges: 'id, productId, [productId+seq]',
      productPhotos: 'productId',
    });
    await legacy.table('products').bulkAdd([
      legacyProduct('00000000-0000-4000-8000-000000000001', 'TES-001', 'Beras', 'Sembako'),
      legacyProduct('00000000-0000-4000-8000-000000000002', 'TES-002', 'Gula', 'sembako'),
      legacyProduct('00000000-0000-4000-8000-000000000003', 'TES-003', 'Teh', 'Minuman'),
    ]);
    legacy.close();
  });

  it('membuat satu kategori per nameKey dan menyeragamkan ejaan produk tanpa mengubah updatedAt', async () => {
    await db.open();

    const categories = await db.categories.toArray();
    expect(categories.map((category) => category.name).sort()).toEqual(['Minuman', 'Sembako']);
    expect(new Set(categories.map((category) => category.nameKey)).size).toBe(2);

    const products = await db.products.orderBy('sku').toArray();
    expect(products.map((product) => product.category)).toEqual(['Sembako', 'Sembako', 'Minuman']);
    expect(products.every((product) => product.updatedAt === '2026-10-01T09:00:00.000Z')).toBe(true);
    expect(await db.products.count()).toBe(3);
  });
});

const SALE_ID_ACTIVE = '10000000-0000-4000-8000-000000000001';
const SALE_ID_CANCELLED = '10000000-0000-4000-8000-000000000002';
const SALE_ID_NEXT_DAY = '10000000-0000-4000-8000-000000000003';
const ITEM_A = '20000000-0000-4000-8000-000000000001';
const ITEM_B = '20000000-0000-4000-8000-000000000002';
const ITEM_C = '20000000-0000-4000-8000-000000000003';
const ITEM_D = '20000000-0000-4000-8000-000000000004';
const PRODUCT = '00000000-0000-4000-8000-000000000001';
// Dibuat dari tanggal lokal supaya hasilnya tidak bergantung zona waktu mesin yang menjalankan test.
const DAY_1_NOON = new Date(2026, 9, 1, 12, 0).toISOString();
const DAY_2_NOON = new Date(2026, 9, 2, 12, 0).toISOString();

function legacySale(id: string, number: string, total: number, createdAt: string, extra: object = {}) {
  return {
    id,
    number,
    paymentMethod: 'tunai',
    subtotal: total,
    itemDiscountTotal: 0,
    transactionDiscount: 0,
    total,
    amountPaid: total,
    change: 0,
    itemCount: 1,
    actor: 'Pemilik',
    createdAt,
    status: 'selesai',
    refundedTotal: 0,
    ...extra,
  };
}

function legacyItem(id: string, saleId: string, quantity: number, unitPrice: number, unitCost: number) {
  return {
    id,
    saleId,
    productId: PRODUCT,
    productName: 'Barang Lama',
    sku: 'TES-001',
    unit: 'pcs',
    quantity,
    unitPrice,
    unitCost,
    discount: 0,
  };
}

describe('migrasi database v6 ke v7', () => {
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
    legacy.version(4).stores({
      sales: 'id, &number, createdAt, actor',
      saleReturns: 'id, &number, saleId, createdAt',
    });
    legacy.version(5).stores({
      priceChanges: 'id, productId, [productId+seq]',
      productPhotos: 'productId',
    });
    legacy.version(6).stores({ categories: 'id, &nameKey' });

    await legacy.table('sales').bulkAdd([
      // 10000 dengan retur 1 dari 2 unit barang A (3000): HPP sisa = 2000 x 1 + 2500 x 1.
      legacySale(SALE_ID_ACTIVE, 'TRX-20261001-0001', 10_000, DAY_1_NOON, { refundedTotal: 3_000 }),
      legacySale(SALE_ID_CANCELLED, 'TRX-20261001-0002', 5_000, DAY_1_NOON, { status: 'dibatalkan' }),
      legacySale(SALE_ID_NEXT_DAY, 'TRX-20261002-0001', 7_000, DAY_2_NOON),
    ]);
    await legacy.table('saleItems').bulkAdd([
      legacyItem(ITEM_A, SALE_ID_ACTIVE, 2, 3_000, 2_000),
      legacyItem(ITEM_B, SALE_ID_ACTIVE, 1, 4_000, 2_500),
      legacyItem(ITEM_C, SALE_ID_CANCELLED, 1, 5_000, 3_000),
      legacyItem(ITEM_D, SALE_ID_NEXT_DAY, 1, 7_000, 5_000),
    ]);
    await legacy.table('saleReturns').add({
      id: '30000000-0000-4000-8000-000000000001',
      number: 'RTR-20261001-0001',
      saleId: SALE_ID_ACTIVE,
      items: [{ saleItemId: ITEM_A, quantity: 1, refundAmount: 3_000 }],
      refundTotal: 3_000,
      reason: 'Kemasan sobek',
      actor: 'Pemilik',
      createdAt: DAY_2_NOON,
    });
    legacy.close();
  });

  it('membangun dailySales dari penjualan, retur, dan pembatalan lama tanpa mengubah data lain', async () => {
    await db.open();

    expect(await db.dailySales.orderBy('date').toArray()).toEqual([
      { date: '2026-10-01', transactionCount: 1, grossTotal: 10_000, refundedTotal: 3_000, cogs: 4_500 },
      { date: '2026-10-02', transactionCount: 1, grossTotal: 7_000, refundedTotal: 0, cogs: 5_000 },
    ]);
    expect(await db.sales.count()).toBe(3);
    expect(await db.saleItems.count()).toBe(4);
    expect(await db.saleReturns.count()).toBe(1);
  });
});

describe('migrasi database v7 ke v8', () => {
  const RETURN_ID = '30000000-0000-4000-8000-000000000001';

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
    legacy.version(4).stores({
      sales: 'id, &number, createdAt, actor',
      saleReturns: 'id, &number, saleId, createdAt',
    });
    legacy.version(5).stores({
      priceChanges: 'id, productId, [productId+seq]',
      productPhotos: 'productId',
    });
    legacy.version(6).stores({ categories: 'id, &nameKey' });
    legacy.version(7).stores({ dailySales: 'date' });

    await legacy.table('sales').bulkAdd([
      legacySale(SALE_ID_ACTIVE, 'TRX-20261001-0001', 10_000, DAY_1_NOON, { refundedTotal: 3_000 }),
      legacySale(SALE_ID_CANCELLED, 'TRX-20261001-0002', 5_000, DAY_1_NOON, { status: 'dibatalkan' }),
      legacySale(SALE_ID_NEXT_DAY, 'TRX-20261002-0001', 7_000, DAY_2_NOON),
    ]);
    await legacy.table('saleItems').bulkAdd([
      legacyItem(ITEM_A, SALE_ID_ACTIVE, 2, 3_000, 2_000),
      legacyItem(ITEM_B, SALE_ID_ACTIVE, 1, 4_000, 2_500),
      legacyItem(ITEM_C, SALE_ID_CANCELLED, 1, 5_000, 3_000),
      legacyItem(ITEM_D, SALE_ID_NEXT_DAY, 1, 7_000, 5_000),
    ]);
    await legacy.table('saleReturns').add({
      id: RETURN_ID,
      number: 'RTR-20261001-0001',
      saleId: SALE_ID_ACTIVE,
      items: [{ saleItemId: ITEM_A, quantity: 1, refundAmount: 3_000 }],
      refundTotal: 3_000,
      reason: 'Kemasan sobek',
      actor: 'Pemilik',
      createdAt: DAY_2_NOON,
    });
    const existingDaily = [
      { date: '2026-10-01', transactionCount: 1, grossTotal: 10_000, refundedTotal: 3_000, cogs: 4_500 },
      { date: '2026-10-02', transactionCount: 1, grossTotal: 7_000, refundedTotal: 0, cogs: 5_000 },
    ];
    await legacy.table('dailySales').bulkAdd(existingDaily);
    legacy.close();
  });

  it('membangun dailyProductSales dari penjualan, retur, dan pembatalan lama; transaksi batal tidak ikut', async () => {
    await db.open();

    expect(await db.dailyProductSales.orderBy('[date+productId]').toArray()).toEqual([
      { date: '2026-10-01', productId: PRODUCT, quantity: 2, revenue: 7_000, cogs: 4_500 },
      { date: '2026-10-02', productId: PRODUCT, quantity: 1, revenue: 7_000, cogs: 5_000 },
    ]);
  });

  it('tidak mengubah data lain, dan Σ revenue per tanggal = omzet di dailySales', async () => {
    await db.open();

    expect(await db.sales.count()).toBe(3);
    expect(await db.saleItems.count()).toBe(4);
    expect(await db.saleReturns.count()).toBe(1);
    const daily = await db.dailySales.orderBy('date').toArray();
    expect(daily).toHaveLength(2);
    for (const day of daily) {
      const products = await db.dailyProductSales.where('[date+productId]').between([day.date, ''], [day.date, '￿']).toArray();
      expect(products.reduce((sum, row) => sum + row.revenue, 0)).toBe(day.grossTotal - day.refundedTotal);
      expect(products.reduce((sum, row) => sum + row.cogs, 0)).toBe(day.cogs);
    }
  });

  it('index [productId+date] tersedia untuk mencari terakhir terjual', async () => {
    await db.open();

    const last = await db.dailyProductSales
      .where('[productId+date]')
      .between([PRODUCT, ''], [PRODUCT, '￿'])
      .last();
    expect(last?.date).toBe('2026-10-02');
  });
});

describe('migrasi database v8 ke v9', () => {
  function legacyProduct(id: string, sku: string, stockQuantity: number, minStock: number | null, archivedAt: string | null = null) {
    return {
      id,
      sku,
      name: `Barang ${sku}`,
      category: 'Sembako',
      unit: 'pcs',
      stockQuantity,
      minStock,
      purchasePrice: 1000,
      sellingPrice: 1500,
      createdAt: '2026-10-01T09:00:00.000Z',
      updatedAt: '2026-10-01T09:00:00.000Z',
      archivedAt,
    };
  }

  const AMAN = '00000000-0000-4000-8000-0000000000a1';
  const MENIPIS = '00000000-0000-4000-8000-0000000000a2';
  const HABIS = '00000000-0000-4000-8000-0000000000a3';
  const MENIPIS_DEFAULT = '00000000-0000-4000-8000-0000000000a4';
  const ARSIP = '00000000-0000-4000-8000-0000000000a5';

  async function createV8Database(defaultMinStock?: number) {
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
    legacy.version(3).stores({ sales: 'id, &number, createdAt', saleItems: 'id, saleId, productId', settings: 'key' });
    legacy.version(4).stores({
      sales: 'id, &number, createdAt, actor',
      saleReturns: 'id, &number, saleId, createdAt',
    });
    legacy.version(5).stores({ priceChanges: 'id, productId, [productId+seq]', productPhotos: 'productId' });
    legacy.version(6).stores({ categories: 'id, &nameKey' });
    legacy.version(7).stores({ dailySales: 'date' });
    legacy.version(8).stores({ dailyProductSales: '[date+productId], [productId+date]' });
    await legacy.table('products').bulkAdd([
      legacyProduct(AMAN, 'AMN-1', 30, 5),
      legacyProduct(MENIPIS, 'MNP-1', 4, 5),
      legacyProduct(HABIS, 'HBS-1', 0, null),
      legacyProduct(MENIPIS_DEFAULT, 'MND-1', 5, null),
      // Diarsipkan: tidak mendapat peringatan walau stoknya habis.
      legacyProduct(ARSIP, 'ARS-1', 0, 5, '2026-10-02T09:00:00.000Z'),
    ]);
    if (defaultMinStock !== undefined) {
      await legacy.table('settings').put({ key: 'defaultMinStock', value: defaultMinStock });
    }
    legacy.close();
  }

  it('membuka peringatan belum dibaca untuk barang yang kini menipis atau habis; yang aman dan arsip tidak', async () => {
    await createV8Database();
    await db.open();

    const alerts = await db.stockAlerts.toArray();
    expect(alerts.map((alert) => [alert.productId, alert.level]).sort()).toEqual(
      [
        [MENIPIS, 'menipis'],
        [HABIS, 'habis'],
        [MENIPIS_DEFAULT, 'menipis'],
      ].sort(),
    );
    expect(alerts.every((alert) => alert.readAt === null && alert.resolvedAt === null && alert.isOpen === 1)).toBe(true);
  });

  it('memakai batas default dari pengaturan yang sudah ada, dan tidak mengubah data lain', async () => {
    await createV8Database(3);
    await db.open();

    // Dengan batas default 3: MND-1 (stok 5, tanpa batas sendiri) aman.
    expect((await db.stockAlerts.toArray()).map((alert) => alert.productId).sort()).toEqual([MENIPIS, HABIS].sort());
    expect(await db.products.count()).toBe(5);
  });

  it('index peringatan terbuka tersedia', async () => {
    await createV8Database();
    await db.open();

    expect(await db.stockAlerts.where('isOpen').equals(1).count()).toBe(3);
    expect(await db.stockAlerts.where('[productId+isOpen]').equals([HABIS, 1]).count()).toBe(1);
  });
});
