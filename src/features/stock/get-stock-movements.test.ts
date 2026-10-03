import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { adjustStock } from './api/adjust-stock';
import { getStockMovements } from './api/get-stock-movements';
import { seedSampleProducts } from './seed';
import type { StockMovement } from './schema';

async function idOf(sku: string): Promise<string> {
  const product = await db.products.where('sku').equals(sku).first();
  if (!product) throw new Error(`Produk ${sku} tidak ada di seed`);
  return product.id;
}

describe('getStockMovements', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await seedSampleProducts();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('terbaru di indeks 0 dan total sesuai setelah dua penyesuaian', async () => {
    const productId = await idOf('SBK-001');
    // Hanya Date yang dipalsukan: dua penyesuaian beruntun tidak boleh berbagi milidetik yang sama.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2030-01-01T10:00:00.000Z'));
    await adjustStock(productId, { type: 'masuk', quantity: '5', reason: 'Kiriman pertama' });
    vi.setSystemTime(new Date('2030-01-01T11:00:00.000Z'));
    await adjustStock(productId, { type: 'koreksi', quantity: '20', reason: 'Hasil stock opname' });

    const result = await getStockMovements(productId, 1);

    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toMatchObject({ type: 'koreksi', quantityBefore: 23, quantityAfter: 20 });
    expect(result.items[2]?.type).toBe('awal');
  });

  it('hanya mengembalikan pergerakan milik produk yang diminta', async () => {
    const result = await getStockMovements(await idOf('SBK-002'), 1);
    expect(result.total).toBe(1);
    expect(result.items[0]?.type).toBe('awal');
  });

  it('120 pergerakan: halaman 1 berisi 50, halaman 3 berisi 20', async () => {
    const productId = await idOf('SBK-001');
    const extra: StockMovement[] = Array.from({ length: 119 }, (_, index) => ({
      id: crypto.randomUUID(),
      seq: 1000 + index + 1,
      productId,
      type: 'masuk',
      quantityBefore: index,
      quantityAfter: index + 1,
      reason: 'Data uji',
      actor: 'Pemilik',
      createdAt: new Date(Date.UTC(2031, 0, 1, 0, 0, index + 1)).toISOString(),
    }));
    await db.stockMovements.bulkAdd(extra);

    const first = await getStockMovements(productId, 1);
    const third = await getStockMovements(productId, 3);

    expect(first.total).toBe(120);
    expect(first.pageCount).toBe(3);
    expect(first.items).toHaveLength(50);
    expect(first.items[0]?.quantityAfter).toBe(119);
    expect(third.items).toHaveLength(20);
    expect(third.items.at(-1)?.type).toBe('awal');
  });

  it('halaman di luar jangkauan kembali ke halaman 1', async () => {
    const result = await getStockMovements(await idOf('SBK-001'), 999);
    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(1);
  });
});
