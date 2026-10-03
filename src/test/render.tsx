import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach } from 'vitest';

// Vitest tanpa globals tidak memicu pembersihan otomatis milik Testing Library.
afterEach(cleanup);

// retry: false agar error mutasi/kueri langsung terlihat di test, bukan diulang diam-diam.
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement, queryClient = createTestQueryClient()) {
  return { queryClient, ...render(ui, { wrapper: createWrapper(queryClient) }) };
}

export function renderHookWithProviders<Result>(
  callback: () => Result,
  queryClient = createTestQueryClient(),
) {
  return { queryClient, ...renderHook(callback, { wrapper: createWrapper(queryClient) }) };
}
