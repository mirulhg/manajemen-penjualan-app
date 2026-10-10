import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CHANGELOG_SEEN_QUERY_KEY, getSeenVersion, markChangelogSeen } from './changelog-state';

// Tanda "Baru" di Pengaturan: ada versi yang halaman Pembaruannya belum dibuka. Selagi dibaca, tanda tidak ditampilkan.
export function useHasUnseenChangelog(): boolean {
  const { data } = useQuery({ queryKey: CHANGELOG_SEEN_QUERY_KEY, queryFn: getSeenVersion });
  return data !== undefined && data !== __APP_VERSION__;
}

export function useMarkChangelogSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markChangelogSeen(__APP_VERSION__),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CHANGELOG_SEEN_QUERY_KEY }),
  });
}
