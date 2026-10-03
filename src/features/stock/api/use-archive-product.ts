import { useMutation, useQueryClient } from '@tanstack/react-query';

import { archiveProduct, unarchiveProduct } from './archive-product';
import { PRODUCTS_QUERY_KEY } from './get-products';

function useArchiveMutation(productId: string, action: (productId: string) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => action(productId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

export function useArchiveProduct(productId: string) {
  return useArchiveMutation(productId, archiveProduct);
}

export function useUnarchiveProduct(productId: string) {
  return useArchiveMutation(productId, unarchiveProduct);
}
