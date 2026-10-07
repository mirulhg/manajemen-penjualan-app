// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db/database';
import { getSaleDateKey } from '../../lib/db/daily-sales-rows';
import { getStockStatus } from '../../lib/db/stock-status';
import { setupPin } from '../session';
import { clearDemoData } from './clear-demo-data';
import { DEMO_PRODUCTS } from './demo-products';
import { DEMO_TABLES } from './demo-tables';
import { loadDemoData } from './load-demo-data';
import { getNetSoldQuantities, planDemoSales } from './plan-demo-sales';

const TODAY = new Date(2026, 9, 7, 12, 0, 0);
const DEFAULT_MIN_STOCK = 5;
// Dua kali memuat plus hash PIN (PBKDF2) bisa melewati 5 detik saat seluruh suite berjalan paralel.
const SLOW_TEST_TIMEOUT_MS = 30_000;

async function emptyDatabase() {
  await Promise.all(DEMO_TABLES.map((table) => table.clear()));
}

describe('data contoh', () => {
  beforeEach(emptyDatabase);

  it('rencana transaksi deterministik: dua kali dibuat hasilnya sama persis', () => {
    expect(planDemoSales()).toEqual(planDemoSales());
  });

  it('memuat 20 barang di 5 kategori dan seluruh transaksi 60 hari, termasuk batal dan retur', async () => {
    const plan = planDemoSales();
    await loadDemoData(TODAY);

    expect(await db.products.count()).toBe(20);
    expect(await db.categories.count()).toBe(5);
    expect(await db.sales.count()).toBe(plan.length);
    const cancelled = await db.sales.where('createdAt').above('').filter((sale) => sale.status === 'dibatalkan').count();
    expect(cancelled).toBe(plan.filter((sale) => sale.outcome.type === 'cancel').length);
    expect(cancelled).toBeGreaterThan(0);
    expect(await db.saleReturns.count()).toBe(plan.filter((sale) => sale.outcome.type === 'return').length);
    expect(await db.saleReturns.count()).toBeGreaterThan(0);
    expect((await db.settings.get('isDemo'))?.value).toBe(true);
  });

  it('transaksi pertama 60 hari lalu dan terakhir kemarin; hari ini kosong', async () => {
    await loadDemoData(TODAY);

    const dates = (await db.sales.toArray()).map((sale) => getSaleDateKey(sale.createdAt)).sort();
    expect(dates[0]).toBe('2026-08-08');
    expect(dates[dates.length - 1]).toBe('2026-10-06');
  });

  it('stok akhir sama dengan yang dirancang; beberapa barang menipis atau habis dan punya peringatan', async () => {
    await loadDemoData(TODAY);

    const products = await db.products.toArray();
    for (const demo of DEMO_PRODUCTS) {
      expect(products.find((product) => product.sku === demo.sku)?.stockQuantity, demo.sku).toBe(demo.finalStock);
    }
    const lowCount = products.filter((product) => getStockStatus(product.stockQuantity, product.minStock, DEFAULT_MIN_STOCK) !== 'aman').length;
    expect(lowCount).toBeGreaterThanOrEqual(5);
    expect(await db.stockAlerts.count()).toBe(lowCount);
  });

  it('rekap harian sama dengan hitung ulang dari transaksi; omzet = Σ(total − retur) transaksi tidak batal', async () => {
    await loadDemoData(TODAY);

    const sales = (await db.sales.toArray()).filter((sale) => sale.status !== 'dibatalkan');
    const expected = new Map<string, { count: number; gross: number; refunded: number }>();
    for (const sale of sales) {
      const key = getSaleDateKey(sale.createdAt);
      const current = expected.get(key) ?? { count: 0, gross: 0, refunded: 0 };
      expected.set(key, { count: current.count + 1, gross: current.gross + sale.total, refunded: current.refunded + sale.refundedTotal });
    }
    const recap = await db.dailySales.toArray();

    expect(recap).toHaveLength(expected.size);
    for (const row of recap) {
      expect([row.transactionCount, row.grossTotal, row.refundedTotal], row.date).toEqual([
        expected.get(row.date)?.count,
        expected.get(row.date)?.gross,
        expected.get(row.date)?.refunded,
      ]);
    }
    const revenue = sales.reduce((sum, sale) => sum + sale.total - sale.refundedTotal, 0);
    expect(recap.reduce((sum, row) => sum + row.grossTotal - row.refundedTotal, 0)).toBe(revenue);
    expect(revenue).toBeGreaterThan(0);
  });

  it('rekap per barang: jumlah bersih terjual sama dengan rencana', async () => {
    await loadDemoData(TODAY);

    const netSold = getNetSoldQuantities(planDemoSales());
    const products = await db.products.toArray();
    const rows = await db.dailyProductSales.toArray();
    DEMO_PRODUCTS.forEach((demo, index) => {
      const product = products.find((candidate) => candidate.sku === demo.sku);
      const quantity = rows.filter((row) => row.productId === product?.id).reduce((sum, row) => sum + row.quantity, 0);
      expect(quantity, demo.sku).toBe(netSold[index]);
    });
  });

  it('dimuat dua kali (setelah dihapus) menghasilkan omzet dan jumlah yang sama', async () => {
    await loadDemoData(TODAY);
    const first = (await db.dailySales.toArray()).map(({ date, grossTotal, refundedTotal }) => [date, grossTotal, refundedTotal]);
    await clearDemoData();
    await loadDemoData(TODAY);

    expect((await db.dailySales.toArray()).map(({ date, grossTotal, refundedTotal }) => [date, grossTotal, refundedTotal])).toEqual(first);
  }, SLOW_TEST_TIMEOUT_MS);

  it('ada data: menolak memuat dan tidak mengubah apa pun', async () => {
    await loadDemoData(TODAY);
    const salesBefore = await db.sales.count();

    await expect(loadDemoData(TODAY)).rejects.toThrow('belum ada barang dan transaksi');
    expect(await db.sales.count()).toBe(salesBefore);
  });

  it('membuat PIN contoh 1234, dan PIN pemilik yang sudah ada tidak ditimpa', async () => {
    await loadDemoData(TODAY);
    expect((await db.settings.get('demoPin'))?.value).toBe('1234');
    expect(await db.settings.get('ownerPin')).toBeTruthy();
    await clearDemoData();

    await setupPin('987654');
    await loadDemoData(TODAY);

    expect(await db.settings.get('demoPin')).toBeUndefined();
    expect(await db.settings.get('ownerPin')).toBeTruthy();
  }, SLOW_TEST_TIMEOUT_MS);

  it('hapus data contoh: database kosong lagi, flag dan PIN contoh hilang', async () => {
    await loadDemoData(TODAY);
    await clearDemoData();

    for (const table of [db.products, db.stockMovements, db.sales, db.saleItems, db.saleReturns, db.dailySales, db.dailyProductSales, db.stockAlerts, db.categories, db.counters]) {
      expect(await table.count()).toBe(0);
    }
    expect(await db.settings.count()).toBe(0);
  }, SLOW_TEST_TIMEOUT_MS);

  it('hapus ditolak bila database bukan data contoh', async () => {
    await expect(clearDemoData()).rejects.toThrow('bukan berisi data contoh');
  });
});
