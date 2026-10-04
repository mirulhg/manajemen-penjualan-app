import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adjustStock } from '../../features/stock/api/adjust-stock';
import { archiveProduct } from '../../features/stock/api/archive-product';
import { cancelSale } from '../../features/sales/api/cancel-sale';
import { createSale } from '../../features/sales/api/create-sale';
import { returnSaleItems } from '../../features/sales/api/return-sale-items';
import { updateProduct } from '../../features/stock/api/update-product';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { db } from './database';
import { productSchema, stockAlertSchema } from './records';
import { getOpenAlerts, getUnreadAlertCount, markAllAlertsRead, setDefaultMinStock, syncStockAlerts } from './stock-alerts';
import { getStockStatus } from './stock-status';

async function sell(sku: string, quantity: number) {
  const product = await findProductBySku(sku);
  return createSale({
    items: [{ productId: product.id, quantity, discount: 0 }],
    paymentMethod: 'transfer',
    transactionDiscount: 0,
    expectedTotal: product.sellingPrice * quantity,
  });
}

async function alertsOf(sku: string) {
  const product = await findProductBySku(sku);
  const rows = await db.stockAlerts.where('productId').equals(product.id).toArray();
  return stockAlertSchema.array().parse(rows).sort((a, b) => a.openedAt.localeCompare(b.openedAt));
}

describe('peringatan stok pada seed', () => {
  beforeEach(resetDatabaseWithSeed);

  it('12 peringatan terbuka belum dibaca: 4 habis dan 8 menipis', async () => {
    const open = await getOpenAlerts();

    expect(open).toHaveLength(12);
    expect(await getUnreadAlertCount()).toBe(12);
    expect(open.filter((entry) => entry.alert.level === 'habis').map((entry) => entry.product.name).sort()).toEqual([
      'Pasta Gigi 190 g',
      'Roti Tawar',
      'Teh Siap Minum 350 ml',
      'Telur Ayam 1 kg',
    ]);
    expect(open.filter((entry) => entry.alert.level === 'menipis')).toHaveLength(8);
    // Habis di atas Menipis.
    expect(open.slice(0, 4).every((entry) => entry.alert.level === 'habis')).toBe(true);
  });
});

describe('episode peringatan: tidak dinotifikasi ulang sebelum stok naik di atas batas lalu turun lagi', () => {
  beforeEach(resetDatabaseWithSeed);

  it('Gula Pasir 1 kg (stok 25, batas 10): satu episode sampai stok kembali aman', async () => {
    await markAllAlertsRead();
    expect(await getUnreadAlertCount()).toBe(0);

    await sell('SBK-003', 16); // 25 -> 9
    expect(await alertsOf('SBK-003')).toMatchObject([{ level: 'menipis', isOpen: 1, readAt: null }]);
    expect(await getUnreadAlertCount()).toBe(1);

    await sell('SBK-003', 1); // 9 -> 8: tetap menipis, tidak ada notifikasi baru
    expect(await alertsOf('SBK-003')).toHaveLength(1);
    expect(await getUnreadAlertCount()).toBe(1);

    await markAllAlertsRead();
    await sell('SBK-003', 8); // 8 -> 0: level naik ke habis dan belum dibaca lagi
    expect(await alertsOf('SBK-003')).toMatchObject([{ level: 'habis', isOpen: 1, readAt: null }]);
    expect(await getUnreadAlertCount()).toBe(1);

    const gula = await findProductBySku('SBK-003');
    await adjustStock(gula.id, { type: 'masuk', quantity: '30', reason: 'Kiriman supplier' }); // 30: aman
    expect(await alertsOf('SBK-003')).toMatchObject([{ isOpen: 0 }]);
    expect(await getUnreadAlertCount()).toBe(0);

    await sell('SBK-003', 21); // 30 -> 9: episode BARU
    const alerts = await alertsOf('SBK-003');
    expect(alerts).toHaveLength(2);
    expect(alerts.map((alert) => alert.isOpen)).toEqual([0, 1]);
    expect(alerts[1]).toMatchObject({ level: 'menipis', readAt: null });
    expect(await getUnreadAlertCount()).toBe(1);
  });

  it('habis -> menipis menurunkan level tanpa notifikasi baru', async () => {
    const telur = await findProductBySku('SBK-005'); // habis (stok 0, batas 5)
    await markAllAlertsRead();

    await adjustStock(telur.id, { type: 'masuk', quantity: '3', reason: 'Kiriman supplier' });

    expect(await alertsOf('SBK-005')).toMatchObject([{ level: 'menipis', isOpen: 1 }]);
    expect(await getUnreadAlertCount()).toBe(0);
  });

  it('retur dan pembatalan yang menaikkan stok di atas batas menutup peringatan', async () => {
    const sale = await sell('SBK-003', 16);
    expect(await alertsOf('SBK-003')).toMatchObject([{ isOpen: 1 }]);
    const items = await db.saleItems.where('saleId').equals(sale.id).toArray();

    await returnSaleItems(sale.id, { items: [{ saleItemId: items[0]?.id ?? '', quantity: 16 }], reason: 'Pembeli batal' });
    expect(await alertsOf('SBK-003')).toMatchObject([{ isOpen: 0 }]);

    const second = await sell('SBK-003', 16);
    expect((await alertsOf('SBK-003')).map((alert) => alert.isOpen)).toEqual([0, 1]);
    await cancelSale(second.id, 'Salah input');
    expect((await alertsOf('SBK-003')).map((alert) => alert.isOpen)).toEqual([0, 0]);
  });

  it('ubah batas minimum Beras 5 -> 20 (stok 18) membuka peringatan; arsip menutupnya', async () => {
    const beras = await findProductBySku('SBK-001');
    expect(await alertsOf('SBK-001')).toHaveLength(0);

    await updateProduct(beras.id, {
      name: 'Beras Premium 5 kg',
      sku: 'SBK-001',
      category: 'Sembako',
      unit: 'sak',
      minStock: '20',
      purchasePrice: '68.000',
      sellingPrice: '74.000',
    });
    expect(await alertsOf('SBK-001')).toMatchObject([{ level: 'menipis', isOpen: 1 }]);

    await archiveProduct(beras.id);
    expect(await alertsOf('SBK-001')).toMatchObject([{ isOpen: 0 }]);
  });
});

