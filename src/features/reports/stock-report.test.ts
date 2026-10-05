import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { productSchema, stockMovementSchema } from '../../lib/db/records';
import type { Product } from '../../lib/db/records';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { toLocalDateText } from '../../utils/date-period';
import { seedSampleSales } from '../sales/seed-sample-sales';
import { archiveProduct } from '../stock/api/archive-product';
import { createProduct } from '../stock/api/create-product';
import { updateProduct } from '../stock/api/update-product';
import { SAMPLE_PRODUCT_SKUS } from '../stock';
import { getStockSummary } from '../stock/stock-summary';
import { getStockReport, StockReportError } from './api/get-stock-report';
import { buildStockReportCsv } from './stock-report-files';
import { purchasePriceAt } from './stock-report';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);

function daysAgo(days: number): string {
  return toLocalDateText(new Date(2026, 9, 3 - days));
}

async function reportOf(date: string) {
  return getStockReport(date, TODAY);
}

function quantityOf(report: Awaited<ReturnType<typeof reportOf>>, sku: string) {
  return report.rows.find((row) => row.sku === sku)?.quantity;
}

describe('laporan stok per tanggal dari data contoh', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hari ini sama dengan ringkasan di halaman Stok: 30 jenis, 406 unit, Rp 4.025.100', async () => {
    const report = await reportOf(daysAgo(0));
    const pageSummary = getStockSummary(productSchema.array().parse(await db.products.toArray()));

    expect(report.summary).toMatchObject({ productCount: 30, totalUnits: 406, totalValue: 4_025_100 });
    expect(report.summary.active).toEqual({ productCount: 30, totalUnits: 406, totalValue: 4_025_100 });
    expect(report.summary.totalUnits).toBe(pageSummary.totalUnits);
    expect(report.summary.totalValue).toBe(pageSummary.stockValue);
  });

  it('kemarin sama dengan hari ini karena data contoh tidak punya transaksi hari ini', async () => {
    const report = await reportOf(daysAgo(1));

    // Roti Tawar dan Pasta Gigi tidak pernah terjual, jadi dibuat "hari ini" oleh generator: belum ada kemarin (stok 0, nilai 0).
    expect(report.summary).toMatchObject({ productCount: 28, totalUnits: 406, totalValue: 4_025_100 });
  });

  it('30 hari lalu: 780 unit, Rp 8.729.300; Beras 29 dan Mi Instan Goreng 89', async () => {
    const report = await reportOf(daysAgo(30));

    expect(report.summary).toMatchObject({ productCount: 28, totalUnits: 780, totalValue: 8_729_300 });
    expect(quantityOf(report, 'SBK-001')).toBe(29);
    expect(quantityOf(report, 'MKR-001')).toBe(89);
  });

  it('61 hari lalu, sebelum penjualan pertama: 1.174 unit, Rp 13.694.900', async () => {
    const report = await reportOf(daysAgo(61));

    expect(report.summary).toMatchObject({ productCount: 28, totalUnits: 1174, totalValue: 13_694_900 });
  });

  it('harga beli historis: perubahan hari ini tidak mengubah nilai kemarin', async () => {
    await updateProduct((await findProductBySku('SBK-001')).id, {
      name: 'Beras Premium 5 kg',
      sku: 'SBK-001',
      category: 'Sembako',
      unit: 'sak',
      minStock: '5',
      purchasePrice: '69000',
      sellingPrice: '74000',
    });

    const yesterday = (await reportOf(daysAgo(1))).rows.find((row) => row.sku === 'SBK-001');
    const today = (await reportOf(daysAgo(0))).rows.find((row) => row.sku === 'SBK-001');

    expect(yesterday).toMatchObject({ purchasePrice: 68_000, value: 1_224_000 });
    expect(today).toMatchObject({ purchasePrice: 69_000, value: 1_242_000 });
  });

  it('barang yang dibuat hari ini tidak muncul di laporan kemarin', async () => {
    await createProduct({
      name: 'Kerupuk Udang 250 g',
      sku: 'MKR-006',
      category: 'Makanan Ringan',
      unit: 'bungkus',
      initialStock: '12',
      minStock: '',
      purchasePrice: '9000',
      sellingPrice: '11500',
    });

    expect((await reportOf(daysAgo(0))).summary.productCount).toBe(31);
    const yesterday = await reportOf(daysAgo(1));
    expect(yesterday.summary.productCount).toBe(28);
    expect(yesterday.rows.some((row) => row.sku === 'MKR-006')).toBe(false);
  });

  it('barang arsip tetap tampil dengan status; total tidak berubah, subtotal aktif berkurang', async () => {
    await archiveProduct((await findProductBySku('RMH-003')).id);

    const report = await reportOf(daysAgo(0));

    expect(report.rows.find((row) => row.sku === 'RMH-003')?.status).toBe('Diarsipkan');
    expect(report.summary).toMatchObject({ productCount: 30, totalUnits: 406, totalValue: 4_025_100 });
    expect(report.summary.active).toEqual({ productCount: 29, totalUnits: 384, totalValue: 3_750_100 });
  });

  it('tanggal masa depan ditolak dengan FUTURE_DATE', async () => {
    await expect(reportOf('2026-10-04')).rejects.toMatchObject({ code: 'FUTURE_DATE' });
    await expect(reportOf('2026-10-04')).rejects.toBeInstanceOf(StockReportError);
    await expect(reportOf('bukan-tanggal')).rejects.toMatchObject({ code: 'INVALID_DATE' });
  });

  it('CSV: satu tabel per produk dengan angka murni', async () => {
    const lines = buildStockReportCsv(await reportOf(daysAgo(0))).replace('﻿', '').trim().split('\r\n');

    expect(lines).toHaveLength(31);
    expect(lines[0]).toBe('SKU;Nama;Kategori;Satuan;Stok;Harga beli;Nilai persediaan;Status');
    expect(lines[1]).toBe('MNM-001;Air Mineral 600 ml;Minuman;botol;48;2500;120000;Aktif');
  });
});

