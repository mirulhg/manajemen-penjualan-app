import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelSale } from '../../features/sales/api/cancel-sale';
import { createSaleAt } from '../../features/sales/api/create-sale';
import { returnSaleItems } from '../../features/sales/api/return-sale-items';
import { seedSampleSales } from '../../features/sales/seed-sample-sales';
import { SAMPLE_PRODUCT_SKUS } from '../../features/stock';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { clipRangeToToday, resolvePeriodRange, startOfDay, toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { getDailySalesRange } from './daily-sales';
import { toMetrics } from './daily-sales-rows';
import { db } from './database';
import { saleItemSchema } from './records';
import { getRevenueByCategory, getTransactionsByHour } from './sales-analytics';
import { trimHours } from './sales-analytics-rows';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);

function rangeOf(period: '30-hari' | '12-bulan' | '7-hari'): DateRange {
  return clipRangeToToday(resolvePeriodRange({ period, from: null, to: null }, TODAY), TODAY);
}

describe('analitik dengan data penjualan contoh', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('omzet per kategori 30 hari urut terbesar, totalnya = omzet periode', async () => {
    const result = await getRevenueByCategory(rangeOf('30-hari'));

    expect(result).toEqual([
      { category: 'Sembako', revenue: 2_194_500 },
      { category: 'Bumbu Dapur', revenue: 1_061_000 },
      { category: 'Kebutuhan Rumah', revenue: 938_500 },
      { category: 'Minuman', revenue: 643_500 },
      { category: 'Perlengkapan Mandi', revenue: 344_500 },
      { category: 'Makanan Ringan', revenue: 342_500 },
    ]);
    expect(result.reduce((sum, entry) => sum + entry.revenue, 0)).toBe(5_524_500);
  });

  it('jam sibuk 30 hari: jam genap terisi, jam ganjil 0, dipotong 08-20', async () => {
    const hours = trimHours(await getTransactionsByHour(rangeOf('30-hari')));

    expect(hours).toHaveLength(13);
    expect(hours[0]?.hour).toBe(8);
    expect(hours.at(-1)?.hour).toBe(20);
    expect(Object.fromEntries(hours.map(({ hour, count }) => [hour, count]))).toEqual({
      8: 29, 9: 0, 10: 29, 11: 0, 12: 29, 13: 0, 14: 23, 15: 0, 16: 18, 17: 0, 18: 12, 19: 0, 20: 6,
    });
  });

  it('periode sebelumnya sesuai simulasi: 7 hari 38 transaksi/Rp 1.542.500, 30 hari 150/Rp 5.689.500', async () => {
    const previousOf = async (days: number, back: number) => {
      const start = startOfDay(TODAY, -(back + days - 1));
      const end = startOfDay(TODAY, -(back - 1));
      return toMetrics(await getDailySalesRange(toLocalDateText(start), toLocalDateText(end)));
    };

    expect(await previousOf(7, 7)).toMatchObject({ transactionCount: 38, revenue: 1_542_500 });
    expect(await previousOf(30, 30)).toMatchObject({ transactionCount: 150, revenue: 5_689_500 });
  });

  it('kinerja: omzet per kategori dan jam sibuk 12 bulan pada data contoh', async () => {
    const range = rangeOf('12-bulan');
    const startedAt = performance.now();
    const categories = await getRevenueByCategory(range);
    const byCategoryMs = performance.now() - startedAt;
    const hoursStartedAt = performance.now();
    await getTransactionsByHour(range);
    const byHourMs = performance.now() - hoursStartedAt;

    expect(categories.reduce((sum, entry) => sum + entry.revenue, 0)).toBe(11_362_500);
    // Batas longgar agar tidak flaky di CI; target PRD untuk seluruh grafik 12 bulan adalah < 3 detik.
    expect(byCategoryMs).toBeLessThan(1000);
    expect(byHourMs).toBeLessThan(1000);
  });
});

