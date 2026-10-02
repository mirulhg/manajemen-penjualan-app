import { useSearchParams } from 'react-router';

import { parseFilterParams, serializeFilterParams } from '../parse-filter-params';
import type { StockFilters } from '../parse-filter-params';

export function useStockFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilterParams(searchParams);

  function setFilters(patch: Partial<StockFilters>) {
    setSearchParams(serializeFilterParams({ ...filters, ...patch }), { replace: true });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  return { filters, setFilters, clearFilters };
}
