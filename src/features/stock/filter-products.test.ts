import { describe, expect, it } from 'vitest';

import { filterProducts, normalizeFilters } from './filter-products';
import type { StockFilters } from './parse-filter-params';
import { SEED_AS_PRODUCTS as products } from '../../test/seed-products';

const NO_FILTER: StockFilters = { query: null, category: null, status: null, sort: 'nama', archived: false };

function search(overrides: Partial<StockFilters>) {
  return filterProducts(products, { ...NO_FILTER, ...overrides });
}

describe('filterProducts', () => {
  it('mencari berdasarkan nama tanpa peka huruf besar/kecil', () => {
    expect(search({ query: 'mi instan' })).toHaveLength(2);
    expect(search({ query: 'sabun' })).toHaveLength(2);
    expect(search({ query: 'air mineral' })).toHaveLength(2);
  });

  it('mengabaikan spasi di awal dan akhir kata kunci', () => {
    expect(search({ query: '  SABUN  ' })).toHaveLength(2);
  });

  it('mencari berdasarkan SKU', () => {
    expect(search({ query: 'MKR' })).toHaveLength(5);
    expect(search({ query: 'mnd-003' }).map((product) => product.name)).toEqual([
      'Pasta Gigi 190 g',
    ]);
  });

  it('menggabungkan kategori dan status', () => {
    const result = search({ category: 'Sembako', status: 'habis' });
    expect(result.map((product) => product.name)).toEqual(['Telur Ayam 1 kg']);
  });

  it('menyaring berdasarkan status', () => {
    expect(search({ status: 'menipis' })).toHaveLength(8);
    expect(search({ status: 'habis' })).toHaveLength(4);
    expect(search({ status: 'aman' })).toHaveLength(18);
  });

  it('tanpa filter mengembalikan semua produk', () => {
    expect(search({})).toHaveLength(30);
  });

  it('tidak mengubah array asal', () => {
    const before = products.map((product) => product.sku);
    search({});
    expect(products.map((product) => product.sku)).toEqual(before);
  });
});

describe('normalizeFilters', () => {
  const categories = ['Bumbu Dapur', 'Kebutuhan Rumah', 'Makanan Ringan', 'Minuman', 'Perlengkapan Mandi', 'Sembako'];

  it('mengubah kategori yang tidak dikenal menjadi null', () => {
    const result = normalizeFilters({ ...NO_FILTER, category: 'ngawur' }, categories);
    expect(result.category).toBeNull();
  });

  it('mempertahankan kategori valid dan filter lainnya', () => {
    const filters: StockFilters = { query: 'mi', category: 'Sembako', status: 'habis', sort: 'nama', archived: false };
    expect(normalizeFilters(filters, categories)).toEqual(filters);
  });
});
