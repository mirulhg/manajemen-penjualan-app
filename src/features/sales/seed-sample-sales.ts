import { db } from '../../lib/db/database';
import { productSchema, stockMovementSchema } from '../../lib/db/records';
import type { Product } from '../../lib/db/records';
import { startOfDay } from '../../utils/date-period';
import { syncStockAlerts } from '../../lib/db/stock-alerts';
import { createSaleAt } from './api/create-sale';
import { getSampleSaleTime, planSampleSales, SAMPLE_SALES_DAYS } from './sample-sales-plan';

// Khusus development. Dipanggil tepat setelah seed produk contoh (urutan SKU = urutan Data Contoh Produk).
// Stok awal dinaikkan sebesar total yang akan terjual, jadi stok AKHIR tetap sama dengan Data Contoh Produk.
export async function seedSampleSales(sampleSkus: readonly string[], today = new Date()): Promise<void> {
  await db.transaction(
    'rw',
    [db.products, db.stockMovements, db.counters, db.sales, db.saleItems, db.settings, db.dailySales, db.dailyProductSales, db.stockAlerts],
    async () => {
      if ((await db.sales.count()) > 0) return;

      const rows = productSchema.array().parse(await db.products.where('sku').anyOf(sampleSkus).toArray());
      const bySku = new Map(rows.map((product) => [product.sku, product]));
      const products: Product[] = sampleSkus.map((sku) => {
        const product = bySku.get(sku);
        if (!product) throw new Error(`Produk contoh ${sku} tidak ada di database.`);
        return product;
      });

      const plan = planSampleSales();
      const soldByIndex = new Map<number, number>();
      for (const sale of plan) {
        for (const item of sale.items) {
          soldByIndex.set(item.productIndex, (soldByIndex.get(item.productIndex) ?? 0) + item.quantity);
        }
      }

      const startIso = startOfDay(today, -SAMPLE_SALES_DAYS).toISOString();
      for (const [index, sold] of soldByIndex) {
        const product = products[index];
        if (!product) throw new Error(`Indeks produk contoh ${index} tidak ada.`);
        const opening = stockMovementSchema
          .array()
          .parse(await db.stockMovements.where('productId').equals(product.id).toArray())
          .find((movement) => movement.type === 'awal');
        if (!opening) throw new Error(`Pergerakan stok awal ${product.sku} tidak ada.`);

        await db.products.put({ ...product, stockQuantity: product.stockQuantity + sold, createdAt: startIso });
        await db.stockMovements.put({
          ...opening,
          quantityAfter: opening.quantityAfter + sold,
          createdAt: startIso,
        });
      }

      // Kronologis, lewat jalur createSale yang sama dengan kasir, supaya nomor, seq, dan rekap harian terisi benar.
      for (const planned of plan) {
        const lines = planned.items.map((item) => {
          const product = products[item.productIndex];
          if (!product) throw new Error(`Indeks produk contoh ${item.productIndex} tidak ada.`);
          return { productId: product.id, quantity: item.quantity, price: product.sellingPrice };
        });
        const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
        await createSaleAt(
          {
            items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, discount: 0 })),
            paymentMethod: planned.paymentMethod,
            transactionDiscount: 0,
            amountPaid: total,
            expectedTotal: total,
          },
          getSampleSaleTime(planned, today),
        );
      }

      // Tiap penjualan di atas menyinkronkan peringatan dengan stok pada masanya (naik-turun selama simulasi). Yang berlaku
      // hanya keadaan akhir, jadi riwayat episode itu dibuang dan peringatan dibangun sekali dari stok akhir.
      await db.stockAlerts.clear();
      await syncStockAlerts('all');
    },
  );
}
