// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';

import { db } from '../../../lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { updateProduct } from '../api/update-product';
import { ProductDetailPage } from './ProductDetailPage';

async function renderDetail(sku: string) {
  const product = await findProductBySku(sku);
  renderWithProviders(
    <Routes>
      <Route path="/stok/:productId" element={<ProductDetailPage />} />
    </Routes>,
    createTestQueryClient(),
    `/stok/${product.id}`,
  );
  return product;
}

describe('ProductDetailPage: arsip dan riwayat harga', () => {
  beforeEach(resetDatabaseWithSeed);

  it('Arsipkan menyebut sisa stok, lalu barang berlabel Diarsipkan dan bisa dipulihkan', async () => {
    const user = userEvent.setup();
    const product = await renderDetail('SBK-001');

    await user.click(await screen.findByText('Arsipkan barang'));
    expect(screen.getByText('Barang ini masih punya stok 18 sak.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Ya, arsipkan' }));

    expect(await screen.findByText('Diarsipkan')).toBeTruthy();
    expect(screen.getByText('Pulihkan barang')).toBeTruthy();
    expect((await db.products.get(product.id))?.archivedAt).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Ya, pulihkan' }));
    await screen.findByText('Arsipkan barang');
    expect(screen.queryByText('Diarsipkan')).toBeNull();
  });

  it('barang tanpa stok tidak menyebut sisa stok pada konfirmasi', async () => {
    const user = userEvent.setup();
    await renderDetail('MKR-005');

    await user.click(await screen.findByText('Arsipkan barang'));

    expect(screen.queryByText(/masih punya stok/)).toBeNull();
  });

  it('riwayat harga kosong menampilkan pesan, lalu menampilkan perubahan harga', async () => {
    const product = await findProductBySku('SBK-001');
    renderWithProviders(
      <Routes>
        <Route path="/stok/:productId" element={<ProductDetailPage />} />
      </Routes>,
      createTestQueryClient(),
      `/stok/${product.id}`,
    );
    expect(await screen.findByText('Belum ada perubahan harga.')).toBeTruthy();
  });

  it('perubahan harga tampil sebagai Rp sebelum → Rp sesudah', async () => {
    const product = await findProductBySku('SBK-001');
    await updateProduct(product.id, {
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      minStock: '5',
      purchasePrice: '68.000',
      sellingPrice: '75.000',
    });
    renderWithProviders(
      <Routes>
        <Route path="/stok/:productId" element={<ProductDetailPage />} />
      </Routes>,
      createTestQueryClient(),
      `/stok/${product.id}`,
    );

    expect(await screen.findByText('Rp 74.000 → Rp 75.000')).toBeTruthy();
  });
});
