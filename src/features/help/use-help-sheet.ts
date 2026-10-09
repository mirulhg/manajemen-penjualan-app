import { useLocation, useNavigate } from 'react-router';

import { hasOpenedInApp, readHelpSlug, withHelpParam, withOpenedInAppFlag, withoutHelpParam } from './help-sheet-url';

export type HelpOpenTarget = { search: string; state: object };

export function useHelpSheet() {
  const location = useLocation();
  const locationState: unknown = location.state;
  const navigate = useNavigate();

  function getOpenTarget(slug: string): HelpOpenTarget {
    return { search: withHelpParam(location.search, slug), state: withOpenedInAppFlag(locationState) };
  }

  function open(slug: string) {
    const target = getOpenTarget(slug);
    void navigate({ search: target.search }, { state: target.state });
  }

  // Dibuka dari dalam aplikasi: mundur satu langkah, supaya tombol kembali dan tombol tutup sama dan riwayat tidak dobel.
  // Dibuka lewat alamat langsung: tidak ada langkah untuk mundur, jadi parameternya dihapus.
  function close() {
    if (hasOpenedInApp(locationState)) {
      void navigate(-1);
      return;
    }
    void navigate({ search: withoutHelpParam(location.search) }, { replace: true, state: locationState });
  }

  return { slug: readHelpSlug(location.search), getOpenTarget, open, close };
}
