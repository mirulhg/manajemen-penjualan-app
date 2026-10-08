// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as getSessionModule from '../api/get-session';
import { SessionProvider } from './SessionProvider';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SessionProvider', () => {
  it('pembacaan sesi gagal: layar error dengan Coba lagi, Muat ulang, dan detail teknis', async () => {
    vi.spyOn(getSessionModule, 'getSession').mockRejectedValue(new Error('settings tidak terbaca'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <p>isi aplikasi</p>
        </SessionProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Data di perangkat ini tidak bisa dibuka' })).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Muat ulang' })).toBeTruthy();
    expect(screen.getByText('settings tidak terbaca')).toBeTruthy();
    expect(screen.queryByText('isi aplikasi')).toBeNull();
  });
});
