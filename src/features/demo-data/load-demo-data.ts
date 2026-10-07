import { db } from '../../lib/db/database';
import { STOCK_MOVEMENT_COUNTER } from '../../lib/db/records';
import type { Product } from '../../lib/db/records';
import { nextSequences } from '../../lib/db/sequence';
import { OWNER_ACTOR } from '../../lib/db/settings';
import { syncStockAlerts } from '../../lib/db/stock-alerts';
import { startOfDay } from '../../utils/date-period';
import { cancelSaleAt, createSaleAt, returnSaleItemsAt } from '../sales';
import { setupPin } from '../session';
import { buildProductRecords, resolveCategory } from '../stock';
import { DEMO_PRODUCTS } from './demo-products';
import { DemoDataError, DEMO_PIN, DEMO_TABLES } from './demo-tables';
import { DEMO_SALES_DAYS, getDemoSaleTime, getNetSoldQuantities, planDemoSales } from './plan-demo-sales';
import type { PlannedDemoSale } from './plan-demo-sales';

const AFTER_SALE_MINUTES = 30;

async function applyOutcome(sale: PlannedDemoSale, products: Product[], saleId: string, saleTime: Date) {
  const outcomeTime = new Date(saleTime.getTime() + AFTER_SALE_MINUTES * 60_000);
  if (sale.outcome.type === 'cancel') {
    await cancelSaleAt(saleId, sale.outcome.reason, outcomeTime);
  } else if (sale.outcome.type === 'return') {
    const planned = sale.items[sale.outcome.itemIndex];
    const product = planned ? products[planned.productIndex] : undefined;
    const item = (await db.saleItems.where('saleId').equals(saleId).toArray()).find((row) => row.productId === product?.id);
    if (!item) throw new Error('Baris transaksi contoh untuk retur tidak ditemukan.');
    await returnSaleItemsAt(
      saleId,
      { items: [{ saleItemId: item.id, quantity: sale.outcome.quantity }], reason: sale.outcome.reason },
      outcomeTime,
    );
  }
}

// Seluruh data contoh ditulis dalam satu transaksi: gagal di tengah berarti tidak ada yang tersimpan. Transaksi memakai jalur
// createSaleAt/cancelSaleAt/returnSaleItemsAt yang sama dengan kasir, jadi rekap harian dan peringatan stok terisi benar.
export async function loadDemoData(today = new Date()): Promise<void> {
  const plan = planDemoSales();
  const netSold = getNetSoldQuantities(plan);
  const startIso = startOfDay(today, -(DEMO_SALES_DAYS + 1)).toISOString();

  await db.transaction('rw', DEMO_TABLES, async () => {
    if ((await db.products.count()) > 0 || (await db.sales.count()) > 0) throw new DemoDataError('NOT_EMPTY');

    // Stok awal = stok akhir yang diinginkan + jumlah bersih terjual, jadi stok akhir sesuai DEMO_PRODUCTS.
    const firstSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, DEMO_PRODUCTS.length);
    const records = DEMO_PRODUCTS.map(({ finalStock, ...fields }, index) =>
      buildProductRecords({ ...fields, stockQuantity: finalStock + (netSold[index] ?? 0) }, startIso, firstSeq + index, OWNER_ACTOR),
    );
    for (const name of new Set(DEMO_PRODUCTS.map((product) => product.category))) {
      await resolveCategory(name, startIso);
    }
    await db.products.bulkAdd(records.map((record) => record.product));
    await db.stockMovements.bulkAdd(records.map((record) => record.movement));
    const products = records.map((record) => record.product);

    // Kronologis; batal dan retur langsung menyusul transaksinya, jadi stok tidak pernah sempat kurang di tengah simulasi.
    for (const planned of plan) {
      const lines = planned.items.map((item) => {
        const product = products[item.productIndex];
        if (!product) throw new Error(`Indeks barang contoh ${item.productIndex} tidak ada.`);
        return { productId: product.id, quantity: item.quantity, price: product.sellingPrice };
      });
      const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
      const saleTime = getDemoSaleTime(planned, today);
      const sale = await createSaleAt(
        {
          items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, discount: 0 })),
          paymentMethod: planned.paymentMethod,
          transactionDiscount: 0,
          amountPaid: total,
          expectedTotal: total,
        },
        saleTime,
      );
      await applyOutcome(planned, products, sale.id, saleTime);
    }

    // Peringatan tiap penjualan mengikuti stok pada masanya; yang berlaku hanya keadaan akhir.
    await db.stockAlerts.clear();
    await syncStockAlerts('all');
    await db.settings.put({ key: 'isDemo', value: true });
  });

  // Di luar transaksi: hash PIN memakai crypto.subtle, yang tidak boleh ditunggu di dalam transaksi IndexedDB.
  // PIN pemilik yang sudah ada tidak pernah ditimpa.
  if (!(await db.settings.get('ownerPin'))) {
    await setupPin(DEMO_PIN);
    await db.settings.put({ key: 'demoPin', value: DEMO_PIN });
  }
}
