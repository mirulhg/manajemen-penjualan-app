import { db } from '../lib/db/database';
import { seedSampleProducts } from '../features/stock/seed';

// Mengembalikan database test ke 30 produk contoh, termasuk penghitung nomor urut.
export async function resetDatabaseWithSeed() {
  await db.products.clear();
  await db.stockMovements.clear();
  await db.counters.clear();
  await db.sales.clear();
  await db.saleItems.clear();
  await db.saleReturns.clear();
  await db.dailySales.clear();
  await db.dailyProductSales.clear();
  await db.stockAlerts.clear();
  await db.priceChanges.clear();
  await db.productPhotos.clear();
  await db.categories.clear();
  await db.settings.clear();
  await seedSampleProducts();
}

export async function findProductBySku(sku: string) {
  const product = await db.products.where('sku').equals(sku).first();
  if (!product) throw new Error(`Produk ${sku} tidak ada di seed`);
  return product;
}
