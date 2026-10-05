import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { toLocalDateText } from '../../utils/date-period';
import type { PeriodSelection } from '../../utils/date-period';
import { cancelSale } from '../sales/api/cancel-sale';
import { createSale } from '../sales/api/create-sale';
import { returnSaleItems } from '../sales/api/return-sale-items';
import { seedSampleSales } from '../sales/seed-sample-sales';
import { adjustStock } from '../stock/api/adjust-stock';
import { archiveProduct } from '../stock/api/archive-product';
import { createProduct } from '../stock/api/create-product';
import { SAMPLE_PRODUCT_SKUS } from '../stock';
import { getProfitReport } from './api/get-profit-report';
import { getReportRange } from './api/read-report-sales';
import { getStockMovementReport } from './api/get-stock-movement-report';
import { getStockReport } from './api/get-stock-report';
import type { MovementRow } from './report-columns';
import { buildStockMovementReportCsv } from './stock-movement-report-files';
import type { StockMovementReport } from './stock-movement-report';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);

function selection(period: PeriodSelection['period'], from: string | null = null, to: string | null = null): PeriodSelection {
  return { period, from, to };
}

function daysAgo(days: number): string {
  return toLocalDateText(new Date(2026, 9, 3 - days));
}

function rowOf(report: StockMovementReport, sku: string): MovementRow {
  const row = report.rows.find((entry) => entry.sku === sku);
  if (!row) throw new Error(`${sku} tidak ada di laporan`);
  return row;
}

const figures = (row: MovementRow) => [row.opening, row.incoming, row.sold, row.returned, row.correction, row.closing];

// awal + masuk + retur/batal - terjual + koreksi = akhir
function expectIdentity(report: StockMovementReport) {
  for (const row of report.rows) {
    expect(row.opening + row.incoming + row.returned - row.sold + row.correction, row.sku).toBe(row.closing);
  }
  const { summary } = report;
  expect(summary.opening + summary.incoming + summary.returned - summary.sold + summary.correction).toBe(summary.closing);
}

describe('laporan pergerakan stok dari data contoh', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('30 hari: awal 780, terjual 374, akhir 406; bergerak 27 dari 30', async () => {
    const report = await getStockMovementReport(selection('30-hari'), TODAY);

    expect(report.summary).toEqual({
      opening: 780, incoming: 0, sold: 374, returned: 0, correction: 0, closing: 406, productCount: 30, movedCount: 27,
    });
    expect(figures(rowOf(report, 'SBK-001'))).toEqual([29, 0, 11, 0, 0, 18]);
    expect(figures(rowOf(report, 'MKR-001'))).toEqual([89, 0, 29, 0, 0, 60]);
    expect(figures(rowOf(report, 'BMB-001'))).toEqual([39, 0, 28, 0, 0, 11]);
    expect(figures(rowOf(report, 'SBK-002'))).toEqual([20, 0, 17, 0, 0, 3]);
    expectIdentity(report);
  });

  it('jumlah terjual sama dengan laporan laba kotor (tidak ada retur di data contoh)', async () => {
    const movement = await getStockMovementReport(selection('30-hari'), TODAY);
    const profit = await getProfitReport(selection('30-hari'), TODAY);

    expect(profit.byProduct.reduce((sum, row) => sum + row.quantity, 0)).toBe(movement.summary.sold);
    expect(profit.byProduct.find((row) => row.sku === 'BMB-001')?.quantity).toBe(rowOf(movement, 'BMB-001').sold);
  });

  it('7 hari dan kemarin', async () => {
    const week = await getStockMovementReport(selection('7-hari'), TODAY);
    expect(week.summary).toMatchObject({ opening: 479, sold: 73, closing: 406, movedCount: 25 });
    expect(figures(rowOf(week, 'SBK-001'))).toEqual([19, 0, 1, 0, 0, 18]);
    expectIdentity(week);

    const yesterday = await getStockMovementReport(selection('kemarin'), TODAY);
    expect(yesterday.summary).toMatchObject({ opening: 414, sold: 8, closing: 406, movedCount: 5 });
    expectIdentity(yesterday);
  });

  it('rentang 60 hari: stok awal sudah ada; rentang 61 hari: stok pertama masuk kolom Masuk', async () => {
    const sixty = await getStockMovementReport(selection('rentang', daysAgo(60), daysAgo(0)), TODAY);
    expect(sixty.summary).toMatchObject({ opening: 1174, incoming: 0, sold: 768, closing: 406 });
    expectIdentity(sixty);

    const sixtyOne = await getStockMovementReport(selection('rentang', daysAgo(61), daysAgo(0)), TODAY);
    expect(sixtyOne.summary).toMatchObject({ opening: 0, incoming: 1174, sold: 768, closing: 406 });
    expectIdentity(sixtyOne);
  });

  it.each([
    ['30 hari', selection('30-hari')],
    ['7 hari', selection('7-hari')],
    ['bulan lalu', selection('bulan-lalu')],
  ])('konsisten dengan laporan stok: %s', async (_name, period) => {
    const range = getReportRange(period, TODAY);
    const lastDay = toLocalDateText(new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate() - 1));
    const dayBeforeStart = toLocalDateText(new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate() - 1));

    const report = await getStockMovementReport(period, TODAY);

    expect(report.summary.closing).toBe((await getStockReport(lastDay, TODAY)).summary.totalUnits);
    expect(report.summary.opening).toBe((await getStockReport(dayBeforeStart, TODAY)).summary.totalUnits);
    expectIdentity(report);
  });

  it('barang arsip tetap ada dengan status Diarsipkan; CSV memuat semua barang walau tabel hanya yang bergerak', async () => {
    await archiveProduct((await findProductBySku('SBK-001')).id);

    const report = await getStockMovementReport(selection('30-hari'), TODAY);

    expect(rowOf(report, 'SBK-001').status).toBe('Diarsipkan');
    expect(report.summary.closing).toBe(406);
    // 30 barang ada pada akhir periode, 27 bergerak. CSV: header + semua baris.
    expect(report.movedSkus.size).toBe(27);
    const lines = buildStockMovementReportCsv(report).replace('﻿', '').trim().split('\r\n');
    expect(lines).toHaveLength(1 + report.rows.length);
    expect(lines[0]).toBe('SKU;Nama;Kategori;Satuan;Stok awal;Masuk;Terjual;Retur/batal;Koreksi (±);Stok akhir;Status');
  });
});

