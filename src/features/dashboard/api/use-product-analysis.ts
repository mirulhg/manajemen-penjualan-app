import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getAnalysisReadiness,
  getProductSalesWithProducts,
  getSlowMovers,
  getStockForecast,
  PRODUCT_ANALYTICS_QUERY_KEY,
} from '../../../lib/db/product-analytics';
import { toLocalDateText } from '../../../utils/date-period';
import type { DateRange } from '../../../utils/date-period';

// "Hari ini" ada di key supaya halaman yang dibiarkan terbuka lewat tengah malam membaca jendela waktu yang baru.
function todayKey(now: Date) {
  return toLocalDateText(now);
}

export function useAnalysisReadiness() {
  const now = new Date();
  return useQuery({
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'readiness', todayKey(now)],
    queryFn: () => getAnalysisReadiness(now),
  });
}

export function useProductSales(range: DateRange) {
  return useQuery({
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'sales', toLocalDateText(range.start), toLocalDateText(range.end)],
    queryFn: () => getProductSalesWithProducts(range),
    placeholderData: keepPreviousData,
  });
}

export function useSlowMovers(thresholdDays: number) {
  const now = new Date();
  return useQuery({
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'slow-movers', thresholdDays, todayKey(now)],
    queryFn: () => getSlowMovers(thresholdDays, now),
    placeholderData: keepPreviousData,
  });
}

export function useStockForecast() {
  const now = new Date();
  return useQuery({
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'stock-forecast', todayKey(now)],
    queryFn: () => getStockForecast(now),
  });
}
