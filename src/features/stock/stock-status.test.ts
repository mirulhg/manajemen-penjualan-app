import { describe, expect, it } from 'vitest';

import { getStockStatus } from './stock-status';

describe('getStockStatus', () => {
  it('stok minus dianggap habis', () => {
    expect(getStockStatus(-1, null, 5)).toBe('habis');
    expect(getStockStatus(-3, 6, 5)).toBe('habis');
  });

  it('stok 0 selalu habis', () => {
    expect(getStockStatus(0, 6, 5)).toBe('habis');
    expect(getStockStatus(0, null, 5)).toBe('habis');
  });

  it('stok tepat di batas minimum dianggap menipis', () => {
    expect(getStockStatus(6, 6, 5)).toBe('menipis');
  });

  it('stok di atas batas minimum dianggap aman', () => {
    expect(getStockStatus(6, 5, 5)).toBe('aman');
  });

  it('batas kosong memakai default 5', () => {
    expect(getStockStatus(4, null, 5)).toBe('menipis');
    expect(getStockStatus(5, null, 5)).toBe('menipis');
    expect(getStockStatus(12, null, 5)).toBe('aman');
  });
});
