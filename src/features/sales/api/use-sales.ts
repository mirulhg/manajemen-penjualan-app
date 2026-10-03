import { useQuery } from '@tanstack/react-query';

import type { SaleFilters } from '../sale-filters';
import { getSales, salesListKey } from './get-sales';

export function useSales(filters: SaleFilters) {
  return useQuery({ queryKey: salesListKey(filters), queryFn: () => getSales(filters) });
}
