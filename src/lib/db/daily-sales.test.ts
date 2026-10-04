import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelSale } from '../../features/sales/api/cancel-sale';
import { createSaleAt } from '../../features/sales/api/create-sale';
import { getSales } from '../../features/sales/api/get-sales';
import { returnSaleItems } from '../../features/sales/api/return-sale-items';
import { parseSaleFilters } from '../../features/sales/sale-filters';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { toLocalDateText } from '../../utils/date-period';
import { getDailySalesRange, rebuildDailySales } from './daily-sales';
import { NO_CONTRIBUTION, saleContribution, toMetrics } from './daily-sales-rows';
import { db } from './database';
import { saleItemSchema, saleReturnSchema, saleSchema } from './records';

const DAY_1 = new Date(2026, 9, 1, 10, 0, 0);
const DAY_2 = new Date(2026, 9, 2, 10, 0, 0);
const DAY_3 = new Date(2026, 9, 3, 10, 0, 0);

async function line(sku: string, quantity: number, discount = 0) {
  return { productId: (await findProductBySku(sku)).id, quantity, discount };
}

// Beras x2, Mi Instan Goreng x3, Air Mineral x1 = 162000; HPP 2x68000 + 3x2800 + 2500 = 146900.
async function plainSale(at: Date) {
  return createSaleAt(
    {
      items: [await line('SBK-001', 2), await line('MKR-001', 3), await line('MNM-001', 1)],
      paymentMethod: 'tunai',
      transactionDiscount: 0,
      amountPaid: 200_000,
      expectedTotal: 162_000,
    },
    at,
  );
}

// Beras x2 (diskon baris 4000), Mi x3, Air x1, diskon transaksi 2000 = 156000.
async function discountedSale(at: Date) {
  return createSaleAt(
    {
      items: [await line('SBK-001', 2, 4_000), await line('MKR-001', 3), await line('MNM-001', 1)],
      paymentMethod: 'qris',
      transactionDiscount: 2_000,
      expectedTotal: 156_000,
    },
    at,
  );
}

async function riwayatItemId(saleId: string, sku: string) {
  const items = saleItemSchema.array().parse(await db.saleItems.where('saleId').equals(saleId).toArray());
  const found = items.find((item) => item.sku === sku);
  if (!found) throw new Error(`Baris ${sku} tidak ada`);
  return found.id;
}

async function expectRecapEqualsRebuild() {
  const incremental = await db.dailySales.orderBy('date').toArray();
  await rebuildDailySales();
  const rebuilt = await db.dailySales.orderBy('date').toArray();
  expect(incremental).toEqual(rebuilt);
}

describe('saleContribution', () => {
  beforeEach(async () => {
    await resetDatabaseWithSeed();
  });

  async function load(saleId: string) {
    return {
      sale: saleSchema.parse(await db.sales.get(saleId)),
      items: saleItemSchema.array().parse(await db.saleItems.where('saleId').equals(saleId).toArray()),
      returns: saleReturnSchema.array().parse(await db.saleReturns.where('saleId').equals(saleId).toArray()),
    };
  }

  it('transaksi biasa: 1 transaksi, total, tanpa retur, HPP penuh', async () => {
    const sale = await plainSale(DAY_1);
    const { items, returns } = await load(sale.id);
    // Urutan produk mengikuti urutan baris transaksi (nama A-Z): Air Mineral, Beras, Mi Instan.
    expect(saleContribution(sale, items, returns)).toEqual({
      transactionCount: 1,
      grossTotal: 162_000,
      refundedTotal: 0,
      cogs: 146_900,
      products: [
        { productId: (await findProductBySku('MNM-001')).id, quantity: 1, revenue: 3_500, cogs: 2_500 },
        { productId: (await findProductBySku('SBK-001')).id, quantity: 2, revenue: 148_000, cogs: 136_000 },
        { productId: (await findProductBySku('MKR-001')).id, quantity: 3, revenue: 10_500, cogs: 8_400 },
      ],
    });
  });

  it('setelah retur sebagian: refunded naik dan HPP berkurang sebesar barang yang diretur', async () => {
    const sale = await plainSale(DAY_1);
    await returnSaleItems(sale.id, {
      items: [{ saleItemId: await riwayatItemId(sale.id, 'SBK-001'), quantity: 1 }],
      reason: 'Kemasan sobek',
    });
    const { sale: updated, items, returns } = await load(sale.id);
    expect(saleContribution(updated, items, returns)).toEqual({
      transactionCount: 1,
      grossTotal: 162_000,
      refundedTotal: 74_000,
      cogs: 78_900,
      products: [
        { productId: (await findProductBySku('MNM-001')).id, quantity: 1, revenue: 3_500, cogs: 2_500 },
        { productId: (await findProductBySku('SBK-001')).id, quantity: 1, revenue: 74_000, cogs: 68_000 },
        { productId: (await findProductBySku('MKR-001')).id, quantity: 3, revenue: 10_500, cogs: 8_400 },
      ],
    });
  });

  it('transaksi dibatalkan tidak menyumbang apa pun', async () => {
    const sale = await plainSale(DAY_1);
    await cancelSale(sale.id, 'Salah input');
    const { sale: cancelled, items, returns } = await load(sale.id);
    expect(saleContribution(cancelled, items, returns)).toEqual(NO_CONTRIBUTION);
  });
});

