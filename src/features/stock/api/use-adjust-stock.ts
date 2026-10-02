import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adjustStock } from './adjust-stock';
import { stockMovementsKey } from './get-stock-movements';
import { PRODUCTS_QUERY_KEY } from './get-products';
import type { StockAdjustmentInput } from '../schema';

export function useAdjustStock(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StockAdjustmentInput) => adjustStock(productId, input),
    // Juga saat gagal: kalau barang ternyata sudah tidak ada, halaman harus ikut tahu.
    // Dikembalikan agar mutasi baru dianggap selesai setelah data layar diperbarui.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: stockMovementsKey(productId) }),
      ]),
  });
}
