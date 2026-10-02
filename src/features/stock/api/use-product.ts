import { useQuery } from '@tanstack/react-query';

import { getProduct, productQueryKey } from './get-product';

export function useProduct(productId: string) {
  return useQuery({ queryKey: productQueryKey(productId), queryFn: () => getProduct(productId) });
}
