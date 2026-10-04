import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelSale } from '../../features/sales/api/cancel-sale';
import { createSaleAt } from '../../features/sales/api/create-sale';
import { seedSampleSales } from '../../features/sales/seed-sample-sales';
import { SAMPLE_PRODUCT_SKUS } from '../../features/stock';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { clipRangeToToday, resolvePeriodRange, startOfDay, toLocalDateText } from '../../utils/date-period';
import { getProductSalesInRange } from './daily-product-sales';
import { db } from './database';
import {
  getAnalysisReadiness,
  getProductSalesWithProducts,
  getSlowMovers,
  getStockForecast,
} from './product-analytics';
import {
  computeReadiness,
  describeDaysUntilOut,
  markParetoContributors,
  rankBy,
  topByQuantity,
} from './product-analytics-rows';

const TODAY = new Date(2026, 9, 3, 10, 0, 0);

function range30() {
  return clipRangeToToday(resolvePeriodRange({ period: '30-hari', from: null, to: null }, TODAY), TODAY);
}

describe('analisis produk dengan data penjualan contoh', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, TODAY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('terlaris 30 hari: 10 produk, seri diurutkan nama', async () => {
    const top = topByQuantity(await getProductSalesWithProducts(range30()), 10);

    expect(top.map((row) => [row.name, row.quantity])).toEqual([
      ['Mi Instan Goreng', 29],
      ['Kecap Manis 520 ml', 28],
      ['Sikat Gigi', 21],
      ['Deterjen Bubuk 800 g', 18],
      ['Minyak Goreng 2 L', 17],
      ['Air Mineral 600 ml', 16],
      ['Merica Bubuk 50 g', 16],
      ['Sampo Sachet 10 ml isi 12', 14],
      ['Teh Celup isi 25', 14],
      ['Tepung Terigu 1 kg', 14],
    ]);
  });

  it('peringkat omzet dan laba, dengan margin satu desimal', async () => {
    const rows = await getProductSalesWithProducts(range30());

    expect(rankBy(rows, 'revenue').slice(0, 3).map((row) => [row.name, row.revenue, row.grossProfit, row.margin])).toEqual([
      ['Beras Premium 5 kg', 814_000, 66_000, 8.1],
      ['Minyak Goreng 2 L', 646_000, 68_000, 10.5],
      ['Kecap Manis 520 ml', 616_000, 84_000, 13.6],
    ]);
    expect(rankBy(rows, 'grossProfit').slice(0, 5).map((row) => [row.name, row.grossProfit])).toEqual([
      ['Kecap Manis 520 ml', 84_000],
      ['Minyak Goreng 2 L', 68_000],
      ['Beras Premium 5 kg', 66_000],
      ['Deterjen Bubuk 800 g', 54_000],
      ['Sikat Gigi', 42_000],
    ]);
  });

  it('Σ revenue semua produk = omzet periode (dari rekap per produk)', async () => {
    const totals = await getProductSalesInRange(range30());
    expect(totals.reduce((sum, row) => sum + row.revenue, 0)).toBe(5_524_500);
    expect(totals.reduce((sum, row) => sum + row.cogs, 0)).toBe(5_524_500 - 820_300);
  });

  it('Pareto 30 hari: 15 produk menyumbang 80% omzet, produk ke-15 = Sikat Gigi', async () => {
    const ranked = rankBy(await getProductSalesWithProducts(range30()), 'revenue');
    const pareto = markParetoContributors(ranked, 0.8);

    expect(pareto.count).toBe(15);
    expect(ranked[14]?.name).toBe('Sikat Gigi');
    expect(pareto.contributorIds.has(ranked[14]?.productId ?? '')).toBe(true);
    expect(pareto.contributorIds.has(ranked[15]?.productId ?? '')).toBe(false);
  });

  it('lambat laku ambang 30 hari: tiga produk, tanggal terakhir terjual Teh Siap Minum = hari ke-24', async () => {
    const movers = await getSlowMovers(30, TODAY);

    expect(movers.map((row) => [row.name, row.stockValue])).toEqual([
      ['Pasta Gigi 190 g', 0],
      ['Roti Tawar', 0],
      ['Teh Siap Minum 350 ml', 0],
    ]);
    expect(movers.map((row) => row.lastSoldDate)).toEqual([null, null, toLocalDateText(startOfDay(TODAY, -37))]);
  });

  it('lambat laku ambang 60 hari: Pasta Gigi dan Roti Tawar saja; barang arsip hilang dari daftar', async () => {
    expect((await getSlowMovers(60, TODAY)).map((row) => row.name)).toEqual(['Pasta Gigi 190 g', 'Roti Tawar']);

    await db.products.update((await findProductBySku('MKR-005')).id, { archivedAt: TODAY.toISOString() });
    expect((await getSlowMovers(60, TODAY)).map((row) => row.name)).toEqual(['Pasta Gigi 190 g']);
  });

  it('lambat laku: nilai stok = stok x harga beli dan urut terbesar dulu', async () => {
    // Jendela 7 hari menghasilkan lebih banyak produk yang tidak terjual, sehingga urutan nilai stok bisa diperiksa.
    const movers = await getSlowMovers(7, TODAY);
    const values = movers.map((row) => row.stockValue);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    for (const mover of movers) {
      const product = await db.products.get(mover.productId);
      expect(mover.stockValue).toBe(Math.max(product?.stockQuantity ?? 0, 0) * (product?.purchasePrice ?? 0));
    }
  });

  it('perkiraan habis: 27 produk, urutan awal dan saran restock sesuai rumus', async () => {
    const forecast = await getStockForecast(TODAY);

    expect(forecast).toHaveLength(27);
    expect(
      forecast.slice(0, 6).map((row) => [row.name, describeDaysUntilOut(row.daysUntilOut), row.restockSuggestion]),
    ).toEqual([
      ['Telur Ayam 1 kg', 'Sudah habis', 4],
      ['Penyedap Rasa 100 g', 'sekitar 3 hari', 4],
      ['Keripik Singkong 150 g', 'sekitar 6 hari', 3],
      ['Minyak Goreng 2 L', 'sekitar 8 hari', 2],
      ['Kecap Manis 520 ml', 'sekitar 11 hari', 3],
      ['Teh Celup isi 25', 'sekitar 11 hari', 1],
    ]);
  });

  it('barang arsip tidak muncul di perkiraan habis, tetapi tetap ada di peringkat dengan penanda arsip', async () => {
    const minyak = await findProductBySku('SBK-002');
    await db.products.update(minyak.id, { archivedAt: TODAY.toISOString() });

    expect((await getStockForecast(TODAY)).map((row) => row.name)).not.toContain('Minyak Goreng 2 L');
    const archivedRow = (await getProductSalesWithProducts(range30())).find((row) => row.productId === minyak.id);
    expect(archivedRow).toMatchObject({ isArchived: true, quantity: 17 });
  });

  it('periode 30 hari hanya membaca rentang tanggal rekap, bukan seluruh tabel', async () => {
    const toArray = vi.spyOn(db.dailyProductSales, 'toArray');
    await getProductSalesInRange(range30());
    expect(toArray).not.toHaveBeenCalled();
  });

  it('data cukup: penjualan pertama 60 hari lalu', async () => {
    expect(await getAnalysisReadiness(TODAY)).toEqual({ ready: true, daysOfData: 61 });
  });
});

