// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';

import { db } from '../../../lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { EditProductPage } from './EditProductPage';

async function renderEdit(sku = 'SBK-001') {
  const product = await findProductBySku(sku);
  renderWithProviders(
    <Routes>
      <Route path="/stok/:productId/ubah" element={<EditProductPage />} />
    </Routes>,
    createTestQueryClient(),
    `/stok/${product.id}/ubah`,
  );
  return product;
}

describe('EditProductPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('form terisi data sekarang dan tidak punya field stok', async () => {
    await renderEdit();

    expect((await screen.findByLabelText<HTMLInputElement>('Nama barang')).value).toBe('Beras Premium 5 kg');
    expect(screen.getByLabelText<HTMLInputElement>('SKU').value).toBe('SBK-001');
    expect(screen.getByLabelText<HTMLInputElement>('Kategori').value).toBe('Sembako');
    expect(screen.getByLabelText<HTMLInputElement>('Harga jual (Rp)').value).toBe('74.000');
    expect(screen.getByLabelText<HTMLInputElement>('Harga beli (Rp)').value).toBe('68.000');
    expect(screen.queryByLabelText('Stok awal')).toBeNull();
  });

  it('menyimpan perubahan harga: pesan tersimpan, riwayat harga bertambah, stok tetap', async () => {
    const user = userEvent.setup();
    const product = await renderEdit();

    const selling = await screen.findByLabelText('Harga jual (Rp)');
    await user.clear(selling);
    await user.type(selling, '75.000');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

    expect(await screen.findByText('Tersimpan. Perubahan Beras Premium 5 kg dicatat.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat detail barang' })).toBeTruthy();
    expect(await db.priceChanges.where('productId').equals(product.id).count()).toBe(1);
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(18);
    expect(screen.getByRole('button', { name: 'Tersimpan' })).toBeTruthy();
  });

  it('menyimpan tanpa perubahan menampilkan pesan dan tidak mengubah data', async () => {
    const user = userEvent.setup();
    await renderEdit();

    await user.click(await screen.findByRole('button', { name: 'Simpan perubahan' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Tidak ada perubahan untuk disimpan.');
    expect(await db.priceChanges.count()).toBe(0);
  });

  it('SKU milik barang lain: pesan di bawah field SKU dan isian lain tidak hilang', async () => {
    const user = userEvent.setup();
    await renderEdit();

    const name = await screen.findByLabelText<HTMLInputElement>('Nama barang');
    await user.clear(name);
    await user.type(name, 'Beras Baru');
    const sku = screen.getByLabelText('SKU');
    await user.clear(sku);
    await user.type(sku, 'mkr-001');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

    await waitFor(() => {
      const describedBy = sku.getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(describedBy)?.textContent).toBe(
        'SKU MKR-001 sudah dipakai oleh Mi Instan Goreng.',
      );
    });
    expect(name.value).toBe('Beras Baru');
    expect((await findProductBySku('SBK-001')).name).toBe('Beras Premium 5 kg');
  });
});
