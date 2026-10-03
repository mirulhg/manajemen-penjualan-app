import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../../lib/db/database';
import { MIXED_IMPORT_CSV } from '../../../test/import-sample';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { parseCsv } from '../../../utils/parse-csv';
import { createProduct } from '../api/create-product';
import { getProducts } from '../api/get-products';
import { getStockSummary } from '../stock-summary';
import { importProducts } from './import-products';
import { toImportRows } from './to-import-rows';
import { validateImportRows } from './validate-import-rows';
import type { ReadyImportRow } from './validate-import-rows';

async function readyMixedRows(): Promise<ReadyImportRow[]> {
  const existing = await getProducts();
  return validateImportRows(toImportRows(parseCsv(MIXED_IMPORT_CSV)), existing).ready;
}

function generatedRows(count: number): ReadyImportRow[] {
  const header = ['SKU', 'Nama', 'Kategori', 'Satuan', 'Stok Awal', 'Batas Minimum', 'Harga Beli', 'Harga Jual'];
  const body = Array.from({ length: count }, (_, index) => [
    `GEN-${index + 1}`,
    `Barang Uji ${index + 1}`,
    `Kategori ${(index % 10) + 1}`,
    'pcs',
    String(index % 50),
    '',
    '1.000',
    '1.500',
  ]);
  return validateImportRows(toImportRows([header, ...body]), []).ready;
}

describe('importProducts', () => {
  beforeEach(resetDatabaseWithSeed);

  it('dari seed: 38 produk, kategori Alat Tulis baru, ejaan diseragamkan, ringkasan stok cocok', async () => {
    const result = await importProducts(await readyMixedRows());

    expect(result).toEqual({ imported: 8, skipped: [] });
    const products = await getProducts();
    expect(products).toHaveLength(38);
    expect(await db.categories.count()).toBe(7);
    expect(products.find((product) => product.sku === 'SBK-101')?.category).toBe('Sembako');
    expect(products.find((product) => product.sku === 'RMH-102')).toMatchObject({ unit: 'pcs', stockQuantity: 0 });
    expect(getStockSummary(products)).toEqual({ productCount: 38, totalUnits: 566, stockValue: 4_808_100 });
  });

  it('setiap barang baru punya pergerakan awal dengan seq berurutan, tanpa lubang', async () => {
    const before = await db.stockMovements.count();
    await importProducts(await readyMixedRows());

    const movements = (await db.stockMovements.toArray()).sort((a, b) => a.seq - b.seq);
    const added = movements.slice(before);
    expect(added).toHaveLength(8);
    expect(added.every((movement) => movement.type === 'awal' && movement.actor === 'Pemilik')).toBe(true);
    expect(added.map((movement) => movement.seq)).toEqual(Array.from({ length: 8 }, (_, index) => before + index + 1));
    const pulpen = await db.products.where('sku').equals('ATK-001').first();
    expect(added.find((movement) => movement.productId === pulpen?.id)).toMatchObject({ quantityBefore: 0, quantityAfter: 50 });
  });

  it('diimpor dua kali: kedua kalinya semua dilewati dan jumlah produk tetap', async () => {
    const rows = await readyMixedRows();
    await importProducts(rows);

    const second = await importProducts(rows);

    expect(second.imported).toBe(0);
    expect(second.skipped).toHaveLength(8);
    expect(await db.products.count()).toBe(38);
  });

  it('SKU yang ditambahkan di antara validasi dan impor ikut dilewati, sisanya tetap masuk', async () => {
    const rows = await readyMixedRows();
    await createProduct({
      name: 'Pulpen Lain',
      sku: 'ATK-001',
      category: 'Alat Tulis',
      unit: 'pcs',
      initialStock: '1',
      minStock: '',
      purchasePrice: '1.000',
      sellingPrice: '2.000',
    });

    const result = await importProducts(rows);

    expect(result.imported).toBe(7);
    expect(result.skipped).toEqual([{ rowNumber: 2, sku: 'ATK-001', productName: 'Pulpen Lain' }]);
    expect(await db.products.count()).toBe(38);
  });

  it('gagal di tengah: tidak ada produk baru dan penghitung nomor tidak bergeser', async () => {
    const counterBefore = await db.counters.toArray();
    const spy = vi.spyOn(db.stockMovements, 'bulkAdd').mockRejectedValueOnce(new Error('gagal menulis'));

    await expect(importProducts(await readyMixedRows())).rejects.toThrow('gagal menulis');
    spy.mockRestore();

    expect(await db.products.count()).toBe(30);
    expect(await db.categories.count()).toBe(6);
    expect(await db.stockMovements.count()).toBe(30);
    expect(await db.counters.toArray()).toEqual(counterBefore);
  });

  it('1.000 baris valid tersimpan semuanya, jauh di bawah 30 detik', async () => {
    const rows = generatedRows(1000);
    expect(rows).toHaveLength(1000);

    const start = performance.now();
    const result = await importProducts(rows);
    const elapsedMs = performance.now() - start;

    expect(result.imported).toBe(1000);
    expect(await db.products.count()).toBe(1030);
    expect(await db.stockMovements.count()).toBe(1030);
    expect(await db.categories.count()).toBe(16);
    expect(elapsedMs).toBeLessThan(30_000);
  });
});
