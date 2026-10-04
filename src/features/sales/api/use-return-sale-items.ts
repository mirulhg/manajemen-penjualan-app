import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAILY_SALES_QUERY_KEY } from '../../../lib/db/daily-sales';
import {
  REVENUE_BY_CATEGORY_QUERY_KEY,
  TRANSACTIONS_BY_HOUR_QUERY_KEY,
} from '../../../lib/db/sales-analytics';
import { invalidateStockQueries } from '../../stock';
import type { ReturnSaleItemsInput } from '../schema';
import { SALES_QUERY_KEY } from './get-sales';
import { returnSaleItems } from './return-sale-items';

export function useReturnSaleItems(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReturnSaleItemsInput) => returnSaleItems(saleId, input),
    // Juga saat gagal: sisa yang bisa diretur mungkin sudah berubah sejak layar dimuat.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: DAILY_SALES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: REVENUE_BY_CATEGORY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: TRANSACTIONS_BY_HOUR_QUERY_KEY }),
        invalidateStockQueries(queryClient),
      ]),
  });
}
