import { describe, expect, it } from 'vitest';

import { getStockValue } from './stock-value';

describe('getStockValue', () => {
  it('stok positif: stok × harga beli', () => {
    expect(getStockValue(22, 68_000)).toBe(1_496_000);
  });

  it('stok 0: nol', () => {
    expect(getStockValue(0, 68_000)).toBe(0);
  });

  it('stok minus dihitung 0, bukan negatif', () => {
    expect(getStockValue(-3, 68_000)).toBe(0);
  });
});