describe('omzet per kategori dengan diskon, retur, dan pembatalan', () => {
  const DAY = new Date(2026, 9, 2, 10, 0, 0);

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(DAY);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function line(sku: string, quantity: number, discount = 0) {
    return { productId: (await findProductBySku(sku)).id, quantity, discount };
  }

  async function itemId(saleId: string, sku: string) {
    const items = saleItemSchema.array().parse(await db.saleItems.where('saleId').equals(saleId).toArray());
    const found = items.find((item) => item.sku === sku);
    if (!found) throw new Error(`Baris ${sku} tidak ada`);
    return found.id;
  }

  it('total per kategori = omzet periode (dari rekap harian)', async () => {
    // Diskon baris + diskon transaksi: 156000 (Sembako, Makanan Ringan, Minuman).
    const discounted = await createSaleAt(
      {
        items: [await line('SBK-001', 2, 4_000), await line('MKR-001', 3), await line('MNM-001', 1)],
        paymentMethod: 'qris',
        transactionDiscount: 2_000,
        expectedTotal: 156_000,
      },
      DAY,
    );
    const other = await createSaleAt(
      {
        items: [await line('BMB-001', 2), await line('RMH-001', 1)],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 64_000,
      },
      DAY,
    );
    const cancelled = await createSaleAt(
      {
        items: [await line('SBK-003', 4)],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      DAY,
    );

    // Retur sebagian pada transaksi berdiskon, dan satu transaksi dibatalkan.
    const saleReturn = await returnSaleItems(discounted.id, {
      items: [
        { saleItemId: await itemId(discounted.id, 'SBK-001'), quantity: 1 },
        { saleItemId: await itemId(discounted.id, 'MKR-001'), quantity: 2 },
      ],
      reason: 'Kemasan rusak',
    });
    await cancelSale(cancelled.id, 'Salah input');

    const range = { start: startOfDay(DAY), end: startOfDay(DAY, 1) };
    const categories = await getRevenueByCategory(range);
    const metrics = toMetrics(await getDailySalesRange(toLocalDateText(range.start), toLocalDateText(range.end)));

    expect(categories.reduce((sum, entry) => sum + entry.revenue, 0)).toBe(metrics.revenue);
    expect(categories.map((entry) => entry.category)).not.toContain('Tanpa kategori');
    // Transaksi yang dibatalkan (Gula = Sembako) tidak masuk; 'other' tetap utuh.
    expect(metrics.revenue).toBe(156_000 - saleReturn.refundTotal + other.total);
    expect(await getTransactionsByHour(range)).toSatisfy((counts: number[]) => counts[10] === 2);
  });

  it('produk yang sudah tidak ada dikelompokkan sebagai Tanpa kategori', async () => {
    const sale = await createSaleAt(
      {
        items: [await line('SBK-003', 1)],
        paymentMethod: 'qris',
        transactionDiscount: 0,
        expectedTotal: 18_500,
      },
      DAY,
    );
    await db.products.delete((await findProductBySku('SBK-003')).id);

    const range = { start: startOfDay(DAY), end: startOfDay(DAY, 1) };
    expect(await getRevenueByCategory(range)).toEqual([{ category: 'Tanpa kategori', revenue: sale.total }]);
  });

  it('periode tanpa transaksi: kategori dan jam kosong', async () => {
    const range = { start: startOfDay(DAY), end: startOfDay(DAY, 1) };
    expect(await getRevenueByCategory(range)).toEqual([]);
    expect(trimHours(await getTransactionsByHour(range))).toEqual([]);
  });
});

describe('omzet per kategori pada banyak transaksi', () => {
  beforeEach(async () => {
    await resetDatabaseWithSeed();
  });

  it('3.000 transaksi dalam rentang selesai < 2 detik (anyOf per kunci butuh puluhan detik)', async () => {
    const product = await findProductBySku('SBK-001');
    const sales = [];
    const items = [];
    for (let index = 0; index < 3_000; index += 1) {
      const id = crypto.randomUUID();
      sales.push({
        id,
        number: `TRX-20260101-${String(index + 1).padStart(4, '0')}`,
        paymentMethod: 'tunai' as const,
        subtotal: 74_000,
        itemDiscountTotal: 0,
        transactionDiscount: 0,
        total: 74_000,
        amountPaid: 74_000,
        change: 0,
        itemCount: 1,
        actor: 'Pemilik',
        createdAt: new Date(2026, 5, 1 + (index % 60), 8 + (index % 12)).toISOString(),
        status: 'selesai' as const,
        refundedTotal: 0,
      });
      items.push({
        id: crypto.randomUUID(),
        saleId: id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        quantity: 1,
        unitPrice: 74_000,
        unitCost: 68_000,
        discount: 0,
      });
    }
    await db.sales.bulkAdd(sales);
    await db.saleItems.bulkAdd(items);

    const startedAt = performance.now();
    const result = await getRevenueByCategory({ start: new Date(2026, 5, 1), end: new Date(2026, 8, 1) });
    expect(performance.now() - startedAt).toBeLessThan(2_000);
    expect(result).toEqual([{ category: 'Sembako', revenue: 3_000 * 74_000 }]);
  }, 20_000);
});
