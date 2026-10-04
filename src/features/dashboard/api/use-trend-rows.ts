import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DAILY_SALES_QUERY_KEY, getDailySalesRange } from '../../../lib/db/daily-sales';
import { toLocalDateText } from '../../../utils/date-period';
import type { DateRange } from '../../../utils/date-period';

// Satu pembacaan mencakup periode ini dan sebelumnya, jadi mengganti skala waktu tidak membaca ulang.
export function useTrendRows(previous: DateRange, current: DateRange) {
  const from = toLocalDateText(previous.start);
  const to = toLocalDateText(current.end);

  return useQuery({
    queryKey: [...DAILY_SALES_QUERY_KEY, 'range', from, to],
    queryFn: () => getDailySalesRange(from, to),
    placeholderData: keepPreviousData,
  });
}
