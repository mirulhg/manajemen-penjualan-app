import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adjustStock } from './adjust-stock';
import { stockMovementsKey } from './get-stock-movements';
import { invalidateProductData } from './invalidate-stock-queries';
import type { StockAdjustmentInput } from '../schema';

export function useAdjustStock(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StockAdjustmentInput) => adjustStock(productId, input),
    // Juga saat gagal: kalau barang ternyata sudah tidak ada, halaman harus ikut tahu.
    // Dikembalikan agar mutasi baru dianggap selesai setelah data layar diperbarui.
    onSettled: () =>
      Promise.all([
        invalidateProductData(queryClient),
        queryClient.invalidateQueries({ queryKey: stockMovementsKey(productId) }),
      ]),
  });
}
