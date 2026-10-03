import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { cancelSale } from './api/cancel-sale';
import { createSale } from './api/create-sale';
import { getSaleDetail } from './api/get-sale-detail';
import { getSales } from './api/get-sales';
import { returnSaleItems } from './api/return-sale-items';
import { parseSaleFilters } from './sale-filters';
import { saleDisplayStatus } from './sale-status';
import type { CreateSaleInput } from './schema';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);
const YESTERDAY = new Date(2026, 9, 2, 10, 0, 0);

async function item(sku: string, quantity: number, discount = 0) {
  return { productId: (await findProductBySku(sku)).id, quantity, discount };
}

// Transaksi 162000 tanpa diskon: Beras x2, Mi Instan Goreng x3, Air Mineral x1.
async function plainSaleInput(): Promise<CreateSaleInput> {
  return {
    items: [await item('SBK-001', 2), await item('MKR-001', 3), await item('MNM-001', 1)],
    paymentMethod: 'tunai',
    transactionDiscount: 0,
    amountPaid: 200000,
    expectedTotal: 162000,
  };
}

// Transaksi 156000: diskon baris Beras 4000 dan diskon transaksi 2000.
async function discountedSaleInput(): Promise<CreateSaleInput> {
  return {
    ...(await plainSaleInput()),
    items: [await item('SBK-001', 2, 4000), await item('MKR-001', 3), await item('MNM-001', 1)],
    transactionDiscount: 2000,
    expectedTotal: 156000,
  };
}

// Transaksi 68000 via QRIS: Beras x1, diskon baris 4000, diskon transaksi 2000.
async function qrisSaleInput(): Promise<CreateSaleInput> {
  return {
    items: [await item('SBK-001', 1, 4000)],
    paymentMethod: 'qris',
    transactionDiscount: 2000,
    expectedTotal: 68000,
  };
}

async function itemIdOf(saleId: string, sku: string): Promise<string> {
  const detail = await getSaleDetail(saleId);
  const entry = detail?.progress.find((progress) => progress.item.sku === sku);
  if (!entry) throw new Error(`${sku} tidak ada di transaksi`);
  return entry.item.id;
}

async function snapshot() {
  return {
    products: await db.products.toArray(),
    movements: await db.stockMovements.count(),
    counters: await db.counters.toArray(),
    sales: await db.sales.toArray(),
    saleReturns: await db.saleReturns.count(),
  };
}

