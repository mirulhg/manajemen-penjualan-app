import { db } from '../../lib/db/database';
import type { Setting } from '../../lib/db/records';
import { verifySecret } from '../session';
import { DemoDataError, DEMO_TABLES } from './demo-tables';

// PIN contoh hanya ikut dihapus bila masih PIN contoh; PIN yang sudah diganti pemilik tidak disentuh.
export async function isDemoPinStillActive(): Promise<boolean> {
  const [demoPin, ownerPin] = await Promise.all([db.settings.get('demoPin'), db.settings.get('ownerPin')]);
  if (demoPin?.key !== 'demoPin' || ownerPin?.key !== 'ownerPin') return false;
  return verifySecret(demoPin.value, ownerPin.value);
}

// Mengembalikan database ke kosong. Semua barang dan transaksi ikut terhapus, termasuk yang ditambahkan setelah data contoh dimuat.
export async function clearDemoData(): Promise<void> {
  // Diperiksa sebelum transaksi: verifySecret memakai crypto.subtle.
  const shouldRemovePin = await isDemoPinStillActive();

  await db.transaction('rw', DEMO_TABLES, async () => {
    if ((await db.settings.get('isDemo'))?.value !== true) throw new DemoDataError('NOT_DEMO');

    await Promise.all([
      db.products.clear(),
      db.stockMovements.clear(),
      db.counters.clear(),
      db.categories.clear(),
      db.sales.clear(),
      db.saleItems.clear(),
      db.saleReturns.clear(),
      db.priceChanges.clear(),
      db.productPhotos.clear(),
      db.dailySales.clear(),
      db.dailyProductSales.clear(),
      db.stockAlerts.clear(),
    ]);
    const keys: Setting['key'][] = ['isDemo', 'demoPin'];
    if (shouldRemovePin) keys.push('ownerPin', 'recoveryCode', 'pinAttempts');
    await db.settings.bulkDelete(keys);
  });
}
