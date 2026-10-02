import { describe, expect, it } from 'vitest';

import { SEED_AS_PRODUCTS as products } from '../../test/seed-products';
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
