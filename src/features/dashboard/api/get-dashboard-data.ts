import { getDailySalesRange, hasAnyDailySales } from '../../../lib/db/daily-sales';
import { toMetrics } from '../../../lib/db/daily-sales-rows';
import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import { startOfDay, toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { getDashboardRanges } from '../dashboard-range';

export type DashboardData = {
  // false = belum pernah ada penjualan sama sekali (bukan sekadar periode yang kosong).
  hasSales: boolean;
  today: SalesMetrics;
  yesterday: SalesMetrics;
  period: SalesMetrics;
  // Periode sebelumnya: sama panjang, tepat sebelum periode terpilih.
  previous: SalesMetrics;
};

export async function getDashboardData(selection: PeriodSelection, now: Date): Promise<DashboardData> {
  const todayKey = toLocalDateText(now);
  const yesterdayKey = toLocalDateText(startOfDay(now, -1));
  const { current, previous } = getDashboardRanges(selection, now);

  const [recentRows, periodRows, previousRows, hasSales] = await Promise.all([
    getDailySalesRange(yesterdayKey, toLocalDateText(startOfDay(now, 1))),
    getDailySalesRange(toLocalDateText(current.start), toLocalDateText(current.end)),
    getDailySalesRange(toLocalDateText(previous.start), toLocalDateText(previous.end)),
    hasAnyDailySales(),
  ]);

  return {
    hasSales,
    today: toMetrics(recentRows.filter((row) => row.date === todayKey)),
    yesterday: toMetrics(recentRows.filter((row) => row.date === yesterdayKey)),
    period: toMetrics(periodRows),
    previous: toMetrics(previousRows),
  };
}