describe('rekap harian', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(DAY_1);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('penjualan tanpa retur menambah baris tanggal transaksi', async () => {
    await plainSale(DAY_1);
    expect(await db.dailySales.toArray()).toEqual([
      { date: '2026-10-01', transactionCount: 1, grossTotal: 162_000, refundedTotal: 0, cogs: 146_900 },
    ]);
  });

  it('retur di hari berbeda mengurangi baris tanggal transaksi ASAL', async () => {
    const sale = await plainSale(DAY_1);
    vi.setSystemTime(DAY_3);
    await returnSaleItems(sale.id, {
      items: [{ saleItemId: await riwayatItemId(sale.id, 'SBK-001'), quantity: 1 }],
      reason: 'Kemasan sobek',
    });

    const rows = await db.dailySales.orderBy('date').toArray();
    expect(rows.map((row) => row.date)).toEqual(['2026-10-01']);
    expect(rows[0]).toMatchObject({ refundedTotal: 74_000, cogs: 78_900 });
  });

  it('serangkaian operasi di beberapa tanggal: rekap selalu sama dengan hitung ulang', async () => {
    const saleA = await plainSale(DAY_1);
    await expectRecapEqualsRebuild();
    const saleB = await discountedSale(DAY_1);
    const saleC = await discountedSale(DAY_2);
    await expectRecapEqualsRebuild();

    vi.setSystemTime(DAY_2);
    await returnSaleItems(saleA.id, {
      items: [{ saleItemId: await riwayatItemId(saleA.id, 'SBK-001'), quantity: 1 }],
      reason: 'Kemasan sobek',
    });
    await expectRecapEqualsRebuild();

    // Retur penuh bertahap pada saleB, lalu pembatalan setelah retur pada saleA.
    vi.setSystemTime(DAY_3);
    await returnSaleItems(saleB.id, {
      items: [
        { saleItemId: await riwayatItemId(saleB.id, 'SBK-001'), quantity: 2 },
        { saleItemId: await riwayatItemId(saleB.id, 'MKR-001'), quantity: 3 },
        { saleItemId: await riwayatItemId(saleB.id, 'MNM-001'), quantity: 1 },
      ],
      reason: 'Pembeli batal',
    });
    await expectRecapEqualsRebuild();
    await cancelSale(saleA.id, 'Salah input');
    await expectRecapEqualsRebuild();

    // Satu-satunya transaksi di DAY_2 dibatalkan: barisnya tetap ada, bernilai nol, dan tetap sama dengan hitung ulang.
    await cancelSale(saleC.id, 'Salah input');
    await expectRecapEqualsRebuild();
    expect(await db.dailySales.get('2026-10-02')).toMatchObject({ transactionCount: 0, grossTotal: 0, cogs: 0 });
    expect(await db.dailySales.get('2026-10-01')).toMatchObject({ transactionCount: 1, refundedTotal: 156_000 });
  });

  it('metrik rekap = ringkasan Riwayat Transaksi untuk periode yang sama', async () => {
    const saleA = await plainSale(DAY_1);
    await discountedSale(DAY_2);
    await returnSaleItems(saleA.id, {
      items: [{ saleItemId: await riwayatItemId(saleA.id, 'SBK-001'), quantity: 1 }],
      reason: 'Kemasan sobek',
    });
    vi.setSystemTime(DAY_3);

    const summary = (await getSales(parseSaleFilters(new URLSearchParams('periode=7-hari')), DAY_3)).summary;
    const rows = await getDailySalesRange(toLocalDateText(new Date(2026, 9, 1)), toLocalDateText(new Date(2026, 9, 4)));
    const metrics = toMetrics(rows);
    expect(summary).toEqual({ count: metrics.transactionCount, netRevenue: metrics.revenue });
    expect(metrics.revenue).toBe(162_000 - 74_000 + 156_000);
  });

  it('transaksi yang gagal tidak mengubah rekap', async () => {
    await plainSale(DAY_1);
    const before = await db.dailySales.toArray();
    await expect(
      createSaleAt(
        {
          items: [await line('SBK-001', 1)],
          paymentMethod: 'tunai',
          transactionDiscount: 0,
          amountPaid: 100,
          expectedTotal: 74_000,
        },
        DAY_1,
      ),
    ).rejects.toThrow();
    expect(await db.dailySales.toArray()).toEqual(before);
  });
});

describe('toMetrics', () => {
  it('tanpa data: semua nol dan rata-rata 0 (bukan NaN)', () => {
    expect(toMetrics([])).toEqual({ revenue: 0, transactionCount: 0, averageTransaction: 0, grossProfit: 0 });
  });

  it('omzet = gross - refunded, laba = omzet - HPP, rata-rata dibulatkan', () => {
    expect(
      toMetrics([
        { date: '2026-10-01', transactionCount: 2, grossTotal: 100_001, refundedTotal: 1, cogs: 60_000 },
        { date: '2026-10-02', transactionCount: 1, grossTotal: 50_000, refundedTotal: 0, cogs: 30_000 },
      ]),
    ).toEqual({ revenue: 150_000, transactionCount: 3, averageTransaction: 50_000, grossProfit: 60_000 });
  });
});
