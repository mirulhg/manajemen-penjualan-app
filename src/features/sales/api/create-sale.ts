import { buildStockMovement } from '../../../lib/db/build-stock-movement';
import { applyDailySalesChange } from '../../../lib/db/daily-sales';
import { NO_CONTRIBUTION, saleContribution } from '../../../lib/db/daily-sales-rows';
import { db } from '../../../lib/db/database';
import { syncStockAlerts } from '../../../lib/db/stock-alerts';
import {
  productSchema,
  saleItemSchema,
  saleSchema,
  STOCK_MOVEMENT_COUNTER,
} from '../../../lib/db/records';
import type { Product, Sale } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { getAllowOversell, getCurrentActor } from '../../../lib/db/settings';
import { calculateSaleTotals, hasDiscountProblems } from '../calculate-sale-totals';
import { formatSaleNumber, getSaleCounterName } from '../sale-number';
import { createSaleInputSchema } from '../schema';
import type { CreateSaleInput } from '../schema';

type CreateSaleErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_ARCHIVED'
  | 'INVALID_DISCOUNT'
  | 'TOTAL_CHANGED'
  | 'INSUFFICIENT_STOCK'
  | 'INSUFFICIENT_PAYMENT';

export type StockShortage = {
  productName: string;
  available: number;
  requested: number;
};

const ERROR_MESSAGES: Record<CreateSaleErrorCode, string> = {
  PRODUCT_NOT_FOUND: 'Ada barang di keranjang yang sudah tidak ada.',
  PRODUCT_ARCHIVED: 'Ada barang di keranjang yang sudah diarsipkan.',
  INVALID_DISCOUNT: 'Diskon melebihi nilai yang didiskon.',
  TOTAL_CHANGED: 'Harga barang berubah. Periksa total lalu simpan lagi.',
  INSUFFICIENT_STOCK: 'Stok beberapa barang tidak cukup.',
  INSUFFICIENT_PAYMENT: 'Uang diterima kurang dari total.',
};

export class CreateSaleError extends Error {
  readonly code: CreateSaleErrorCode;
  readonly shortages: StockShortage[];

  constructor(code: CreateSaleErrorCode, shortages: StockShortage[] = [], productName: string | null = null) {
    super(
      code === 'PRODUCT_ARCHIVED' && productName
        ? `${productName} sudah diarsipkan dan tidak bisa dijual. Hapus dari keranjang lalu simpan lagi.`
        : ERROR_MESSAGES[code],
    );
    this.name = 'CreateSaleError';
    this.code = code;
    this.shortages = shortages;
  }
}

type SaleLine = { productId: string; quantity: number; discount: number; product: Product };

export function createSale(input: CreateSaleInput): Promise<Sale> {
  return createSaleAt(input, new Date());
}

// Waktu disuntikkan supaya generator data contoh memakai jalur yang sama dengan kasir untuk transaksi di masa lalu.
export async function createSaleAt(input: CreateSaleInput, now: Date): Promise<Sale> {
  const parsed = createSaleInputSchema.parse(input);
  const nowIso = now.toISOString();

  // Harga dan stok dibaca ulang di dalam transaksi; seluruh penulisan (termasuk penghitung nomor) satu kesatuan.
  return db.transaction(
    'rw',
    [db.products, db.stockMovements, db.counters, db.sales, db.saleItems, db.settings, db.dailySales, db.dailyProductSales, db.stockAlerts],
    async () => {
      const lines: SaleLine[] = [];
      for (const item of parsed.items) {
        const row = await db.products.get(item.productId);
        if (!row) throw new CreateSaleError('PRODUCT_NOT_FOUND');
        const product = productSchema.parse(row);
        if (product.archivedAt !== null) throw new CreateSaleError('PRODUCT_ARCHIVED', [], product.name);
        lines.push({ ...item, product });
      }

      const totals = calculateSaleTotals(
        lines.map((line) => ({
          quantity: line.quantity,
          unitPrice: line.product.sellingPrice,
          discount: line.discount,
        })),
        parsed.transactionDiscount,
      );
      if (hasDiscountProblems(totals)) throw new CreateSaleError('INVALID_DISCOUNT');
      if (totals.total !== parsed.expectedTotal) throw new CreateSaleError('TOTAL_CHANGED');

      if (!(await getAllowOversell())) {
        const shortages = lines
          .filter((line) => line.quantity > line.product.stockQuantity)
          .map((line) => ({
            productName: line.product.name,
            available: Math.max(0, line.product.stockQuantity),
            requested: line.quantity,
          }));
        if (shortages.length > 0) throw new CreateSaleError('INSUFFICIENT_STOCK', shortages);
      }

      const isCash = parsed.paymentMethod === 'tunai';
      const amountPaid = isCash ? (parsed.amountPaid ?? 0) : totals.total;
      if (amountPaid < totals.total) throw new CreateSaleError('INSUFFICIENT_PAYMENT');

      const saleSequence = await nextSequences(getSaleCounterName(now), 1);
      const actor = await getCurrentActor();
      const firstMovementSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, lines.length);
      const sale = saleSchema.parse({
        id: crypto.randomUUID(),
        number: formatSaleNumber(now, saleSequence),
        paymentMethod: parsed.paymentMethod,
        subtotal: totals.subtotal,
        itemDiscountTotal: totals.itemDiscountTotal,
        transactionDiscount: totals.transactionDiscount,
        total: totals.total,
        amountPaid,
        change: amountPaid - totals.total,
        itemCount: totals.itemCount,
        actor,
        createdAt: nowIso,
        status: 'selesai',
        refundedTotal: 0,
      });

      const saleItems = lines.map((line) =>
        saleItemSchema.parse({
          id: crypto.randomUUID(),
          saleId: sale.id,
          productId: line.productId,
          productName: line.product.name,
          sku: line.product.sku,
          unit: line.product.unit,
          quantity: line.quantity,
          unitPrice: line.product.sellingPrice,
          unitCost: line.product.purchasePrice,
          discount: line.discount,
        }),
      );
      const movements = lines.map((line, index) =>
        buildStockMovement({
          seq: firstMovementSeq + index,
          productId: line.productId,
          type: 'jual',
          quantityBefore: line.product.stockQuantity,
          quantityAfter: line.product.stockQuantity - line.quantity,
          reason: `Penjualan ${sale.number}`,
          actor,
          createdAt: nowIso,
          saleId: sale.id,
        }),
      );
      const updatedProducts = lines.map((line) =>
        productSchema.parse({
          ...line.product,
          stockQuantity: line.product.stockQuantity - line.quantity,
          updatedAt: nowIso,
        }),
      );

      await db.products.bulkPut(updatedProducts);
      await db.stockMovements.bulkAdd(movements);
      await db.sales.add(sale);
      await db.saleItems.bulkAdd(saleItems);
      await syncStockAlerts(
        lines.map((line) => line.productId),
        nowIso,
      );
      await applyDailySalesChange(sale.createdAt, NO_CONTRIBUTION, saleContribution(sale, saleItems, []));
      return sale;
    },
  );
}
