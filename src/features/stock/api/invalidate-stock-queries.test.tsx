// @vitest-environment jsdom
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { invalidateProductData, invalidateStockQueries } from './invalidate-stock-queries';

function setup() {
  const queryClient = new QueryClient();
  const keys = {
    products: ['products'],
    analytics: ['product-analytics', 'forecast', '2026-10-03'],
    revenueByCategory: ['revenue-by-category', '2026-10-01', '2026-10-04'],
    movements: ['stock-movements', 'x', 1],
    dailySales: ['daily-sales'],
  };
  for (const key of Object.values(keys)) queryClient.setQueryData(key, []);
  const isInvalidated = (key: readonly unknown[]) => queryClient.getQueryState(key)?.isInvalidated;
  return { queryClient, keys, isInvalidated };
}

describe('invalidateProductData', () => {
  it('menandai daftar produk, analisis produk, dan omzet per kategori basi, tanpa menyentuh yang lain', async () => {
    const { queryClient, keys, isInvalidated } = setup();

    await invalidateProductData(queryClient);

    expect(isInvalidated(keys.products)).toBe(true);
    expect(isInvalidated(keys.analytics)).toBe(true);
    expect(isInvalidated(keys.revenueByCategory)).toBe(true);
    expect(isInvalidated(keys.movements)).toBe(false);
    expect(isInvalidated(keys.dailySales)).toBe(false);
  });
});

describe('invalidateStockQueries (jalur penjualan, retur, batal)', () => {
  it('juga menandai analisis produk dan riwayat pergerakan basi', async () => {
    const { queryClient, keys, isInvalidated } = setup();

    await invalidateStockQueries(queryClient);

    expect(isInvalidated(keys.products)).toBe(true);
    expect(isInvalidated(keys.analytics)).toBe(true);
    expect(isInvalidated(keys.movements)).toBe(true);
  });
});
