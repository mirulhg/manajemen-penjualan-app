import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach } from 'vitest';

import type { Session } from '../features/session/api/get-session';
import { SessionContext } from '../features/session/session-context';

// Vitest tanpa globals tidak memicu pembersihan otomatis milik Testing Library.
afterEach(cleanup);

// retry: false agar error mutasi/kueri langsung terlihat di test, bukan diulang diam-diam.
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

// Sesi bawaan = pemilik, dibagikan secara sinkron supaya tes komponen tidak menunggu pembacaan settings.
const OWNER_SESSION: Session = { isCashierMode: false, hasPin: false };

function createWrapper(queryClient: QueryClient, route: string, session: Session) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionContext value={session}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </SessionContext>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient = createTestQueryClient(),
  route = '/',
  session: Session = OWNER_SESSION,
) {
  return { queryClient, ...render(ui, { wrapper: createWrapper(queryClient, route, session) }) };
}

export function renderHookWithProviders<Result>(
  callback: () => Result,
  queryClient = createTestQueryClient(),
) {
  return { queryClient, ...renderHook(callback, { wrapper: createWrapper(queryClient, '/', OWNER_SESSION) }) };
}
