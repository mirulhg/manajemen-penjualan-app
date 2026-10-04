import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewProductInput } from '../schema';
import { CATEGORIES_QUERY_KEY } from './get-categories';
import { createProduct } from './create-product';
import { invalidateProductData } from './invalidate-stock-queries';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewProductInput) => createProduct(input),
    // Kategori yang diketik baru dibuat otomatis, jadi daftar kategori ikut basi.
    onSettled: () =>
      Promise.all([
        invalidateProductData(queryClient),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
      ]),
  });
}
