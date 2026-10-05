import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getStoreProfile } from '../../../lib/db/settings';
import type { LogoDraft, StoreProfileFormInput } from '../schema';
import { saveStoreProfile } from './save-store-profile';

// Berawalan 'settings': mutasi pengaturan yang sudah ada ikut menyegarkannya.
export const STORE_PROFILE_QUERY_KEY = ['settings', 'store-profile'] as const;

export function useStoreProfile() {
  return useQuery({ queryKey: STORE_PROFILE_QUERY_KEY, queryFn: getStoreProfile });
}

export function useSaveStoreProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, logoDraft }: { values: StoreProfileFormInput; logoDraft: LogoDraft }) =>
      saveStoreProfile(values, logoDraft),
    onSettled: () => queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY }),
  });
}