describe('retur dan pembatalan', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('retur 1 Beras dari transaksi tanpa diskon: refund 74000, stok +1, pergerakan retur, RTR-0001', async () => {
    const sale = await createSale(await plainSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'SBK-001');

    const saleReturn = await returnSaleItems(sale.id, {
      items: [{ saleItemId, quantity: 1 }],
      reason: 'Kemasan sobek',
    });

    expect(saleReturn).toMatchObject({ number: 'RTR-20261003-0001', refundTotal: 74000 });
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(17);
    const movement = await db.stockMovements.filter((row) => row.type === 'retur').first();
    expect(movement).toMatchObject({
      saleId: sale.id,
      quantityBefore: 16,
      quantityAfter: 17,
      reason: `Retur RTR-20261003-0001 (${sale.number}): Kemasan sobek`,
    });
    const updated = await db.sales.get(sale.id);
    expect(updated?.refundedTotal).toBe(74000);
    expect(updated && saleDisplayStatus(updated)).toBe('retur-sebagian');
  });

  it('transaksi berdiskon: retur Beras 1 lalu 1 menghasilkan 71088 dan 71089, total baris 142177', async () => {
    const sale = await createSale(await discountedSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'SBK-001');

    const first = await returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Retur pertama' });
    const second = await returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Retur kedua' });

    expect([first.refundTotal, second.refundTotal]).toEqual([71088, 71089]);
    expect(first.refundTotal + second.refundTotal).toBe(142177);
  });

  it('retur semua baris bertahap: refundedTotal = 156000 dan status diretur-penuh', async () => {
    const sale = await createSale(await discountedSaleInput());
    const beras = await itemIdOf(sale.id, 'SBK-001');
    const mi = await itemIdOf(sale.id, 'MKR-001');
    const air = await itemIdOf(sale.id, 'MNM-001');

    await returnSaleItems(sale.id, { items: [{ saleItemId: beras, quantity: 1 }], reason: 'Retur 1' });
    await returnSaleItems(sale.id, {
      items: [
        { saleItemId: beras, quantity: 1 },
        { saleItemId: mi, quantity: 3 },
      ],
      reason: 'Retur 2',
    });
    await returnSaleItems(sale.id, { items: [{ saleItemId: air, quantity: 1 }], reason: 'Retur 3' });

    const updated = await db.sales.get(sale.id);
    expect(updated?.refundedTotal).toBe(156000);
    expect(updated && saleDisplayStatus(updated)).toBe('diretur-penuh');
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(18);
  });

  it('retur melebihi sisa ditolak tanpa menyimpan apa pun, termasuk penghitung', async () => {
    const sale = await createSale(await plainSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'SBK-001');
    const before = await snapshot();

    await expect(
      returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 3 }], reason: 'Terlalu banyak' }),
    ).rejects.toMatchObject({ code: 'RETURN_EXCEEDS_REMAINING', saleItemId });

    expect(await snapshot()).toEqual(before);
  });

  it('pembatalan setelah retur sebagian hanya mengembalikan sisanya', async () => {
    const sale = await createSale(await plainSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'SBK-001');
    await returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Kemasan sobek' });

    const cancelled = await cancelSale(sale.id, 'Salah input');

    expect(cancelled).toMatchObject({ status: 'dibatalkan', cancelReason: 'Salah input', cancelledBy: 'Pemilik' });
    // Beras: 18 awal - 2 jual + 1 retur + 1 sisa batal = 18; Mi dan Air kembali penuh.
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(18);
    expect((await findProductBySku('MKR-001')).stockQuantity).toBe(60);
    expect((await findProductBySku('MNM-001')).stockQuantity).toBe(48);
    const cancelMovements = await db.stockMovements.filter((row) => row.type === 'batal').toArray();
    expect(cancelMovements.map((row) => row.quantityAfter - row.quantityBefore).sort()).toEqual([1, 1, 3]);
    expect(cancelMovements[0]?.reason).toBe(`Batal ${sale.number}: Salah input`);
  });

  it('batal dua kali dan retur setelah batal ditolak', async () => {
    const sale = await createSale(await plainSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'SBK-001');
    await cancelSale(sale.id, 'Salah input');
    const before = await snapshot();

    await expect(cancelSale(sale.id, 'Sekali lagi')).rejects.toMatchObject({ code: 'ALREADY_CANCELLED' });
    await expect(
      returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Setelah batal' }),
    ).rejects.toMatchObject({ code: 'ALREADY_CANCELLED' });

    expect(await snapshot()).toEqual(before);
  });

  it('alasan kurang dari 3 karakter ditolak dan transaksi tidak ada ditolak', async () => {
    const sale = await createSale(await plainSaleInput());
    await expect(cancelSale(sale.id, 'ab')).rejects.toThrow();
    await expect(cancelSale(crypto.randomUUID(), 'Salah input')).rejects.toMatchObject({
      code: 'SALE_NOT_FOUND',
    });
    expect((await db.sales.get(sale.id))?.status).toBe('selesai');
  });

  it('barang yang sudah dihapus dari database: PRODUCT_NOT_FOUND dan tidak ada yang berubah', async () => {
    const sale = await createSale(await plainSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'MNM-001');
    await db.products.delete((await findProductBySku('MNM-001')).id);
    const before = await snapshot();

    await expect(
      returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Kemasan sobek' }),
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });

    expect(await snapshot()).toEqual(before);
  });

  it('atomisitas retur: penulisan saleReturns gagal, tidak ada yang berubah', async () => {
    const sale = await createSale(await plainSaleInput());
    const saleItemId = await itemIdOf(sale.id, 'SBK-001');
    const before = await snapshot();
    vi.spyOn(db.saleReturns, 'add').mockRejectedValueOnce(new Error('penyimpanan penuh'));

    await expect(
      returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Kemasan sobek' }),
    ).rejects.toThrow('penyimpanan penuh');

    expect(await snapshot()).toEqual(before);
  });

  it('atomisitas batal: penulisan sale gagal, stok dan pergerakan tidak berubah', async () => {
    const sale = await createSale(await plainSaleInput());
    const before = await snapshot();
    vi.spyOn(db.sales, 'put').mockRejectedValueOnce(new Error('penyimpanan penuh'));

    await expect(cancelSale(sale.id, 'Salah input')).rejects.toThrow('penyimpanan penuh');

    expect(await snapshot()).toEqual(before);
  });
});

