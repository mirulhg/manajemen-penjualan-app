import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDailySalesRange } from '../../lib/db/daily-sales';
import { toMetrics } from '../../lib/db/daily-sales-rows';
import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { toLocalDateText } from '../../utils/date-period';
import type { PeriodSelection } from '../../utils/date-period';
import { cancelSale } from '../sales/api/cancel-sale';
import { createSale } from '../sales/api/create-sale';
import { returnSaleItems } from '../sales/api/return-sale-items';
import { seedSampleSales } from '../sales/seed-sample-sales';
import { SAMPLE_PRODUCT_SKUS } from '../stock';
import { getSalesReport, getSalesReportRows } from './api/get-sales-report';
import { getReportRange } from './api/read-report-sales';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);
const SEVEN_DAYS: PeriodSelection = { period: '7-hari', from: null, to: null };
const THIRTY_DAYS: PeriodSelection = { period: '30-hari', from: null, to: null };
const TODAY_ONLY: PeriodSelection = { period: 'hari-ini', from: null, to: null };

function methodRow(report: Awaited<ReturnType<typeof getSalesReport>>, method: string) {
  const row = report.byPaymentMethod.find((entry) => entry.method === method);
  if (!row) throw new Error(`Metode ${method} tidak ada`);
  return row;
}

describe('laporan penjualan dari data contoh', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('30 hari: ringkasan, per metode bayar, dan 30 baris per hari', async () => {
    const report = await getSalesReport(THIRTY_DAYS, TODAY);

    expect(report.summary).toEqual({
      transactionCount: 146,
      grossSales: 5_524_500,
      discounts: 0,
      refunds: 0,
      netRevenue: 5_524_500,
      cancelledCount: 0,
    });
    expect(methodRow(report, 'tunai')).toMatchObject({ count: 58, total: 2_182_500, net: 2_182_500 });
    expect(methodRow(report, 'transfer')).toMatchObject({ count: 47, total: 1_744_000 });
    expect(methodRow(report, 'qris')).toMatchObject({ count: 41, total: 1_598_000 });
    expect(report.byDay).toHaveLength(30);
    expect(report.byDay.reduce((sum, day) => sum + day.netRevenue, 0)).toBe(5_524_500);
    // Hari ini belum ada penjualan, tetapi tetap tampil sebagai 0.
    expect(report.byDay.at(-1)).toEqual({ date: '2026-10-03', transactionCount: 0, netRevenue: 0 });
  });

  it('7 hari: per metode bayar', async () => {
    const report = await getSalesReport(SEVEN_DAYS, TODAY);

    expect(methodRow(report, 'tunai')).toMatchObject({ count: 11, total: 407_500 });
    expect(methodRow(report, 'transfer')).toMatchObject({ count: 9, total: 237_000 });
    expect(methodRow(report, 'qris')).toMatchObject({ count: 8, total: 276_000 });
    expect(report.summary.netRevenue).toBe(920_500);
  });

  it('jumlah transaksi dan omzet bersih sama dengan rekap harian yang dipakai dasbor', async () => {
    const report = await getSalesReport(THIRTY_DAYS, TODAY);
    const range = getReportRange(THIRTY_DAYS, TODAY);
    const metrics = toMetrics(await getDailySalesRange(toLocalDateText(range.start), toLocalDateText(range.end)));

    expect(report.summary.transactionCount).toBe(metrics.transactionCount);
    expect(report.summary.netRevenue).toBe(metrics.revenue);
  });

  it('rincian ekspor berurutan menurut waktu dan memuat semua transaksi', async () => {
    const rows = await getSalesReportRows(THIRTY_DAYS, TODAY);

    expect(rows).toHaveLength(146);
    expect(rows.map((row) => row.date + row.time)).toEqual([...rows.map((row) => row.date + row.time)].sort());
    expect(rows[0]).toMatchObject({ time: '08:00', actor: 'Pemilik', status: 'Selesai' });
  });
});

describe('laporan dengan diskon, retur, dan transaksi dibatalkan', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function line(sku: string, quantity: number, discount = 0) {
    return { productId: (await findProductBySku(sku)).id, quantity, discount };
  }

  async function recordSales() {
    const plain = {
      items: [await line('SBK-001', 2), await line('MKR-001', 3), await line('MNM-001', 1)],
      paymentMethod: 'tunai' as const,
      transactionDiscount: 0,
      amountPaid: 200_000,
      expectedTotal: 162_000,
    };
    const first = await createSale(plain);
    const discounted = await createSale({
      items: [await line('SBK-001', 1, 4000)],
      paymentMethod: 'qris',
      transactionDiscount: 2000,
      expectedTotal: 68_000,
    });
    const cancelled = await createSale(plain);

    const beras = (await db.saleItems.where('saleId').equals(first.id).toArray()).find((item) => item.sku === 'SBK-001');
    if (!beras) throw new Error('Beras tidak ada di transaksi');
    await returnSaleItems(first.id, { items: [{ saleItemId: beras.id, quantity: 1 }], reason: 'Kemasan sobek' });
    await cancelSale(cancelled.id, 'Salah input');
    return { first, discounted, cancelled };
  }

  it('ringkasan dan per metode benar, omzet bersih sama dengan rekap dasbor', async () => {
    await recordSales();

    const report = await getSalesReport(SEVEN_DAYS, TODAY);

    expect(report.summary).toEqual({
      transactionCount: 2,
      grossSales: 236_000,
      discounts: 6000,
      refunds: 74_000,
      netRevenue: 156_000,
      cancelledCount: 1,
    });
    expect(methodRow(report, 'tunai')).toEqual({ method: 'tunai', count: 1, total: 162_000, refunds: 74_000, net: 88_000 });
    expect(methodRow(report, 'qris')).toEqual({ method: 'qris', count: 1, total: 68_000, refunds: 0, net: 68_000 });
    expect(methodRow(report, 'transfer')).toMatchObject({ count: 0, total: 0 });

    const range = getReportRange(SEVEN_DAYS, TODAY);
    const metrics = toMetrics(await getDailySalesRange(toLocalDateText(range.start), toLocalDateText(range.end)));
    expect(report.summary.netRevenue).toBe(metrics.revenue);
    expect(report.summary.transactionCount).toBe(metrics.transactionCount);
  });

  it('rincian ekspor menandai status dan memberi nilai bersih 0 pada transaksi dibatalkan', async () => {
    const { first, cancelled } = await recordSales();

    const rows = await getSalesReportRows(TODAY_ONLY, TODAY);

    expect(rows).toHaveLength(3);
    expect(rows.find((row) => row.number === first.number)).toMatchObject({
      status: 'Retur sebagian',
      total: 162_000,
      refunded: 74_000,
      net: 88_000,
    });
    expect(rows.find((row) => row.number === cancelled.number)).toMatchObject({ status: 'Dibatalkan', net: 0 });
  });

  it('periode tanpa penjualan tetap menghasilkan laporan bernilai 0', async () => {
    const report = await getSalesReport(TODAY_ONLY, TODAY);

    expect(report.summary).toEqual({
      transactionCount: 0,
      grossSales: 0,
      discounts: 0,
      refunds: 0,
      netRevenue: 0,
      cancelledCount: 0,
    });
    expect(report.byDay).toEqual([{ date: '2026-10-03', transactionCount: 0, netRevenue: 0 }]);
  });
});
