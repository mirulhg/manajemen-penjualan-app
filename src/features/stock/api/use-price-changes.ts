import { useQuery } from '@tanstack/react-query';

import { getPriceChanges, priceChangesPageKey } from './get-price-changes';

export function usePriceChanges(productId: string, page: number) {
  return useQuery({
    queryKey: priceChangesPageKey(productId, page),
    queryFn: () => getPriceChanges(productId, page),
  });
}