describe('purchasePriceAt', () => {
  const change = (seq: number, createdAt: string, before: number, after: number) => ({
    id: crypto.randomUUID(),
    seq,
    productId: crypto.randomUUID(),
    field: 'purchasePrice' as const,
    before,
    after,
    actor: 'Pemilik',
    createdAt,
  });

  it('tanpa perubahan memakai harga sekarang', () => {
    expect(purchasePriceAt(500, [], '2026-10-03T00:00:00.000Z')).toBe(500);
  });

  it('memakai `after` perubahan terakhir sebelum batas', () => {
    const changes = [change(1, '2026-09-01T00:00:00.000Z', 100, 200), change(2, '2026-09-20T00:00:00.000Z', 200, 300), change(3, '2026-10-05T00:00:00.000Z', 300, 400)];
    expect(purchasePriceAt(400, changes, '2026-10-01T00:00:00.000Z')).toBe(300);
  });

  it('semua perubahan sesudah batas: memakai `before` perubahan pertama', () => {
    const changes = [change(1, '2026-10-05T00:00:00.000Z', 100, 200), change(2, '2026-10-06T00:00:00.000Z', 200, 300)];
    expect(purchasePriceAt(300, changes, '2026-10-01T00:00:00.000Z')).toBe(100);
  });
});

describe('kinerja laporan stok', () => {
  beforeEach(resetDatabaseWithSeed);

  it('2.000 produk dengan ±300 pergerakan per hari selama 30 hari, tanggal 30 hari lalu', async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    const created = new Date(2026, 6, 1).toISOString();
    const products: Product[] = Array.from({ length: 2000 }, (_, index) =>
      productSchema.parse({
        id: crypto.randomUUID(),
        sku: `GEN-${String(index + 1).padStart(4, '0')}`,
        name: `Barang Uji ${String(index + 1).padStart(4, '0')}`,
        category: 'Uji',
        unit: 'pcs',
        stockQuantity: 100,
        minStock: null,
        purchasePrice: 1000 + index,
        sellingPrice: 2000,
        createdAt: created,
        updatedAt: created,
        archivedAt: null,
      }),
    );
    const movements = Array.from({ length: 30 * 300 }, (_, index) => {
      const product = products[index % products.length];
      if (!product) throw new Error('Produk uji tidak ada');
      return stockMovementSchema.parse({
        id: crypto.randomUUID(),
        seq: index + 1,
        productId: product.id,
        type: 'jual',
        quantityBefore: 100,
        quantityAfter: 99,
        reason: 'Penjualan uji',
        actor: 'Pemilik',
        createdAt: new Date(2026, 8, 4 + Math.floor(index / 300), 8 + (index % 12)).toISOString(),
      });
    });
    await db.products.bulkAdd(products);
    await db.stockMovements.bulkAdd(movements);

    const start = performance.now();
    const report = await getStockReport('2026-09-03', new Date(2026, 9, 3, 10, 0));
    const elapsed = performance.now() - start;

    expect(report.rows).toHaveLength(2000);
    expect(elapsed).toBeLessThan(5000);
    // Dibaca dari keluaran test: angka kinerja untuk laporan akhir.
    process.stdout.write(`\n[kinerja laporan stok 2.000 produk, 9.000 pergerakan] ${Math.round(elapsed)} ms\n`);
  });
});
