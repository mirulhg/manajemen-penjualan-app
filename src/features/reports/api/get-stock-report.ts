import Dexie from 'dexie';

import { db } from '../../../lib/db/database';
import { priceChangeSchema, productSchema, stockMovementSchema } from '../../../lib/db/records';
import type { PriceChange } from '../../../lib/db/records';
import { parseLocalDate, startOfDay } from '../../../utils/date-period';
import { buildStockReport } from '../stock-report';
import type { StockReport } from '../stock-report';

type StockReportErrorCode = 'FUTURE_DATE' | 'INVALID_DATE';

const MESSAGES: Record<StockReportErrorCode, string> = {
  FUTURE_DATE: 'Tanggal laporan tidak boleh di masa depan. Pilih hari ini atau tanggal sebelumnya.',
  INVALID_DATE: 'Tanggal laporan tidak valid. Pilih tanggal dari kalender.',
};

export class StockReportError extends Error {
  readonly code: StockReportErrorCode;

  constructor(code: StockReportErrorCode) {
    super(MESSAGES[code]);
    this.name = 'StockReportError';
    this.code = code;
  }
}

// dateText = tanggal lokal YYYY-MM-DD; posisi dihitung pada akhir hari itu (waktu lokal perangkat).
export async function getStockReport(dateText: string, now: Date): Promise<StockReport> {
  const date = parseLocalDate(dateText);
  if (!date) throw new StockReportError('INVALID_DATE');
  const today = startOfDay(now);
  if (date > today) throw new StockReportError('FUTURE_DATE');

  const boundaryIso = startOfDay(date, 1).toISOString();
  const isToday = date.getTime() === today.getTime();

  return db.transaction('r', [db.products, db.stockMovements, db.priceChanges], async () => {
    const products = productSchema.array().parse(await db.products.toArray());

    // Hari ini: tidak ada pergerakan setelah akhir hari, jadi stok sekarang langsung dipakai.
    const deltaAfterDate = new Map<string, number>();
    if (!isToday) {
      const after = stockMovementSchema
        .array()
        .parse(await db.stockMovements.where('createdAt').aboveOrEqual(boundaryIso).toArray());
      for (const movement of after) {
        deltaAfterDate.set(
          movement.productId,
          (deltaAfterDate.get(movement.productId) ?? 0) + movement.quantityAfter - movement.quantityBefore,
        );
      }
    }

    // Produk sudah ada pada tanggal itu bila dibuat sebelum batas, atau pergerakan 'awal'-nya (yang pertama menurut seq) sebelum batas.
    // Data contoh bertanggal mundur memakai pergerakan awal yang lebih tua dari createdAt produk.
    const existing = await Promise.all(
      products.map(async (product) => {
        if (product.createdAt < boundaryIso) return true;
        const first = await db.stockMovements
          .where('[productId+seq]')
          .between([product.id, Dexie.minKey], [product.id, Dexie.maxKey])
          .first();
        return first !== undefined && first.createdAt < boundaryIso;
      }),
    );

    const purchaseChanges = new Map<string, PriceChange[]>();
    for (const change of priceChangeSchema.array().parse(await db.priceChanges.toArray())) {
      if (change.field !== 'purchasePrice') continue;
      purchaseChanges.set(change.productId, [...(purchaseChanges.get(change.productId) ?? []), change]);
    }

    return buildStockReport({
      products: products.filter((_, index) => existing[index]),
      deltaAfterDate,
      purchaseChanges,
      boundaryIso,
    });
  });
}
