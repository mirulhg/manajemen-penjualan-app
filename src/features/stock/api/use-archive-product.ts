import { useMutation, useQueryClient } from '@tanstack/react-query';

import { archiveProduct, unarchiveProduct } from './archive-product';
import { CATEGORIES_QUERY_KEY } from './get-categories';
import { invalidateProductData } from './invalidate-stock-queries';

function useArchiveMutation(productId: string, action: (productId: string) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => action(productId),
    // Jumlah barang aktif dan arsip per kategori ikut berubah.
    onSettled: () =>
      Promise.all([
        invalidateProductData(queryClient),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
      ]),
  });
}

export function useArchiveProduct(productId: string) {
  return useArchiveMutation(productId, archiveProduct);
}

export function useUnarchiveProduct(productId: string) {
  return useArchiveMutation(productId, unarchiveProduct);
}
