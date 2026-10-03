import { createContext, useContext } from 'react';

import type { Session } from './api/get-session';

export const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession harus dipakai di dalam SessionProvider.');
  return session;
}