describe('getSales', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const filters = (query = '') => parseSaleFilters(new URLSearchParams(query));

  it('ringkasan hari ini: retur mengurangi omzet dan pembatalan mengeluarkan transaksi', async () => {
    const cash = await createSale(await plainSaleInput());
    const qris = await createSale(await qrisSaleInput());

    const initial = await getSales(filters(), TODAY);
    expect(initial.summary).toEqual({ count: 2, netRevenue: 230000 });
    expect(initial.items.map((sale) => sale.number)).toEqual([qris.number, cash.number]);

    const saleItemId = await itemIdOf(cash.id, 'SBK-001');
    await returnSaleItems(cash.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Kemasan sobek' });
    expect((await getSales(filters(), TODAY)).summary).toEqual({ count: 2, netRevenue: 156000 });

    await cancelSale(qris.id, 'Salah input');
    const afterCancel = await getSales(filters(), TODAY);
    expect(afterCancel.summary).toEqual({ count: 1, netRevenue: 88000 });
    // Transaksi dibatalkan tetap ada di daftar, tidak terhapus.
    expect(afterCancel.items).toHaveLength(2);
  });

  it('filter metode hanya menampilkan transaksi dengan metode itu', async () => {
    await createSale(await plainSaleInput());
    const qris = await createSale(await qrisSaleInput());

    const result = await getSales(filters('metode=qris'), TODAY);

    expect(result.items.map((sale) => sale.number)).toEqual([qris.number]);
    expect(result.summary).toEqual({ count: 1, netRevenue: 68000 });
  });

  it('transaksi kemarin tidak masuk hari ini tetapi masuk 7 hari terakhir', async () => {
    vi.setSystemTime(YESTERDAY);
    const yesterdaySale = await createSale(await qrisSaleInput());
    vi.setSystemTime(TODAY);
    const todaySale = await createSale(await plainSaleInput());

    const today = await getSales(filters(), TODAY);
    const lastWeek = await getSales(filters('periode=7-hari'), TODAY);
    const yesterday = await getSales(filters('periode=kemarin'), TODAY);

    expect(today.items.map((sale) => sale.number)).toEqual([todaySale.number]);
    expect(yesterday.items.map((sale) => sale.number)).toEqual([yesterdaySale.number]);
    expect(lastWeek.total).toBe(2);
  });

  it('daftar dibagi 50 per halaman, tetapi ringkasan mencakup semua hasil', async () => {
    const base = await createSale(await plainSaleInput());
    const template = await db.sales.get(base.id);
    if (!template) throw new Error('transaksi dasar tidak ada');
    const extra = Array.from({ length: 59 }, (_, index) => ({
      ...template,
      id: crypto.randomUUID(),
      number: `TRX-20261003-${String(index + 2).padStart(4, '0')}`,
      createdAt: new Date(2026, 9, 3, 11, 0, index).toISOString(),
    }));
    await db.sales.bulkAdd(extra);

    const page1 = await getSales(filters(), TODAY);
    const page2 = await getSales(filters('halaman=2'), TODAY);
    const outOfRange = await getSales(filters('halaman=9'), TODAY);

    expect(page1.total).toBe(60);
    expect(page1.items).toHaveLength(50);
    expect(page2.items).toHaveLength(10);
    expect(page1.summary.count).toBe(60);
    expect(outOfRange.page).toBe(1);
  });
});
