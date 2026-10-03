import { useQuery } from '@tanstack/react-query';

import { getSession, SESSION_QUERY_KEY } from './get-session';

export function useSessionQuery() {
  return useQuery({ queryKey: SESSION_QUERY_KEY, queryFn: getSession });
}
