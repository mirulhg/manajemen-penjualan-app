// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { ProductDetailPage } from './ProductDetailPage';
import { StockListPage } from './StockListPage';

const CASHIER = { isCashierMode: true, hasPin: true };

async function renderDetail(isCashierMode: boolean) {
  const product = await findProductBySku('SBK-001');
  renderWithProviders(
    <Routes>
      <Route path="/stok/:productId" element={<ProductDetailPage />} />
    </Routes>,
    createTestQueryClient(),
    `/stok/${product.id}`,
    { isCashierMode, hasPin: true },
  );
}

describe('akses Mode Kasir di halaman stok', () => {
  beforeEach(resetDatabaseWithSeed);

  it('detail Beras untuk kasir: tanpa harga beli, nilai stok, riwayat harga, dan tombol pemilik', async () => {
    await renderDetail(true);

    expect(await screen.findByText('Rp 74.000')).toBeTruthy();
    expect(screen.queryByText('Rp 68.000')).toBeNull();
    expect(screen.queryByText('Harga beli')).toBeNull();
    expect(screen.queryByText('Nilai stok')).toBeNull();
    expect(screen.queryByText('Riwayat harga')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Ubah barang' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Sesuaikan stok' })).toBeNull();
    expect(screen.queryByText('Arsipkan barang')).toBeNull();
    expect(screen.getByText('Stok sekarang')).toBeTruthy();
  });

  it('detail Beras untuk pemilik: harga beli dan tombol Ubah tampil', async () => {
    await renderDetail(false);

    expect(await screen.findByText('Rp 68.000')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ubah barang' })).toBeTruthy();
  });

  it('daftar stok untuk kasir: tanpa ringkasan nilai stok, Tambah barang, dan Kategori', async () => {
    renderWithProviders(<StockListPage />, createTestQueryClient(), '/', CASHIER);

    expect(await screen.findByLabelText('Cari barang')).toBeTruthy();
    expect(screen.queryByText('Nilai stok')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Tambah barang' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Kategori' })).toBeNull();
  });

  it('daftar stok untuk pemilik: ketiganya tampil', async () => {
    renderWithProviders(<StockListPage />);

    expect(await screen.findByText('Nilai stok')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Tambah barang' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Kategori' })).toBeTruthy();
  });
});
