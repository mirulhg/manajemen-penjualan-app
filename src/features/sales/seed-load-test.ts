import { db } from '../../lib/db/database';
import { productSchema, stockMovementSchema } from '../../lib/db/records';
import { startOfDay } from '../../utils/date-period';
import { SAMPLE_PRODUCT_SKUS, seedSampleProducts } from '../stock';
import { createSaleAt } from './api/create-sale';
import { LOAD_TEST_SALE_COUNT, planLoadTestSales } from './load-test-plan';

// 30 barang contoh + 1.970 barang hasil generator = 2.000 barang.
const EXTRA_PRODUCTS = 2000 - SAMPLE_PRODUCT_SKUS.length;
const PROGRESS_EVERY = 100;

export type LoadTestResult = { productCount: number; saleCount: number; seconds: number };

// Khusus development (database 'manajemen-stok-uji-beban'). Mengembalikan null bila database itu sudah berisi data.
// Penjualan lewat createSaleAt yang sama dengan kasir, masing-masing dalam transaksinya sendiri.
export async function seedLoadTest(
  now: Date,
  onProgress: (done: number, total: number) => void,
  // Hanya diubah oleh test supaya seed bisa dicoba cepat; aplikasi selalu memakai 10.000.
  saleCount = LOAD_TEST_SALE_COUNT,
): Promise<LoadTestResult | null> {
  const started = performance.now();
  if (!(await seedSampleProducts(EXTRA_PRODUCTS))) return null;

  // Urutan SKU menetapkan indeks barang untuk rencana penjualan.
  const products = productSchema.array().parse(await db.products.toArray()).sort((a, b) => (a.sku < b.sku ? -1 : 1));
  const plan = planLoadTestSales(now, products.length, saleCount);

  const soldByIndex = new Map<number, number>();
  for (const sale of plan) {
    for (const item of sale.items) soldByIndex.set(item.productIndex, (soldByIndex.get(item.productIndex) ?? 0) + item.quantity);
  }

  // Seperti generator penjualan contoh: stok awal dinaikkan sebesar total yang akan terjual (dicatat sehari sebelum bulan lalu),
  // supaya tidak ada penjualan yang ditolak karena stok kurang.
  const openingIso = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1), -1).toISOString();
  await db.transaction('rw', [db.products, db.stockMovements], async () => {
    const openings = new Map(
      stockMovementSchema
        .array()
        .parse(await db.stockMovements.toArray())
        .filter((movement) => movement.type === 'awal')
        .map((movement) => [movement.productId, movement]),
    );
    for (const [index, sold] of soldByIndex) {
      const product = products[index];
      const opening = product && openings.get(product.id);
      if (!product || !opening) throw new Error(`Barang uji ke-${index} atau stok awalnya tidak ada.`);
      await db.products.put({ ...product, stockQuantity: product.stockQuantity + sold, createdAt: openingIso });
      await db.stockMovements.put({ ...opening, quantityAfter: opening.quantityAfter + sold, createdAt: openingIso });
    }
  });

  for (const [done, sale] of plan.entries()) {
    const lines = sale.items.map((item) => {
      const product = products[item.productIndex];
      if (!product) throw new Error(`Barang uji ke-${item.productIndex} tidak ada.`);
      return { productId: product.id, quantity: item.quantity, price: product.sellingPrice };
    });
    const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    await createSaleAt(
      {
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, discount: 0 })),
        paymentMethod: sale.paymentMethod,
        transactionDiscount: 0,
        amountPaid: total,
        expectedTotal: total,
      },
      sale.time,
    );
    if ((done + 1) % PROGRESS_EVERY === 0) onProgress(done + 1, plan.length);
  }

  return { productCount: products.length, saleCount: plan.length, seconds: (performance.now() - started) / 1000 };
}
