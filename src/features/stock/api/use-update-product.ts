import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProductFieldsInput } from '../schema';
import { PRICE_CHANGES_ROOT_KEY } from './get-price-changes';
import { PRODUCTS_QUERY_KEY } from './get-products';
import { updateProduct } from './update-product';

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductFieldsInput) => updateProduct(productId, input),
    // ['products'] sudah mencakup ['products', id]; riwayat harga ikut basi karena perubahan harga menambah baris.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PRICE_CHANGES_ROOT_KEY }),
      ]),
  });
}
