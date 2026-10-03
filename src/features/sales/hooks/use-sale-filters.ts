import { useSearchParams } from 'react-router';

import { parseSaleFilters, serializeSaleFilters } from '../sale-filters';
import type { SaleFilters } from '../sale-filters';

export function useSaleFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSaleFilters(searchParams);

  // Mengubah filter apa pun mengembalikan ke halaman 1, kecuali yang diubah memang halamannya.
  function setFilters(patch: Partial<SaleFilters>) {
    const next = { ...filters, page: 1, ...patch };
    setSearchParams(serializeSaleFilters(next), { replace: true });
  }

  return { filters, setFilters };
}
