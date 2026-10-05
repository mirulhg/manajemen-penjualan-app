import { db } from '../../../lib/db/database';
import { saleSchema } from '../../../lib/db/records';
import type { Sale } from '../../../lib/db/records';
import { clipRangeToToday, resolvePeriodRange } from '../../../utils/date-period';
import type { DateRange, PeriodSelection } from '../../../utils/date-period';

// Data tidak ada setelah hari ini; tanpa pemotongan, "Bulan ini" menampilkan sisa bulan sebagai hari kosong.
export function getReportRange(selection: PeriodSelection, now: Date): DateRange {
  return clipRangeToToday(resolvePeriodRange(selection, now), now);
}

export async function readReportSales(range: DateRange): Promise<Sale[]> {
  const rows = await db.sales
    .where('createdAt')
    .between(range.start.toISOString(), range.end.toISOString(), true, false)
    .toArray();
  return saleSchema.array().parse(rows);
}
