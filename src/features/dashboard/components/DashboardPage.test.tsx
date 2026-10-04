// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Outlet, Route, Routes } from 'react-router';

import { HomeRedirect } from '../../../app/HomeRedirect';
import { createSaleAt } from '../../sales/api/create-sale';
import { OwnerOnly } from '../../session';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { DashboardPage } from './DashboardPage';

const NOW = new Date(2026, 9, 3, 10, 0, 0);

function renderRoutes(route: string, isCashierMode: boolean) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/kasir" element={<p>halaman kasir</p>} />
      <Route
        element={
          <OwnerOnly>
            <Outlet />
          </OwnerOnly>
        }
      >
        <Route path="/dasbor" element={<DashboardPage />} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    route,
    { isCashierMode, hasPin: true },
  );
}

describe('DashboardPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('belum ada penjualan sama sekali: ajakan ke Kasir, bukan deretan angka nol', async () => {
    renderRoutes('/dasbor', false);

    expect(await screen.findByText('Belum ada penjualan')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Buka Kasir' }).getAttribute('href')).toBe('/kasir');
  });

  it('transaksi hari ini tampil di kartu dan ringkasan periode, kemarin kosong ditulis sebagai teks', async () => {
    const beras = await findProductBySku('SBK-001');
    const mi = await findProductBySku('MKR-001');
    const air = await findProductBySku('MNM-001');
    await createSaleAt(
      {
        items: [
          { productId: beras.id, quantity: 2, discount: 0 },
          { productId: mi.id, quantity: 3, discount: 0 },
          { productId: air.id, quantity: 1, discount: 0 },
        ],
        paymentMethod: 'tunai',
        transactionDiscount: 0,
        amountPaid: 162_000,
        expectedTotal: 162_000,
      },
      NOW,
    );
    renderRoutes('/dasbor', false);

    // Satu transaksi: omzet dan rata-rata sama-sama 162.000, masing-masing di kartu dan di ringkasan periode.
    expect((await screen.findAllByText('Rp 162.000')).length).toBe(4);
    // Omzet, rata-rata, dan laba kotor kemarin Rp 0; Transaksi kemarin 0 (bukan Rupiah).
    expect(screen.getAllByText(/Kemarin Rp 0 · baru ada hari ini/).length).toBe(3);
    expect(screen.getByText('Kemarin 0 · baru ada hari ini')).toBeTruthy();
    expect(screen.getAllByText('Rp 15.100').length).toBe(2);
    expect(screen.getByRole('link', { name: 'Lihat transaksi' }).getAttribute('href')).toBe('/penjualan');
  });

  it('link Lihat transaksi membawa periode yang dipilih', async () => {
    const beras = await findProductBySku('SBK-001');
    await createSaleAt(
      {
        items: [{ productId: beras.id, quantity: 1, discount: 0 }],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      NOW,
    );
    renderRoutes('/dasbor?periode=7-hari', false);

    await screen.findByText('Ringkasan periode');
    expect(screen.getByRole('link', { name: 'Lihat transaksi' }).getAttribute('href')).toBe('/penjualan?periode=7-hari');
  });

  it('Mode Kasir di /dasbor: pesan khusus pemilik', async () => {
    renderRoutes('/dasbor', true);

    expect(await screen.findByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    expect(screen.queryByText('Belum ada penjualan')).toBeNull();
  });

  it('"/" mengarah ke dasbor untuk pemilik dan ke kasir di Mode Kasir', async () => {
    const owner = renderRoutes('/', false);
    expect(await screen.findByText('Belum ada penjualan')).toBeTruthy();
    owner.unmount();

    renderRoutes('/', true);
    expect(await screen.findByText('halaman kasir')).toBeTruthy();
  });
});
