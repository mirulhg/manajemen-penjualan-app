import { useQuery } from '@tanstack/react-query';

import { getDailySalesRange } from '../../../lib/db/daily-sales';
import { toMetrics } from '../../../lib/db/daily-sales-rows';
import { getOpenAlerts, STOCK_ALERTS_QUERY_KEY } from '../../../lib/db/stock-alerts';
import { startOfDay, toLocalDateText } from '../../../utils/date-period';

async function getDailySummary(now: Date) {
  const [alerts, yesterdayRows] = await Promise.all([
    getOpenAlerts(),
    getDailySalesRange(toLocalDateText(startOfDay(now, -1)), toLocalDateText(startOfDay(now))),
  ]);
  return {
    soldOut: alerts.filter((entry) => entry.alert.level === 'habis').length,
    low: alerts.filter((entry) => entry.alert.level === 'menipis').length,
    yesterday: toMetrics(yesterdayRows),
  };
}

export function useDailySummary() {
  const now = new Date();
  return useQuery({
    // Berawalan key peringatan: setiap penulis stok dan penjualan sudah menyegarkannya, termasuk kartu ini.
    queryKey: [...STOCK_ALERTS_QUERY_KEY, 'summary', toLocalDateText(now)],
    queryFn: () => getDailySummary(now),
  });
}