describe('laporan pergerakan stok hari ini setelah transaksi', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function doTodaysWork() {
    const beras = await findProductBySku('SBK-001');
    const mi = await findProductBySku('MKR-001');
    await adjustStock(beras.id, { type: 'masuk', quantity: '10', reason: 'Kiriman supplier' });
    const sale = await createSale({
      items: [{ productId: beras.id, quantity: 2, discount: 0 }],
      paymentMethod: 'qris',
      transactionDiscount: 0,
      expectedTotal: 148_000,
    });
    const berasLine = (await db.saleItems.where('saleId').equals(sale.id).toArray())[0];
    if (!berasLine) throw new Error('Baris Beras tidak ada');
    await returnSaleItems(sale.id, { items: [{ saleItemId: berasLine.id, quantity: 1 }], reason: 'Kemasan sobek' });
    await adjustStock(beras.id, { type: 'koreksi', quantity: '25', reason: 'Hasil stock opname' });
    const miSale = await createSale({
      items: [{ productId: mi.id, quantity: 1, discount: 0 }],
      paymentMethod: 'qris',
      transactionDiscount: 0,
      expectedTotal: 3500,
    });
    await cancelSale(miSale.id, 'Salah input');
    await createProduct({
      name: 'Uji Pergerakan',
      sku: 'UJI-001',
      category: 'Sembako',
      unit: 'pcs',
      initialStock: '5',
      minStock: '',
      purchasePrice: '1000',
      sellingPrice: '1500',
    });
  }

  it('Beras, Mi Instan Goreng, dan barang baru; total dan identitas benar; kemarin tidak berubah', async () => {
    await doTodaysWork();

    const today = await getStockMovementReport(selection('hari-ini'), TODAY);

    expect(figures(rowOf(today, 'SBK-001'))).toEqual([18, 10, 2, 1, -2, 25]);
    expect(figures(rowOf(today, 'MKR-001'))).toEqual([60, 0, 1, 1, 0, 60]);
    expect(figures(rowOf(today, 'UJI-001'))).toEqual([0, 5, 0, 0, 0, 5]);
    expect(today.summary).toEqual({
      opening: 406, incoming: 15, sold: 3, returned: 2, correction: -2, closing: 418, productCount: 31, movedCount: 3,
    });
    expectIdentity(today);
    expect((await getStockReport(daysAgo(0), TODAY)).summary.totalUnits).toBe(418);

    const yesterday = await getStockMovementReport(selection('kemarin'), TODAY);
    expect(yesterday.summary).toMatchObject({ opening: 414, sold: 8, closing: 406, movedCount: 5 });
    expectIdentity(yesterday);
  });
});
