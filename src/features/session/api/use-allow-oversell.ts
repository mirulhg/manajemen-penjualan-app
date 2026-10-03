import { useQuery } from '@tanstack/react-query';

import { getAllowOversell } from '../../../lib/db/settings';

export function useAllowOversell() {
  return useQuery({ queryKey: ['settings', 'allowOversell'], queryFn: getAllowOversell });
}
