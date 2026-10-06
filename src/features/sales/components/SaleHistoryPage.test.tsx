// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { setViewportWidth } from '../../../test/viewport';
import { createSale } from '../api/create-sale';
import { SaleHistoryPage } from './SaleHistoryPage';

async function createTwoSales() {
  const beras = (await findProductBySku('SBK-001')).id;
  const cash = await createSale({
    items: [{ productId: beras, quantity: 2, discount: 0 }],
    paymentMethod: 'tunai',
    transactionDiscount: 0,
    amountPaid: 150000,
    expectedTotal: 148000,
  });
  const qris = await createSale({
    items: [{ productId: beras, quantity: 1, discount: 4000 }],
    paymentMethod: 'qris',
    transactionDiscount: 2000,
    expectedTotal: 68000,
  });
  return { cash, qris };
}

describe('SaleHistoryPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menampilkan ringkasan dan daftar hari ini dengan yang terbaru di atas', async () => {
    const { cash, qris } = await createTwoSales();
    renderWithProviders(<SaleHistoryPage />, undefined, '/penjualan');

    expect(await screen.findByText('2 transaksi · Omzet Rp 216.000')).toBeTruthy();
    const items = screen.getAllByRole('link').map((link) => link.textContent ?? '');
    expect(items[0]).toContain(qris.number);
    expect(items[1]).toContain(cash.number);
  });

  it('filter metode QRIS hanya menampilkan transaksi QRIS', async () => {
    const user = userEvent.setup();
    const { cash, qris } = await createTwoSales();
    renderWithProviders(<SaleHistoryPage />, undefined, '/penjualan');

    await screen.findByText('2 transaksi · Omzet Rp 216.000');
    await user.selectOptions(screen.getByLabelText('Metode bayar'), 'qris');

    expect(await screen.findByText('1 transaksi · Omzet Rp 68.000')).toBeTruthy();
    expect(screen.getByText(new RegExp(qris.number))).toBeTruthy();
    expect(screen.queryByText(new RegExp(cash.number))).toBeNull();
  });

  it('periode kemarin tanpa transaksi menampilkan pesan kosong', async () => {
    const user = userEvent.setup();
    await createTwoSales();
    renderWithProviders(<SaleHistoryPage />, undefined, '/penjualan');

    await screen.findByText('2 transaksi · Omzet Rp 216.000');
    await user.selectOptions(screen.getByLabelText('Periode'), 'kemarin');

    expect(await screen.findByText('Belum ada transaksi di periode ini')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Buka kasir' }).getAttribute('href')).toBe('/kasir');
  });

  it('status ditulis sebagai teks pada setiap transaksi', async () => {
    await createTwoSales();
    renderWithProviders(<SaleHistoryPage />, undefined, '/penjualan');

    await screen.findByText('2 transaksi · Omzet Rp 216.000');
    expect(screen.getAllByText('Selesai')).toHaveLength(2);
  });

  it('keadaan kosong saat difilter menyebut metodenya; Hapus filter menghapus metode dan periode tetap', async () => {
    const user = userEvent.setup();
    await createTwoSales();
    renderWithProviders(<SaleHistoryPage />, createTestQueryClient(), '/penjualan?periode=kemarin&metode=qris');

    expect(await screen.findByText('Tidak ada transaksi QRIS di periode ini')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Hapus filter' }));

    expect(await screen.findByText('Belum ada transaksi di periode ini')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Buka kasir' })).toBeTruthy();
    expect(screen.getByLabelText<HTMLSelectElement>('Periode').value).toBe('kemarin');
  });

  describe('di HP', () => {
    afterEach(() => {
      setViewportWidth(1280);
    });

    it('filter metode tampil sebagai chip yang bisa dihapus, dan periode tetap terlihat', async () => {
      setViewportWidth(390);
      const user = userEvent.setup();
      await createTwoSales();
      renderWithProviders(<SaleHistoryPage />, createTestQueryClient(), '/penjualan?metode=qris');

      expect(await screen.findByText('1 transaksi · Omzet Rp 68.000')).toBeTruthy();
      expect(screen.getByLabelText('Periode')).toBeTruthy();

      await user.click(screen.getByRole('button', { name: 'Hapus filter Metode bayar: QRIS' }));

      expect(await screen.findByText('2 transaksi · Omzet Rp 216.000')).toBeTruthy();
      expect(screen.queryByRole('button', { name: /Hapus filter Metode bayar/ })).toBeNull();
    });
  });
});
