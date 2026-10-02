import { useQuery } from '@tanstack/react-query';

import { getProducts, PRODUCTS_QUERY_KEY } from './get-products';

export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: getProducts });
}
