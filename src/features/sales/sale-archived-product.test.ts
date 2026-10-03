import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { archiveProduct } from '../stock/api/archive-product';
import { cancelSale } from './api/cancel-sale';
import { createSale } from './api/create-sale';
import { getSaleDetail } from './api/get-sale-detail';
import { returnSaleItems } from './api/return-sale-items';

async function berasSale() {
  const beras = await findProductBySku('SBK-001');
  return {
    items: [{ productId: beras.id, quantity: 2, discount: 0 }],
    paymentMethod: 'transfer' as const,
    transactionDiscount: 0,
    expectedTotal: 148000,
  };
}

describe('barang arsip dan penjualan', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('createSale menolak barang arsip dengan PRODUCT_ARCHIVED dan tidak menyimpan apa pun', async () => {
    const input = await berasSale();
    await archiveProduct((await findProductBySku('SBK-001')).id);
    const counters = await db.counters.toArray();

    const failure = await createSale(input).catch((error: unknown) => error);

    expect(failure).toMatchObject({ code: 'PRODUCT_ARCHIVED' });
    expect(failure instanceof Error ? failure.message : '').toContain('Beras Premium 5 kg');

    expect(await db.sales.count()).toBe(0);
    expect(await db.stockMovements.count()).toBe(30);
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(18);
    expect(await db.counters.toArray()).toEqual(counters);
  });

  it('retur dan batal transaksi lama tetap berhasil setelah barangnya diarsipkan', async () => {
    const sale = await createSale(await berasSale());
    await archiveProduct((await findProductBySku('SBK-001')).id);
    const detail = await getSaleDetail(sale.id);
    const saleItemId = detail?.progress[0]?.item.id ?? '';

    await returnSaleItems(sale.id, { items: [{ saleItemId, quantity: 1 }], reason: 'Kemasan sobek' });
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(17);

    await cancelSale(sale.id, 'Salah input');
    const beras = await findProductBySku('SBK-001');
    expect(beras.stockQuantity).toBe(18);
    expect(beras.archivedAt).not.toBeNull();
  });
});
