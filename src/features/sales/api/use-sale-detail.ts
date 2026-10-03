import { useQuery } from '@tanstack/react-query';

import { getSaleDetail, saleDetailKey } from './get-sale-detail';

export function useSaleDetail(saleId: string) {
  return useQuery({ queryKey: saleDetailKey(saleId), queryFn: () => getSaleDetail(saleId) });
}
