import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAILY_SALES_QUERY_KEY } from '../../../lib/db/daily-sales';
import {
  REVENUE_BY_CATEGORY_QUERY_KEY,
  TRANSACTIONS_BY_HOUR_QUERY_KEY,
} from '../../../lib/db/sales-analytics';
import { invalidateStockQueries } from '../../stock';
import type { CreateSaleInput } from '../schema';
import { createSale } from './create-sale';
import { SALES_QUERY_KEY } from './get-sales';

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
    // Juga saat gagal: harga atau stok yang berubah harus langsung terbaca ulang oleh layar.
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
