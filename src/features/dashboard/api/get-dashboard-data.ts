import { getDailySalesRange, hasAnyDailySales } from '../../../lib/db/daily-sales';
import { toMetrics } from '../../../lib/db/daily-sales-rows';
import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import { toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { getDashboardRanges } from '../dashboard-range';

export type DashboardData = {
  // false = belum pernah ada penjualan sama sekali (bukan sekadar periode yang kosong).
  hasSales: boolean;
  period: SalesMetrics;
  // Periode sebelumnya: sama panjang, tepat sebelum periode terpilih.
  previous: SalesMetrics;
};

export async function getDashboardData(selection: PeriodSelection, now: Date): Promise<DashboardData> {
  const { current, previous } = getDashboardRanges(selection, now);

  const [periodRows, previousRows, hasSales] = await Promise.all([
    getDailySalesRange(toLocalDateText(current.start), toLocalDateText(current.end)),
    getDailySalesRange(toLocalDateText(previous.start), toLocalDateText(previous.end)),
    hasAnyDailySales(),
  ]);

  return {
    hasSales,
    period: toMetrics(periodRows),
    previous: toMetrics(previousRows),
  };
}
