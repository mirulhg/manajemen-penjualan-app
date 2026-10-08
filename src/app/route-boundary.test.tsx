// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router';

import { SessionContext } from '../features/session/session-context';
import { RouteError } from './RouteError';

afterEach(cleanup);

function Layout() {
  return (
    <div>
      <nav aria-label="Menu uji">
        <Link to="/">Beranda</Link>
        <Link to="/rusak">Rusak</Link>
        <Link to="/lazy">Lazy</Link>
      </nav>
      <Outlet />
    </div>
  );
}

function Broken(): never {
  throw new Error('halaman rusak');
}

function renderRouter(lazyCalls: { count: number }, initialEntry = '/rusak') {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          {
            ErrorBoundary: RouteError,
            children: [
              { index: true, element: <p>isi beranda</p> },
              { path: 'rusak', element: <Broken /> },
              {
                path: 'lazy',
                lazy: () => {
                  lazyCalls.count += 1;
                  if (lazyCalls.count === 1) {
                    return Promise.reject(new TypeError('Failed to fetch dynamically imported module: /assets/Lazy-abc.js'));
                  }
                  return Promise.resolve({ Component: () => <p>isi lazy</p> });
                },
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  );
  const session = {
    isCashierMode: false,
    hasPin: false,
    defaultMinStock: 5,
    alertsBellEnabled: true,
    dailySummaryEnabled: true,
    alertsInCashierMode: false,
    dailySummaryDismissedOn: null,
  };
  render(
    <SessionContext value={session}>
      <RouterProvider router={router} />
    </SessionContext>,
  );
  return router;
}

describe('boundary rute', () => {
  it('halaman yang melempar error menampilkan RouteError, induk tetap ada, dan navigasi menghapus error', async () => {
    renderRouter({ count: 0 });

    expect(await screen.findByRole('heading', { name: 'Terjadi kesalahan di halaman ini' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Menu uji' })).toBeTruthy();

    await userEvent.click(screen.getByRole('link', { name: 'Beranda' }));

    expect(await screen.findByText('isi beranda')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Terjadi kesalahan di halaman ini' })).toBeNull();
  });

  it('gagal impor lazy saat online menampilkan Versi baru tersedia', async () => {
    renderRouter({ count: 0 });
    await userEvent.click(screen.getByRole('link', { name: 'Lazy' }));

    expect(await screen.findByRole('heading', { name: 'Versi baru tersedia' })).toBeTruthy();
  });

  it('rute lazy yang gagal tidak dicoba lagi saat dibuka ulang: perlu muat ulang halaman', async () => {
    const calls = { count: 0 };
    renderRouter(calls);
    await userEvent.click(screen.getByRole('link', { name: 'Lazy' }));
    await screen.findByRole('heading', { name: 'Versi baru tersedia' });

    await userEvent.click(screen.getByRole('link', { name: 'Beranda' }));
    await userEvent.click(screen.getByRole('link', { name: 'Lazy' }));

    // React Router menyimpan hasil lazy pertama, jadi impor tidak diulang walau jaringan sudah pulih.
    expect(calls.count).toBe(1);
    expect(screen.queryByText('isi lazy')).toBeNull();
    expect(await screen.findByRole('heading', { name: 'Versi baru tersedia' })).toBeTruthy();
  });

  // Terakhir di file: event offline mengubah status koneksi tingkat modul untuk sisa test di file ini.
  it('offline: layar tanpa Coba lagi, lalu berganti sendiri ke Koneksi sudah kembali saat internet pulih', async () => {
    renderRouter({ count: 0 }, '/');
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await userEvent.click(screen.getByRole('link', { name: 'Lazy' }));

    expect(await screen.findByRole('heading', { name: 'Tidak ada koneksi internet' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Coba lagi' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Ke Dasbor' })).toBeTruthy();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(await screen.findByRole('heading', { name: 'Koneksi sudah kembali' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Muat ulang' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Versi baru tersedia' })).toBeNull();
  });
});
