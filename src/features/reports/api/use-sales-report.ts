import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DAILY_SALES_QUERY_KEY } from '../../../lib/db/daily-sales';
import { toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { getSalesReport } from './get-sales-report';

export function useSalesReport(selection: PeriodSelection) {
  const now = new Date();

  return useQuery({
    // Berawalan 'daily-sales': mutasi penjualan, retur, dan batal sudah meng-invalidate prefix ini.
    queryKey: [...DAILY_SALES_QUERY_KEY, 'sales-report', toLocalDateText(now), selection],
    queryFn: () => getSalesReport(selection, now),
    placeholderData: keepPreviousData,
  });
}
