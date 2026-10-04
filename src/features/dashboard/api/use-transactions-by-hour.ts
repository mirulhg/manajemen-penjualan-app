import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getTransactionsByHour, TRANSACTIONS_BY_HOUR_QUERY_KEY } from '../../../lib/db/sales-analytics';
import { toLocalDateText } from '../../../utils/date-period';
import type { DateRange } from '../../../utils/date-period';

export function useTransactionsByHour(range: DateRange) {
  return useQuery({
    queryKey: [...TRANSACTIONS_BY_HOUR_QUERY_KEY, toLocalDateText(range.start), toLocalDateText(range.end)],
    queryFn: () => getTransactionsByHour(range),
    placeholderData: keepPreviousData,
  });
}