describe('batas default dari pengaturan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('10: Aman 15, Menipis 11, Habis 4 dengan tiga peringatan baru; kembali ke 5 menutup ketiganya', async () => {
    await setDefaultMinStock(10);

    const products = productSchema.array().parse(await db.products.toArray());
    const counts = { aman: 0, menipis: 0, habis: 0 };
    for (const product of products) counts[getStockStatus(product.stockQuantity, product.minStock, 10)] += 1;
    expect(counts).toEqual({ aman: 15, menipis: 11, habis: 4 });

    const open = await getOpenAlerts();
    expect(open).toHaveLength(15);
    for (const sku of ['MKR-003', 'BMB-002', 'MND-002']) {
      expect(await alertsOf(sku)).toMatchObject([{ level: 'menipis', isOpen: 1 }]);
    }

    await setDefaultMinStock(5);
    expect(await getOpenAlerts()).toHaveLength(12);
    for (const sku of ['MKR-003', 'BMB-002', 'MND-002']) {
      expect(await alertsOf(sku)).toMatchObject([{ isOpen: 0 }]);
    }
  });

  it('nilai di luar 1-1000 atau bukan bilangan bulat ditolak tanpa mengubah apa pun', async () => {
    for (const bad of [0, 1001, 2.5, -3]) {
      await expect(setDefaultMinStock(bad)).rejects.toThrow();
    }
    expect(await db.settings.get('defaultMinStock')).toBeUndefined();
    expect(await getOpenAlerts()).toHaveLength(12);
  });
});

describe('integritas peringatan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('syncStockAlerts di luar transaksi ditolak', async () => {
    await expect(syncStockAlerts('all')).rejects.toThrow(/dalam transaksi/);
  });

  it('atomisitas: peringatan gagal ditulis di dalam createSale, penjualannya ikut batal', async () => {
    const gula = await findProductBySku('SBK-003');
    const spy = vi.spyOn(db.stockAlerts, 'bulkPut').mockRejectedValueOnce(new Error('gagal menulis peringatan'));

    await expect(sell('SBK-003', 16)).rejects.toThrow('gagal menulis peringatan');
    spy.mockRestore();

    expect((await findProductBySku('SBK-003')).stockQuantity).toBe(gula.stockQuantity);
    expect(await db.sales.count()).toBe(0);
    expect(await alertsOf('SBK-003')).toHaveLength(0);
  });
});
