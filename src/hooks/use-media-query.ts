import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  // useCallback menjaga identitas subscribe tetap sama; tanpa itu useSyncExternalStore berlangganan ulang di setiap render.
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
