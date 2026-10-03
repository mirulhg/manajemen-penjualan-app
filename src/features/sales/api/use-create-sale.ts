import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateStockQueries } from '../../stock';
import type { CreateSaleInput } from '../schema';
import { createSale } from './create-sale';

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
    // Juga saat gagal: harga atau stok yang berubah harus langsung terbaca ulang oleh layar.
    onSettled: () => invalidateStockQueries(queryClient),
  });
}
