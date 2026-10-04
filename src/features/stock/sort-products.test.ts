import { afterEach, describe, expect, it, vi } from 'vitest';

import { SEED_AS_PRODUCTS as products } from '../../test/seed-products';
import { db } from '../../lib/db/database';
import { adjustStock } from './api/adjust-stock';
import { getProducts } from './api/get-products';
import { filterProducts } from './filter-products';
import { seedSampleProducts } from './seed';
import { sortProducts } from './sort-products';

describe('sortProducts', () => {
  it('nama: A–Z, dari Air Mineral sampai Tisu Wajah', () => {
    const result = sortProducts(products, 'nama');
    expect(result).toHaveLength(30);
    expect(result[0]?.name).toBe('Air Mineral 600 ml');
    expect(result.at(-1)?.name).toBe('Tisu Wajah 250 lembar');
  });

  it('tidak mengubah array asal', () => {
    const before = products.map((product) => product.sku);
    sortProducts(products, 'stok-banyak');
    expect(products.map((product) => product.sku)).toEqual(before);
  });
});

describe('sortProducts: mode lain', () => {
  it('stok-sedikit: empat teratas stok 0, urut nama', () => {
    const top = sortProducts(products, 'stok-sedikit').slice(0, 4);
    expect(top.map((product) => product.name)).toEqual([
      'Pasta Gigi 190 g',
      'Roti Tawar',
      'Teh Siap Minum 350 ml',
      'Telur Ayam 1 kg',
    ]);
  });

  it('stok-banyak: Mi Instan Goreng (60) paling atas', () => {
    expect(sortProducts(products, 'stok-banyak')[0]?.name).toBe('Mi Instan Goreng');
  });

  it('terbaru: updatedAt terbaru di atas, seri jatuh ke nama', () => {
    const beras = products.find((product) => product.sku === 'SBK-001');
    if (!beras) throw new Error('SBK-001 tidak ada di seed');
    const updated = products.map((product) =>
      product.id === beras.id ? { ...product, updatedAt: '2026-10-03T00:00:00.000Z' } : product,
    );

    const result = sortProducts(updated, 'terbaru');
    expect(result[0]?.name).toBe('Beras Premium 5 kg');
    expect(result[1]?.name).toBe('Air Mineral 600 ml');
  });

  it('digabung dengan filter status menipis + stok-sedikit', () => {
    const menipis = filterProducts(products, { query: null, category: null, status: 'menipis', sort: 'nama', archived: false }, 5);

    expect(sortProducts(menipis, 'stok-sedikit').map((product) => product.name)).toEqual([
      'Penyedap Rasa 100 g',
      'Keripik Singkong 150 g',
      'Minyak Goreng 2 L',
      'Gas LPG 3 kg',
      'Teh Celup isi 25',
      'Susu Kental Manis 370 g',
      'Sabun Cuci Piring 780 ml',
      'Mi Instan Kuah Ayam',
    ]);
  });
});

describe('sortProducts: setelah penyesuaian nyata', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('terbaru: Beras Premium naik ke urutan pertama setelah adjustStock', async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await seedSampleProducts();
    const beras = await db.products.where('sku').equals('SBK-001').first();
    if (!beras) throw new Error('SBK-001 tidak ada di seed');

    // Date dimajukan agar updatedAt pasti lebih baru dari waktu seed, bukan kebetulan milidetik yang sama.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(Date.now() + 60_000));
    await adjustStock(beras.id, { type: 'masuk', quantity: '7', reason: 'Kiriman supplier' });

    const result = sortProducts(await getProducts(), 'terbaru');
    expect(result[0]?.name).toBe('Beras Premium 5 kg');
  });
});
