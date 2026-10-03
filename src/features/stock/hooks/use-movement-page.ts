import { useLocation, useSearchParams } from 'react-router';

import { parsePageParam } from '../../../utils/pagination';

export function useMovementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState: unknown = useLocation().state;
  const page = parsePageParam(searchParams.get('halaman'));

  // state ikut dibawa agar filter daftar stok tidak hilang saat pindah halaman riwayat.
  function setPage(nextPage: number) {
    const params = nextPage === 1 ? new URLSearchParams() : new URLSearchParams({ halaman: String(nextPage) });
    setSearchParams(params, { replace: true, state: locationState });
  }

  return { page, setPage };
}
