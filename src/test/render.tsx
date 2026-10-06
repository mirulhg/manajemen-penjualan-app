import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach } from 'vitest';

import type { Session } from '../features/session/api/get-session';
import { Toaster } from '../components/ui/sonner';
import { SessionContext } from '../features/session/session-context';

// Vitest tanpa globals tidak memicu pembersihan otomatis milik Testing Library.
afterEach(cleanup);

// retry: false agar error mutasi/kueri langsung terlihat di test, bukan diulang diam-diam.
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

// Sesi bawaan = pemilik, dibagikan secara sinkron supaya tes komponen tidak menunggu pembacaan settings.
const OWNER_SESSION: Session = {
  isCashierMode: false,
  hasPin: false,
  defaultMinStock: 5,
  alertsBellEnabled: true,
  dailySummaryEnabled: true,
  alertsInCashierMode: false,
  dailySummaryDismissedOn: null,
};

function createWrapper(queryClient: QueryClient, route: string, session: Session) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionContext value={session}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          {/* Toast sukses dirender di sini supaya tes bisa memeriksanya seperti pengguna melihatnya. */}
          <Toaster />
        </SessionContext>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient = createTestQueryClient(),
  route = '/',
  session: Partial<Session> = {},
) {
  return {
    queryClient,
    ...render(ui, { wrapper: createWrapper(queryClient, route, { ...OWNER_SESSION, ...session }) }),
  };
}

export function renderHookWithProviders<Result>(
  callback: () => Result,
  queryClient = createTestQueryClient(),
) {
  return { queryClient, ...renderHook(callback, { wrapper: createWrapper(queryClient, '/', OWNER_SESSION) }) };
}
