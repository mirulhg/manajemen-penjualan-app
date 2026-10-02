import { useSearchParams } from 'react-router';

import { parseFilterParams, serializeFilterParams } from '../parse-filter-params';
import type { StockFilters } from '../parse-filter-params';

export function useStockFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilterParams(searchParams);

  function setFilters(patch: Partial<StockFilters>) {
    setSearchParams(serializeFilterParams({ ...filters, ...patch }), { replace: true });
  }

  // Urutan bukan filter, jadi tetap dipertahankan saat filter dihapus.
  function clearFilters() {
    const cleared = { query: null, category: null, status: null, sort: filters.sort };
    setSearchParams(serializeFilterParams(cleared), { replace: true });
  }

  return { filters, setFilters, clearFilters };
}