describe('kesiapan analisis (data minimal 7 hari)', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function sellAt(daysAgo: number) {
    const product = await findProductBySku('SBK-001');
    await createSaleAt(
      {
        items: [{ productId: product.id, quantity: 1, discount: 0 }],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      new Date(2026, 9, 3 - daysAgo, 9, 0),
    );
  }

  it('belum ada penjualan: 0 hari dan belum siap', async () => {
    expect(await getAnalysisReadiness(TODAY)).toEqual({ ready: false, daysOfData: 0 });
  });

  it('penjualan pertama 3 hari lalu: 4 hari (hari ini dihitung), belum siap', async () => {
    await sellAt(3);
    expect(await getAnalysisReadiness(TODAY)).toEqual({ ready: false, daysOfData: 4 });
  });

  it('penjualan pertama 6 hari lalu: 7 hari, siap; 5 hari lalu: 6 hari, belum', async () => {
    await sellAt(5);
    expect((await getAnalysisReadiness(TODAY)).ready).toBe(false);
    await sellAt(6);
    expect(await getAnalysisReadiness(TODAY)).toEqual({ ready: true, daysOfData: 7 });
  });

  it('transaksi yang dibatalkan tidak dihitung sebagai penjualan pertama', async () => {
    const product = await findProductBySku('SBK-001');
    const sale = await createSaleAt(
      {
        items: [{ productId: product.id, quantity: 1, discount: 0 }],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      new Date(2026, 9, 3 - 6, 9, 0),
    );
    expect((await getAnalysisReadiness(TODAY)).ready).toBe(true);

    await cancelSale(sale.id, 'Salah input');
    expect(await getAnalysisReadiness(TODAY)).toEqual({ ready: false, daysOfData: 0 });
  });

  it('computeReadiness tanpa tanggal penjualan: 0 hari', () => {
    expect(computeReadiness(null, TODAY)).toEqual({ ready: false, daysOfData: 0 });
  });
});

describe('describeDaysUntilOut', () => {
  it('sudah habis, kurang dari 1 hari, dan dibulatkan', () => {
    expect(describeDaysUntilOut(0)).toBe('Sudah habis');
    expect(describeDaysUntilOut(0.4)).toBe('kurang dari 1 hari');
    expect(describeDaysUntilOut(2.8)).toBe('sekitar 3 hari');
    expect(describeDaysUntilOut(8.4)).toBe('sekitar 8 hari');
  });
});
