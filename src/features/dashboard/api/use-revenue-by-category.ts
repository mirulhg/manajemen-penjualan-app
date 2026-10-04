import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getRevenueByCategory, REVENUE_BY_CATEGORY_QUERY_KEY } from '../../../lib/db/sales-analytics';
import { toLocalDateText } from '../../../utils/date-period';
import type { DateRange } from '../../../utils/date-period';

export function useRevenueByCategory(range: DateRange) {
  return useQuery({
    queryKey: [...REVENUE_BY_CATEGORY_QUERY_KEY, toLocalDateText(range.start), toLocalDateText(range.end)],
    queryFn: () => getRevenueByCategory(range),
    placeholderData: keepPreviousData,
  });
}
