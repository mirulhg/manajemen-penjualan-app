import Dexie from 'dexie';

import { db } from './database';
import { productSchema, stockAlertSchema } from './records';
import type { Product, StockAlert } from './records';
import { z } from 'zod';

import { getDefaultMinStock } from './settings';
import { planAlertChanges } from './stock-alerts-rows';
import { MAX_DEFAULT_MIN_STOCK, MIN_DEFAULT_MIN_STOCK } from './stock-status';

const stockAlertSettingSchema = z.number().int().min(MIN_DEFAULT_MIN_STOCK).max(MAX_DEFAULT_MIN_STOCK);

export const STOCK_ALERTS_QUERY_KEY = ['stock-alerts'] as const;

// Di atas ini, membaca semua peringatan terbuka sekali lebih murah daripada satu permintaan per produk (anyOf lambat).
const POINT_LOOKUP_MAX_PRODUCTS = 50;

function assertInAlertTransaction(): void {
  const names = Dexie.currentTransaction?.storeNames ?? [];
  if (!['stockAlerts', 'products', 'settings'].every((name) => names.includes(name))) {
    throw new Error('syncStockAlerts harus dipanggil di dalam transaksi yang mencakup stockAlerts, products, dan settings.');
  }
}

async function readOpenAlerts(productIds: string[] | 'all'): Promise<StockAlert[]> {
  const rows =
    productIds === 'all' || productIds.length > POINT_LOOKUP_MAX_PRODUCTS
      ? await db.stockAlerts.where('isOpen').equals(1).toArray()
      : await db.stockAlerts
          .where('[productId+isOpen]')
          .anyOf(productIds.map((id) => [id, 1]))
          .toArray();
  const alerts = stockAlertSchema.array().parse(rows);
  return productIds === 'all' ? alerts : alerts.filter((alert) => productIds.includes(alert.productId));
}

// Mengevaluasi ulang peringatan untuk produk yang stok, batas, atau status arsipnya baru berubah. WAJIB dipanggil di dalam
// transaksi penulis yang sama (cek seperti nextSequences), supaya peringatan tidak pernah tertinggal dari stoknya.
export async function syncStockAlerts(target: string[] | 'all', nowIso = new Date().toISOString()): Promise<void> {
  assertInAlertTransaction();
  if (target !== 'all' && target.length === 0) return;

  const rows = target === 'all' ? await db.products.toArray() : (await db.products.bulkGet(target)).flatMap((row) => (row ? [row] : []));
  const products: Product[] = productSchema.array().parse(rows);
  const changes = planAlertChanges(products, await readOpenAlerts(target), await getDefaultMinStock(), nowIso);
  if (changes.length > 0) await db.stockAlerts.bulkPut(stockAlertSchema.array().parse(changes));
}

export type OpenAlert = { alert: StockAlert; product: Product };

// Habis di atas Menipis, lalu yang terbaru dulu.
export async function getOpenAlerts(): Promise<OpenAlert[]> {
  const alerts = stockAlertSchema.array().parse(await db.stockAlerts.where('isOpen').equals(1).toArray());
  const rows = await db.products.bulkGet(alerts.map((alert) => alert.productId));
  const open: OpenAlert[] = alerts.flatMap((alert, index) => {
    const row = rows[index];
    return row ? [{ alert, product: productSchema.parse(row) }] : [];
  });
  const levelOrder = { habis: 0, menipis: 1 } as const;
  return open.sort(
    (a, b) =>
      levelOrder[a.alert.level] - levelOrder[b.alert.level] || b.alert.openedAt.localeCompare(a.alert.openedAt),
  );
}

export async function getUnreadAlertCount(): Promise<number> {
  const alerts = stockAlertSchema.array().parse(await db.stockAlerts.where('isOpen').equals(1).toArray());
  return alerts.filter((alert) => alert.readAt === null).length;
}

export async function markAllAlertsRead(nowIso = new Date().toISOString()): Promise<void> {
  await db.stockAlerts
    .where('isOpen')
    .equals(1)
    .filter((alert) => alert.readAt === null)
    .modify({ readAt: nowIso });
}

// Mengubah batas default mengevaluasi SEMUA produk, dalam satu transaksi dengan penyimpanan pengaturannya.
export async function setDefaultMinStock(value: number): Promise<void> {
  const parsed = stockAlertSettingSchema.parse(value);
  await db.transaction('rw', db.settings, db.products, db.stockAlerts, async () => {
    await db.settings.put({ key: 'defaultMinStock', value: parsed });
    await syncStockAlerts('all');
  });
}
