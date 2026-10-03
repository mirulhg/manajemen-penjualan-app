import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateStockQueries } from '../../stock';
import { cancelSale } from './cancel-sale';
import { SALES_QUERY_KEY } from './get-sales';

export function useCancelSale(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => cancelSale(saleId, reason),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY }),
        invalidateStockQueries(queryClient),
      ]),
  });
}
