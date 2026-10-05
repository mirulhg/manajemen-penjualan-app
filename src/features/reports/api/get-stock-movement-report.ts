import { db } from '../../../lib/db/database';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildStockMovementReport } from '../stock-movement-report';
import type { StockMovementReport } from '../stock-movement-report';
import { getReportRange } from './read-report-sales';
import { readMovementsFrom, readProductsExistingBefore, sumMovementDeltas } from './read-stock-position';

export async function getStockMovementReport(selection: PeriodSelection, now: Date): Promise<StockMovementReport> {
  const range = getReportRange(selection, now);
  const startIso = range.start.toISOString();
  const endIso = range.end.toISOString();

  return db.transaction('r', [db.products, db.stockMovements], async () => {
    // Satu kali baca lewat index createdAt, lalu dipisah: dalam periode dan sesudah periode (untuk mundur ke stok akhir).
    const fromStart = await readMovementsFrom(startIso);
    return buildStockMovementReport({
      products: await readProductsExistingBefore(endIso),
      periodMovements: fromStart.filter((movement) => movement.createdAt < endIso),
      deltaAfterPeriod: sumMovementDeltas(fromStart.filter((movement) => movement.createdAt >= endIso)),
    });
  });
}
