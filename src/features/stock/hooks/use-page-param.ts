import { useLocation, useSearchParams } from 'react-router';

import { parsePageParam } from '../../../utils/pagination';

// Satu halaman bisa punya beberapa riwayat bernomor halaman, jadi nama parameternya diberikan pemanggil.
export function usePageParam(name: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState: unknown = useLocation().state;
  const page = parsePageParam(searchParams.get(name));

  // state ikut dibawa agar filter daftar tidak hilang saat pindah halaman riwayat; parameter lain dipertahankan.
  function setPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    if (nextPage === 1) params.delete(name);
    else params.set(name, String(nextPage));
    setSearchParams(params, { replace: true, state: locationState });
  }

  return { page, setPage };
}
