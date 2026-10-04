import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDailySalesRange } from '../../lib/db/daily-sales';
import { toMetrics } from '../../lib/db/daily-sales-rows';
import { db } from '../../lib/db/database';
import { SAMPLE_PRODUCT_SKUS } from '../stock';
import { getStockSummary } from '../stock/stock-summary';
import { productSchema } from '../../lib/db/records';
import { resetDatabaseWithSeed } from '../../test/reset-database';
import { getSales } from './api/get-sales';
import { seedSampleSales } from './seed-sample-sales';
import { parseSaleFilters } from './sale-filters';
import { toLocalDateText } from '../../utils/date-period';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);

// Hari ini + (daysBack) hari sebelumnya; hari ini sendiri tidak berisi data contoh.
function metricsFor(daysBack: number) {
  const from = new Date(2026, 9, 3 - daysBack);
  const to = new Date(2026, 9, 4);
  return getDailySalesRange(toLocalDateText(from), toLocalDateText(to)).then(toMetrics);
}

describe('seedSampleSales', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('membuat 300 transaksi dan stok akhir tetap sama dengan Data Contoh Produk', async () => {
    expect(await db.sales.count()).toBe(300);
    const products = productSchema.array().parse(await db.products.toArray());
    expect(getStockSummary(products)).toEqual({ productCount: 30, totalUnits: 406, stockValue: 4_025_100 });
  });

  it('Roti Tawar dan Pasta Gigi tidak pernah terjual; Teh Siap Minum terakhir terjual di hari ke-24', async () => {
    const soldSkus = new Set((await db.saleItems.toArray()).map((item) => item.sku));
    expect(soldSkus.has('MKR-005')).toBe(false);
    expect(soldSkus.has('MND-003')).toBe(false);

    const tea = (await db.saleItems.toArray()).filter((item) => item.sku === 'MNM-006').map((item) => item.saleId);
    const teaSales = (await db.sales.bulkGet(tea)).flatMap((sale) => (sale ? [sale] : []));
    const lastTeaSale = teaSales.map((sale) => sale.createdAt).sort().at(-1);
    // Hari ke-24 = 37 hari lalu dari 3 Oktober 2026 (hari ke-60 = kemarin).
    expect(lastTeaSale && toLocalDateText(new Date(lastTeaSale))).toBe(toLocalDateText(new Date(2026, 9, 3 - 37)));
  });

  it('metrik sama dengan simulasi Docs/simulasi-penjualan-contoh.py', async () => {
    expect(await metricsFor(60)).toEqual({
      transactionCount: 300,
      revenue: 11_362_500,
      grossProfit: 1_692_700,
      averageTransaction: 37_875,
    });
    expect(await metricsFor(1)).toMatchObject({ transactionCount: 3, revenue: 136_000, grossProfit: 16_700, averageTransaction: 45_333 });
    expect(await metricsFor(6)).toMatchObject({ transactionCount: 28, revenue: 920_500, grossProfit: 141_900, averageTransaction: 32_875 });
    expect(await metricsFor(29)).toMatchObject({ transactionCount: 146, revenue: 5_524_500, grossProfit: 820_300, averageTransaction: 37_839 });
  });

  it('rekap sama dengan Riwayat Transaksi untuk periode 7 hari', async () => {
    const summary = (await getSales(parseSaleFilters(new URLSearchParams('periode=7-hari')), TODAY)).summary;
    const metrics = await metricsFor(6);
    expect(summary).toEqual({ count: metrics.transactionCount, netRevenue: metrics.revenue });
  });

  it('dipanggil dua kali tidak menggandakan data', async () => {
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
    expect(await db.sales.count()).toBe(300);
  });
});
