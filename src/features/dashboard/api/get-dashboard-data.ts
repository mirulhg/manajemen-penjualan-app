import { getDailySalesRange, hasAnyDailySales } from '../../../lib/db/daily-sales';
import { toMetrics } from '../../../lib/db/daily-sales-rows';
import type { SalesMetrics } from '../../../lib/db/daily-sales-rows';
import { resolvePeriodRange, startOfDay, toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';

export type DashboardData = {
  // false = belum pernah ada penjualan sama sekali (bukan sekadar periode yang kosong).
  hasSales: boolean;
  today: SalesMetrics;
  yesterday: SalesMetrics;
  period: SalesMetrics;
};

export async function getDashboardData(selection: PeriodSelection, now: Date): Promise<DashboardData> {
  const todayKey = toLocalDateText(now);
  const yesterdayKey = toLocalDateText(startOfDay(now, -1));
  const { start, end } = resolvePeriodRange(selection, now);

  const [recentRows, periodRows, hasSales] = await Promise.all([
    getDailySalesRange(yesterdayKey, toLocalDateText(startOfDay(now, 1))),
    getDailySalesRange(toLocalDateText(start), toLocalDateText(end)),
    hasAnyDailySales(),
  ]);

  return {
    hasSales,
    today: toMetrics(recentRows.filter((row) => row.date === todayKey)),
    yesterday: toMetrics(recentRows.filter((row) => row.date === yesterdayKey)),
    period: toMetrics(periodRows),
  };
}
