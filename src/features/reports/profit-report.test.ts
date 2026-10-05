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
import { getProfitReport } from './api/get-profit-report';
import { getReportRange } from './api/read-report-sales';
import { buildProfitReportCsv } from './profit-report-files';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);
const THIRTY_DAYS: PeriodSelection = { period: '30-hari', from: null, to: null };
const SEVEN_DAYS: PeriodSelection = { period: '7-hari', from: null, to: null };

async function dashboardGrossProfit(selection: PeriodSelection) {
  const range = getReportRange(selection, TODAY);
  return toMetrics(await getDailySalesRange(toLocalDateText(range.start), toLocalDateText(range.end))).grossProfit;
}

describe('laporan laba kotor dari data contoh', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('30 hari: ringkasan dan 27 produk terjual', async () => {
    const report = await getProfitReport(THIRTY_DAYS, TODAY);

    expect(report.summary).toEqual({ revenue: 5_524_500, cogs: 4_704_200, grossProfit: 820_300, margin: 14.8 });
    expect(report.byProduct).toHaveLength(27);
    expect(report.summary.grossProfit).toBe(await dashboardGrossProfit(THIRTY_DAYS));
  });

  it('per kategori urut laba terbesar', async () => {
    const report = await getProfitReport(THIRTY_DAYS, TODAY);

    expect(report.byCategory.map((row) => [row.category, row.grossProfit])).toEqual([
      ['Sembako', 227_000],
      ['Bumbu Dapur', 184_000],
      ['Kebutuhan Rumah', 143_500],
      ['Minuman', 109_500],
      ['Perlengkapan Mandi', 85_600],
      ['Makanan Ringan', 70_700],
    ]);
    expect(report.byCategory[0]?.revenue).toBe(2_194_500);
    expect(report.byCategory.reduce((sum, row) => sum + row.grossProfit, 0)).toBe(820_300);
  });

  it('per produk urut laba terbesar, memuat SKU dan kategori', async () => {
    const report = await getProfitReport(THIRTY_DAYS, TODAY);

    expect(report.byProduct.slice(0, 3).map((row) => [row.name, row.grossProfit])).toEqual([
      ['Kecap Manis 520 ml', 84_000],
      ['Minyak Goreng 2 L', 68_000],
      ['Beras Premium 5 kg', 66_000],
    ]);
    expect(report.byProduct[2]).toMatchObject({ sku: 'SBK-001', category: 'Sembako', status: 'Aktif', margin: 8.1 });
  });

  it('barang arsip tetap tampil dengan status Diarsipkan', async () => {
    const beras = await findProductBySku('SBK-001');
    await db.products.update(beras.id, { archivedAt: TODAY.toISOString() });

    const report = await getProfitReport(THIRTY_DAYS, TODAY);

    expect(report.byProduct.find((row) => row.sku === 'SBK-001')?.status).toBe('Diarsipkan');
    expect(report.summary.grossProfit).toBe(820_300);
  });

  it('CSV per produk: header, angka murni, tanpa Rp', async () => {
    const lines = buildProfitReportCsv(await getProfitReport(THIRTY_DAYS, TODAY)).replace('﻿', '').trim().split('\r\n');

    expect(lines).toHaveLength(28);
    expect(lines[0]).toBe('SKU;Nama;Kategori;Status;Terjual;Omzet;HPP;Laba kotor;Margin (%)');
    // Desimal memakai koma karena pemisah kolom ';' (Excel Indonesia).
    expect(lines[1]).toBe('BMB-001;Kecap Manis 520 ml;Bumbu Dapur;Aktif;28;616000;532000;84000;13,6');
    expect(lines.join('')).not.toMatch(/Rp/);
  });
});

describe('laporan laba kotor dengan diskon, retur, dan batal', () => {
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

  it('total laba sama dengan dasbor', async () => {
    const plain = {
      items: [await line('SBK-001', 2), await line('MKR-001', 3), await line('MNM-001', 1)],
      paymentMethod: 'tunai' as const,
      transactionDiscount: 0,
      amountPaid: 200_000,
      expectedTotal: 162_000,
    };
    const first = await createSale(plain);
    await createSale({
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

    const report = await getProfitReport(SEVEN_DAYS, TODAY);

    expect(report.summary.revenue).toBe(156_000);
    expect(report.summary.grossProfit).toBe(await dashboardGrossProfit(SEVEN_DAYS));
    expect(report.byProduct.reduce((sum, row) => sum + row.grossProfit, 0)).toBe(report.summary.grossProfit);
  });

  it('periode tanpa penjualan: ringkasan 0 dan margin 0', async () => {
    const report = await getProfitReport(SEVEN_DAYS, TODAY);

    expect(report).toEqual({ summary: { revenue: 0, cogs: 0, grossProfit: 0, margin: 0 }, byCategory: [], byProduct: [] });
  });
});
