import { useSearchParams } from 'react-router';

import { parseFilterParams, serializeFilterParams } from '../parse-filter-params';
import type { StockFilters } from '../parse-filter-params';

export function useStockFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilterParams(searchParams);
  const hasActiveFilters =
    filters.query !== null || filters.category !== null || filters.status !== null;

  function setFilters(patch: Partial<StockFilters>) {
    setSearchParams(serializeFilterParams({ ...filters, ...patch }), { replace: true });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  return { filters, hasActiveFilters, setFilters, clearFilters };
}
