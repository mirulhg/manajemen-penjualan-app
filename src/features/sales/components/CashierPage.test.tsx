// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { CashierPage } from './CashierPage';

async function search(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = await screen.findByLabelText('Cari barang');
  await user.clear(input);
  await user.type(input, text);
}

describe('CashierPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('cari, ketuk dua kali, uang pas, simpan, lalu transaksi baru mengosongkan keranjang', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);

    await search(user, 'beras');
    const result = await screen.findByRole('button', { name: /^Beras Premium 5 kg\s*SBK-001/ });
    await user.click(result);
    await user.click(result);

    const quantity = screen.getByLabelText<HTMLInputElement>('Jumlah Beras Premium 5 kg');
    expect(quantity.value).toBe('2');
    expect(within(screen.getByRole('list', { name: 'Keranjang' })).getByText('Rp 148.000')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Uang pas' }));
    await user.click(screen.getByRole('button', { name: 'Simpan transaksi' }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toMatch(/Transaksi TRX-\d{8}-0001 tersimpan/);
    expect(await db.sales.count()).toBe(1);
    expect(screen.queryByRole('list', { name: 'Keranjang' })).toBeNull();

    const newSale = screen.getByRole('button', { name: 'Transaksi baru' });
    expect(document.activeElement).toBe(newSale);
    await user.click(newSale);

    expect(screen.queryByRole('status')).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText('Cari barang'));
  });

  it('barang yang stoknya habis: simpan nonaktif dan alasannya tertulis', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);

    await search(user, 'telur');
    await user.click(await screen.findByRole('button', { name: /^Telur Ayam 1 kg\s*SBK-005/ }));

    expect(screen.getByText('Stok tidak cukup (tersedia 0)')).toBeTruthy();
    expect(screen.getByText('Ada barang yang melebihi stok.')).toBeTruthy();
    const submit = screen.getByRole('button', { name: 'Simpan transaksi' });
    expect(submit.hasAttribute('disabled')).toBe(true);
  });

  it('tidak pernah menampilkan harga beli di halaman kasir', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);

    await search(user, 'beras');
    await user.click(await screen.findByRole('button', { name: /^Beras Premium 5 kg\s*SBK-001/ }));

    expect(document.body.textContent).not.toContain('68.000');
    expect(document.body.textContent).toContain('74.000');
  });

  it('uang kurang: pesan kekurangan tampil dan simpan nonaktif', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);

    await search(user, 'beras');
    await user.click(await screen.findByRole('button', { name: /^Beras Premium 5 kg\s*SBK-001/ }));
    await user.type(screen.getByLabelText('Uang diterima'), '50000');

    expect(screen.getAllByText(/Uang (diterima )?kurang Rp 24\.000/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Simpan transaksi' }).hasAttribute('disabled')).toBe(true);
  });
});
