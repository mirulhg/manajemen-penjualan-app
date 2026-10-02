import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewProductInput } from '../schema';
import { createProduct } from './create-product';
import { PRODUCTS_QUERY_KEY } from './get-products';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewProductInput) => createProduct(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}
