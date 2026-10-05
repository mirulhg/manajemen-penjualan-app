import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db/database';
import { productSchema, stockMovementSchema } from '../../lib/db/records';
import { resetDatabaseWithSeed } from '../../test/reset-database';
import { seedLoadTest } from '../sales/seed-load-test';
import { getStockMovementReport } from './api/get-stock-movement-report';
import { getStockReport } from './api/get-stock-report';

const NOW = new Date(2026, 9, 3, 10, 0, 0);
const LAST_MONTH = { period: 'bulan-lalu' as const, from: null, to: null };

async function clearAll() {
  await resetDatabaseWithSeed();
  await db.products.clear();
  await db.stockMovements.clear();
  await db.categories.clear();
  await db.counters.clear();
  await db.stockAlerts.clear();
}

describe('uji beban laporan pergerakan stok', () => {
  beforeEach(clearAll);

  it('2.000 barang dan ±15.000 pergerakan penjualan di bulan lalu: laporan < 5 detik', async () => {
    // Data dibuat langsung (bukan lewat createSaleAt, yang di fake-indexeddb terlalu lambat untuk 10.000 transaksi):
    // yang diukur di sini adalah pembacaan dan penghitungan laporan, bukan pembuatan transaksi.
    const openedAt = new Date(2026, 7, 31).toISOString();
    const products = Array.from({ length: 2000 }, (_, index) =>
      productSchema.parse({
        id: crypto.randomUUID(),
        sku: `GEN-${String(index + 1).padStart(4, '0')}`,
        name: `Barang Uji ${String(index + 1).padStart(4, '0')}`,
        category: 'Uji',
        unit: 'pcs',
        stockQuantity: 100,
        minStock: null,
        purchasePrice: 1000,
        sellingPrice: 1500,
        createdAt: openedAt,
        updatedAt: openedAt,
        archivedAt: null,
      }),
    );
    const movements = products.map((product, index) =>
      stockMovementSchema.parse({
        id: crypto.randomUUID(),
        seq: index + 1,
        productId: product.id,
        type: 'awal',
        quantityBefore: 0,
        quantityAfter: 100 + 8,
        reason: 'Stok awal',
        actor: 'Pemilik',
        createdAt: openedAt,
      }),
    );
    // 15.000 penjualan, 1 unit, tersebar di seluruh September; stok akhir tiap barang = 108 - terjual.
    const soldBy = new Map<string, number>();
    for (let index = 0; index < 15_000; index += 1) {
      const product = products[(index * 37) % products.length];
      if (!product) throw new Error('Produk uji tidak ada');
      const before = 108 - (soldBy.get(product.id) ?? 0);
      soldBy.set(product.id, (soldBy.get(product.id) ?? 0) + 1);
      movements.push(
        stockMovementSchema.parse({
          id: crypto.randomUUID(),
          seq: 2001 + index,
          productId: product.id,
          type: 'jual',
          quantityBefore: before,
          quantityAfter: before - 1,
          reason: 'Penjualan uji',
          actor: 'Pemilik',
          createdAt: new Date(2026, 8, 1 + (index % 30), 8 + (index % 12), index % 60).toISOString(),
        }),
      );
    }
    await db.products.bulkAdd(products.map((product) => ({ ...product, stockQuantity: 108 - (soldBy.get(product.id) ?? 0) })));
    await db.stockMovements.bulkAdd(movements);

    const start = performance.now();
    const report = await getStockMovementReport(LAST_MONTH, NOW);
    const elapsed = performance.now() - start;

    expect(report.rows).toHaveLength(2000);
    expect(report.summary).toMatchObject({ opening: 2000 * 108, sold: 15_000, closing: 2000 * 108 - 15_000 });
    expect(report.summary.closing).toBe((await getStockReport('2026-09-30', NOW)).summary.totalUnits);
    expect(elapsed).toBeLessThan(5000);
    // Dibaca dari keluaran test: angka kinerja untuk laporan akhir.
    process.stdout.write(`\n[uji beban] laporan pergerakan stok 2.000 barang, 17.000 pergerakan: ${Math.round(elapsed)} ms\n`);
  }, 120_000);
});

describe('seedLoadTest (skala kecil)', () => {
  beforeEach(clearAll);

  it('2.000 barang, transaksi di bulan lalu lewat createSaleAt, stok tidak minus, dan seed kedua dilewati', async () => {
    const start = performance.now();
    const result = await seedLoadTest(NOW, () => undefined, 150);
    const elapsed = performance.now() - start;

    expect(result).toMatchObject({ productCount: 2000, saleCount: 150 });
    expect(await db.sales.count()).toBe(150);
    expect((await db.products.toArray()).every((product) => product.stockQuantity >= 0)).toBe(true);
    expect(await seedLoadTest(NOW, () => undefined, 150)).toBeNull();

    const report = await getStockMovementReport(LAST_MONTH, NOW);
    const soldUnits = (await db.saleItems.toArray()).reduce((sum, item) => sum + item.quantity, 0);
    expect(report.summary).toMatchObject({ incoming: 0, returned: 0, sold: soldUnits });
    expect(report.summary.opening - report.summary.sold).toBe(report.summary.closing);
    process.stdout.write(`\n[uji beban] seed 2.000 barang + 150 transaksi di fake-indexeddb: ${Math.round(elapsed)} ms\n`);
  }, 300_000);
});
