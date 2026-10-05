import { db } from '../../../lib/db/database';
import { priceChangeSchema } from '../../../lib/db/records';
import type { PriceChange } from '../../../lib/db/records';
import { parseLocalDate, startOfDay } from '../../../utils/date-period';
import { buildStockReport } from '../stock-report';
import { readMovementsFrom, readProductsExistingBefore, sumMovementDeltas } from './read-stock-position';
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
    const products = await readProductsExistingBefore(boundaryIso);
    // Hari ini: tidak ada pergerakan setelah akhir hari, jadi stok sekarang langsung dipakai.
    const deltaAfterDate = isToday ? new Map<string, number>() : sumMovementDeltas(await readMovementsFrom(boundaryIso));

    const purchaseChanges = new Map<string, PriceChange[]>();
    for (const change of priceChangeSchema.array().parse(await db.priceChanges.toArray())) {
      if (change.field !== 'purchasePrice') continue;
      purchaseChanges.set(change.productId, [...(purchaseChanges.get(change.productId) ?? []), change]);
    }

    return buildStockReport({ products, deltaAfterDate, purchaseChanges, boundaryIso });
  });
}
