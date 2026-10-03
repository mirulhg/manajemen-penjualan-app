import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewProductInput } from '../schema';
import { CATEGORIES_QUERY_KEY } from './get-categories';
import { createProduct } from './create-product';
import { PRODUCTS_QUERY_KEY } from './get-products';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewProductInput) => createProduct(input),
    // Kategori yang diketik baru dibuat otomatis, jadi daftar kategori ikut basi.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
      ]),
  });
}
