// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { setViewportWidth } from '../../../test/viewport';
import { archiveProduct } from '../api/archive-product';
import { StockListItem } from './StockListItem';
import { StockListPage } from './StockListPage';

const PHONE_WIDTH = 390;
const NAME_LENGTH = 80;

describe('filter daftar stok', () => {
  beforeEach(resetDatabaseWithSeed);

  afterEach(() => {
    setViewportWidth(1280);
  });

  it('HP: chip kategori menghapus filter terkait dan mengubah daftar', async () => {
    setViewportWidth(PHONE_WIDTH);
    const user = userEvent.setup();
    renderWithProviders(<StockListPage />, createTestQueryClient(), '/stok?kategori=Sembako');

    expect(await screen.findByText('Menampilkan 6 dari 30 barang')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Filter\s*1/ })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Hapus filter Kategori: Sembako' }));

    expect(await screen.findByText('Menampilkan 30 dari 30 barang')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Hapus filter Kategori/ })).toBeNull();
  });

  it('HP: tombol Filter membuka Drawer berisi kategori, status, urutan, dan switch arsip', async () => {
    setViewportWidth(PHONE_WIDTH);
    const user = userEvent.setup();
    renderWithProviders(<StockListPage />);

    await user.click(await screen.findByRole('button', { name: 'Filter' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('#stock-category')).not.toBeNull();
    expect(dialog.querySelector('#stock-status')).not.toBeNull();
    expect(dialog.querySelector('#stock-sort')).not.toBeNull();
    expect(screen.getByRole('switch', { name: 'Tampilkan barang diarsipkan' })).toBeTruthy();
  });

  it('desktop: switch arsip menampilkan barang diarsipkan', async () => {
    const roti = await findProductBySku('MKR-005');
    await archiveProduct(roti.id);
    const user = userEvent.setup();
    renderWithProviders(<StockListPage />);

    expect(await screen.findByText('Menampilkan 29 dari 29 barang')).toBeTruthy();
    await user.click(screen.getByRole('switch', { name: 'Tampilkan barang diarsipkan' }));

    expect(await screen.findByText('Menampilkan 30 dari 30 barang')).toBeTruthy();
  });
});

describe('baris stok dengan data ekstrem', () => {
  beforeEach(resetDatabaseWithSeed);

  it('nama 80 karakter dipotong dua baris, bukan meluber', async () => {
    const product = { ...(await findProductBySku('SBK-001')), name: 'A'.repeat(NAME_LENGTH) };
    renderWithProviders(<StockListItem product={product} />);

    const name = screen.getByText('A'.repeat(NAME_LENGTH));
    expect(name.className).toContain('line-clamp-2');
  });
});
