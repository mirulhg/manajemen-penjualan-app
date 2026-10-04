// @vitest-environment jsdom
import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { renderHookWithProviders } from '../../../test/render';
import { stockMovementsPageKey } from './get-stock-movements';
import { useAdjustStock } from './use-adjust-stock';

describe('useAdjustStock: invalidasi cache', () => {
  beforeEach(resetDatabaseWithSeed);

  async function setup() {
    const product = await findProductBySku('MND-003');
    const rendered = renderHookWithProviders(() => useAdjustStock(product.id));
    const keys = [
      ['products'],
      ['products', product.id],
      stockMovementsPageKey(product.id, 1),
      ['product-analytics', 'stock-forecast', '2026-10-03'],
    ];
    for (const key of keys) rendered.queryClient.setQueryData(key, []);
    const isInvalidated = (key: readonly unknown[]) =>
      rendered.queryClient.getQueryState(key)?.isInvalidated;
    return { ...rendered, keys, isInvalidated };
  }

  it('menandai daftar produk, detail, riwayat, dan analisis produk basi setelah mutasi sukses', async () => {
    const { result, keys, isInvalidated } = await setup();
    expect(keys.map(isInvalidated)).toEqual([false, false, false, false]);

    await act(async () => {
      await result.current.mutateAsync({ type: 'masuk', quantity: '3', reason: 'Kiriman supplier' });
    });

    expect(keys.map(isInvalidated)).toEqual([true, true, true, true]);
  });

  it('tetap menandai basi setelah mutasi gagal (barang mungkin sudah berubah)', async () => {
    const { result, keys, isInvalidated } = await setup();

    await act(async () => {
      // MND-003 stoknya 0, jadi koreksi ke 0 ditolak sebagai NO_CHANGE.
      await expect(
        result.current.mutateAsync({ type: 'koreksi', quantity: '0', reason: 'Hasil stock opname' }),
      ).rejects.toMatchObject({ code: 'NO_CHANGE' });
    });

    expect(keys.map(isInvalidated)).toEqual([true, true, true, true]);
  });
});
