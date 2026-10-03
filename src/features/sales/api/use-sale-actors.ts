import { useQuery } from '@tanstack/react-query';

import { getSaleActors, SALE_ACTORS_KEY } from './get-sale-actors';

export function useSaleActors() {
  return useQuery({ queryKey: SALE_ACTORS_KEY, queryFn: getSaleActors });
}
