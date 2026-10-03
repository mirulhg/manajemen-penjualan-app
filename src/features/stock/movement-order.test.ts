import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { adjustStock } from './api/adjust-stock';
import { getStockMovements } from './api/get-stock-movements';

const REPETITIONS = 20;

describe('urutan pergerakan stok', () => {
  beforeEach(resetDatabaseWithSeed);

  // Diulang 20 kali dalam satu file: dulu urutan ini kadang terbalik karena createdAt bisa sama.
  it.each(Array.from({ length: REPETITIONS }, (_, index) => index + 1))(
    'dua penyesuaian bersamaan #%i: seq berurutan dan seq lebih besar tampil di atas riwayat',
    async () => {
      const product = await findProductBySku('SBK-001');

      await Promise.all([
        adjustStock(product.id, { type: 'masuk', quantity: '5', reason: 'Kiriman pertama' }),
        adjustStock(product.id, { type: 'masuk', quantity: '3', reason: 'Kiriman kedua' }),
      ]);

      const history = await getStockMovements(product.id, 1);
      expect(history.total).toBe(3);
      const [newest, middle, oldest] = history.items;
      // seq berlaku global (bukan per produk): hanya dua penyesuaian bersamaan ini yang harus berurutan rapat.
      expect(newest?.seq).toBe((middle?.seq ?? 0) + 1);
      expect(oldest?.type).toBe('awal');
      expect(oldest?.seq).toBeLessThan(middle?.seq ?? 0);
      // Rantai jumlah bersambung dari yang paling baru ke yang paling lama.
      expect(newest?.quantityBefore).toBe(middle?.quantityAfter);
      expect(middle?.quantityBefore).toBe(oldest?.quantityAfter);
      expect(newest?.quantityAfter).toBe(26);
      expect((await db.counters.get('stockMovement'))?.value).toBe(newest?.seq);
    },
  );

  it('penyesuaian yang gagal tidak menghabiskan nomor urut', async () => {
    const product = await findProductBySku('MND-003');
    const before = (await db.counters.get('stockMovement'))?.value;

    await expect(
      adjustStock(product.id, { type: 'koreksi', quantity: '0', reason: 'Hasil stock opname' }),
    ).rejects.toMatchObject({ code: 'NO_CHANGE' });

    expect((await db.counters.get('stockMovement'))?.value).toBe(before);
  });
});
