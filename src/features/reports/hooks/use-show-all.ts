import { useSearchParams } from 'react-router';

// ?semua=1: tampilkan juga barang tanpa pergerakan. Parameter lain (periode) dipertahankan.
export function useShowAll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showAll = searchParams.get('semua') === '1';

  function setShowAll(next: boolean) {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('semua', '1');
    else params.delete('semua');
    setSearchParams(params, { replace: true });
  }

  return { showAll, setShowAll };
}
