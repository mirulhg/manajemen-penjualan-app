import { useQuery } from '@tanstack/react-query';

import { getStockMovements, stockMovementsPageKey } from './get-stock-movements';

export function useStockMovements(productId: string, page: number) {
  return useQuery({
    queryKey: stockMovementsPageKey(productId, page),
    queryFn: () => getStockMovements(productId, page),
  });
}
