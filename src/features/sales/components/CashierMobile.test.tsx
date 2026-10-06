// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../../lib/db/database';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { setViewportWidth } from '../../../test/viewport';
import { CashierPage } from './CashierPage';

const PHONE_WIDTH = 390;

async function addProduct(user: ReturnType<typeof userEvent.setup>, query: string, name: RegExp, times = 1) {
  const input = await screen.findByLabelText('Cari barang');
  await user.clear(input);
  await user.type(input, query);
  const result = await screen.findByRole('button', { name });
  for (let tap = 0; tap < times; tap += 1) await user.click(result);
}

function payBar() {
  const bar = screen.getByRole('button', { name: 'Bayar', hidden: true }).closest('[inert], div');
  if (!bar) throw new Error('Bar Bayar tidak ada');
  return bar;
}

describe('CashierPage di HP: bar Bayar dan Drawer pembayaran', () => {
  beforeEach(async () => {
    setViewportWidth(PHONE_WIDTH);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    setViewportWidth(1280);
    vi.restoreAllMocks();
  });

  it('bar Bayar baru bisa dipakai bila keranjang berisi, memuat jumlah unit dan total', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);
    await screen.findByLabelText('Cari barang');

    expect(screen.getByRole('button', { name: 'Bayar', hidden: true }).closest('[inert]')).not.toBeNull();

    await addProduct(user, 'mi instan goreng', /^Mi Instan Goreng\s*MKR-001/, 3);
    await addProduct(user, 'beras', /^Beras Premium 5 kg\s*SBK-001/);

    expect(screen.getByRole('button', { name: 'Bayar' }).closest('[inert]')).toBeNull();
    expect(payBar().textContent).toContain('4 barang · Rp 84.500');
  });

  it('Bayar membuka Drawer dengan fokus di Uang diterima; Esc menutup dan fokus kembali ke Bayar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);
    await addProduct(user, 'mi instan goreng', /^Mi Instan Goreng\s*MKR-001/);

    const payButton = screen.getByRole('button', { name: 'Bayar' });
    await user.click(payButton);

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByLabelText('Uang diterima')));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(payButton));
    expect(screen.getByLabelText<HTMLInputElement>('Jumlah Mi Instan Goreng').value).toBe('1');
  });

  it('simpan dari Drawer berhasil: Drawer menutup, keranjang kosong, panel sukses tampil', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);
    await addProduct(user, 'mi instan goreng', /^Mi Instan Goreng\s*MKR-001/);

    await user.click(screen.getByRole('button', { name: 'Bayar' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Uang pas' }));
    await user.click(within(dialog).getByRole('button', { name: 'Simpan transaksi' }));

    expect((await screen.findByRole('status')).textContent).toMatch(/Transaksi TRX-\d{8}-0001 tersimpan/);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('list', { name: 'Keranjang' })).toBeNull();
    expect(await db.sales.count()).toBe(1);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Transaksi baru' })));
  });

  it('simpan gagal: error tampil di Drawer dan keranjang tetap utuh', async () => {
    const user = userEvent.setup();
    vi.spyOn(db.saleItems, 'bulkAdd').mockRejectedValueOnce(new Error('penyimpanan penuh'));
    renderWithProviders(<CashierPage />);
    await addProduct(user, 'mi instan goreng', /^Mi Instan Goreng\s*MKR-001/);

    await user.click(screen.getByRole('button', { name: 'Bayar' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Uang pas' }));
    await user.click(within(dialog).getByRole('button', { name: 'Simpan transaksi' }));

    expect(await within(dialog).findByText(/Transaksi tidak tersimpan/)).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Jumlah Mi Instan Goreng').value).toBe('1');
    expect(await db.sales.count()).toBe(0);
  });

  it('uang kurang hanya satu pesan, dan Simpan nonaktif', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CashierPage />);
    await addProduct(user, 'mi instan goreng', /^Mi Instan Goreng\s*MKR-001/);

    await user.click(screen.getByRole('button', { name: 'Bayar' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Uang diterima'), '1000');

    expect(within(dialog).getAllByText(/kurang/i)).toHaveLength(1);
    expect(within(dialog).getByRole('button', { name: 'Simpan transaksi' }).hasAttribute('disabled')).toBe(true);
  });
});
