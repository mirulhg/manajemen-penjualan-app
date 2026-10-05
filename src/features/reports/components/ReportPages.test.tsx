// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { Outlet, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { saveStoreProfile } from '../../store-profile/api/save-store-profile';
import { OwnerOnly } from '../../session';
import { ReportsPage } from './ReportsPage';
import { ProfitReportPage } from './ProfitReportPage';
import { SalesReportPage } from './SalesReportPage';
import { StockMovementReportPage } from './StockMovementReportPage';
import { StockReportPage } from './StockReportPage';

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
        <Route path="/laporan/laba-kotor" element={<ProfitReportPage />} />
        <Route path="/laporan/stok" element={<StockReportPage />} />
        <Route path="/laporan/pergerakan-stok" element={<StockMovementReportPage />} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    route,
    { isCashierMode, hasPin: true },
  );
}

describe('halaman laporan', () => {
  beforeEach(resetDatabaseWithSeed);

  it.each(['/laporan', '/laporan/penjualan', '/laporan/laba-kotor', '/laporan/stok', '/laporan/pergerakan-stok'])(
    'Mode Kasir: %s diblokir',
    (route) => {
      renderRoutes(route, true);
      expect(screen.getByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    },
  );

  it('daftar laporan: keempat laporan menjadi tautan, tanpa "Segera hadir"', () => {
    renderRoutes('/laporan');

    expect(screen.getByRole('link', { name: /Penjualan/ }).getAttribute('href')).toBe('/laporan/penjualan');
    expect(screen.getByRole('link', { name: /Laba kotor/ }).getAttribute('href')).toBe('/laporan/laba-kotor');
    expect(screen.getByRole('link', { name: /Posisi stok/ }).getAttribute('href')).toBe('/laporan/stok');
    expect(screen.getByRole('link', { name: /Stok awal, masuk/ }).getAttribute('href')).toBe('/laporan/pergerakan-stok');
    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.queryByText('Segera hadir')).toBeNull();
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

  it('laba kotor tanpa penjualan: kop, ringkasan 0, dan catatan metode HPP', async () => {
    renderRoutes('/laporan/laba-kotor');

    expect(await screen.findByText('Toko Saya')).toBeTruthy();
    expect(await screen.findByText('Tidak ada penjualan di periode ini.')).toBeTruthy();
    expect(screen.getByText('HPP memakai harga beli saat transaksi (harga beli terakhir).')).toBeTruthy();
  });

  it('stok per tanggal: tanggal masa depan menampilkan pesan penolakan', async () => {
    renderRoutes('/laporan/stok?tanggal=2099-01-01');

    expect(await screen.findByText(/Tanggal laporan tidak boleh di masa depan/)).toBeTruthy();
  });

  it('stok per tanggal: bawaan hari ini menampilkan ringkasan 30 jenis, 406 unit', async () => {
    renderRoutes('/laporan/stok');

    expect(await screen.findByText('Nilai persediaan')).toBeTruthy();
    expect(screen.getByText('406')).toBeTruthy();
    expect(screen.getByText('Rp 4.025.100')).toBeTruthy();
    expect(screen.getByText('Air Mineral 600 ml')).toBeTruthy();
  });
});
