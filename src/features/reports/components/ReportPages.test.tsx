// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { Outlet, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { saveStoreProfile } from '../../store-profile/api/save-store-profile';
import { OwnerOnly } from '../../session';
import { ReportsPage } from './ReportsPage';
import { SalesReportPage } from './SalesReportPage';

function renderRoutes(route: string, isCashierMode = false) {
  return renderWithProviders(
    <Routes>
      <Route
        element={
          <OwnerOnly>
            <Outlet />
          </OwnerOnly>
        }
      >
        <Route path="/laporan" element={<ReportsPage />} />
        <Route path="/laporan/penjualan" element={<SalesReportPage />} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    route,
    { isCashierMode, hasPin: true },
  );
}

describe('halaman laporan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('Mode Kasir: /laporan dan /laporan/penjualan diblokir', () => {
    renderRoutes('/laporan', true);
    expect(screen.getByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
  });

  it('daftar laporan: Penjualan, Laba kotor, dan Stok menjadi tautan, lainnya "Segera hadir" tanpa tautan', () => {
    renderRoutes('/laporan');

    expect(screen.getByRole('link', { name: /Penjualan/ }).getAttribute('href')).toBe('/laporan/penjualan');
    expect(screen.getByRole('link', { name: /Laba kotor/ }).getAttribute('href')).toBe('/laporan/laba-kotor');
    expect(screen.getByRole('link', { name: /Posisi stok/ }).getAttribute('href')).toBe('/laporan/stok');
    expect(screen.getAllByText('Segera hadir')).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /Pergerakan stok/ })).toBeNull();
  });

  it('tanpa profil toko: kop "Toko Saya" dan saran mengisi profil', async () => {
    renderRoutes('/laporan/penjualan');

    expect(await screen.findByText('Toko Saya')).toBeTruthy();
    expect(await screen.findByText(/Isi profil toko di/)).toBeTruthy();
    expect(await screen.findByText('Tidak ada penjualan di periode ini.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cetak / Simpan PDF' })).toBeTruthy();
  });

  it('dengan profil toko: kop memuat nama, alamat, dan telepon; saran hilang', async () => {
    await saveStoreProfile({ name: 'Toko Sari Makmur', address: 'Jl. Melati 5', phone: '0812345678' }, { kind: 'unchanged' });
    renderRoutes('/laporan/penjualan');

    expect(await screen.findByText('Toko Sari Makmur')).toBeTruthy();
    expect(screen.getByText('Jl. Melati 5')).toBeTruthy();
    expect(screen.getByText('Telp. 0812345678')).toBeTruthy();
    expect(screen.queryByText(/Isi profil toko di/)).toBeNull();
  });
});
