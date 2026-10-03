// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';

import { db } from '../../../lib/db/database';
import { renderWithProviders, createTestQueryClient } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { createSale } from '../api/create-sale';
import { SaleDetailPage } from './SaleDetailPage';

async function createPlainSale() {
  return createSale({
    items: [
      { productId: (await findProductBySku('SBK-001')).id, quantity: 2, discount: 0 },
      { productId: (await findProductBySku('MKR-001')).id, quantity: 3, discount: 0 },
      { productId: (await findProductBySku('MNM-001')).id, quantity: 1, discount: 0 },
    ],
    paymentMethod: 'tunai',
    transactionDiscount: 0,
    amountPaid: 200000,
    expectedTotal: 162000,
  });
}

function renderDetail(saleId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/penjualan/:saleId" element={<SaleDetailPage />} />
    </Routes>,
    createTestQueryClient(),
    `/penjualan/${saleId}`,
  );
}

describe('SaleDetailPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('retur 1 Beras: pratinjau Rp 74.000, simpan, status menjadi Retur sebagian', async () => {
    const user = userEvent.setup();
    const sale = await createPlainSale();
    renderDetail(sale.id);

    await user.click(await screen.findByText('Retur barang'));
    await user.type(screen.getByLabelText(/Jumlah retur Beras Premium 5 kg/), '1');
    await user.type(screen.getByLabelText('Alasan retur'), 'Kemasan sobek');
    expect(screen.getByText('Uang dikembalikan Rp 74.000')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Simpan retur' }));

    expect(await screen.findByText('Retur sebagian')).toBeTruthy();
    expect(await screen.findByText(/Retur RTR-\d{8}-0001 sebesar Rp 74\.000 dicatat/)).toBeTruthy();
    expect(await db.saleReturns.count()).toBe(1);
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(17);
  });

  it('retur melebihi sisa: pesan di bawah field jumlah dan tidak ada yang tersimpan', async () => {
    const user = userEvent.setup();
    const sale = await createPlainSale();
    renderDetail(sale.id);

    await user.click(await screen.findByText('Retur barang'));
    const quantity = screen.getByLabelText(/Jumlah retur Beras Premium 5 kg/);
    await user.type(quantity, '3');
    await user.type(screen.getByLabelText('Alasan retur'), 'Terlalu banyak');
    await user.click(screen.getByRole('button', { name: 'Simpan retur' }));

    const describedBy = quantity.getAttribute('aria-describedby') ?? '';
    expect(await screen.findByText('Jumlah retur melebihi sisa (2).')).toBeTruthy();
    expect(document.getElementById(describedBy)?.textContent).toBe('Jumlah retur melebihi sisa (2).');
    expect(await db.saleReturns.count()).toBe(0);
  });

  it('batalkan tanpa alasan menampilkan pesan, dengan alasan menjadi Dibatalkan dan aksi hilang', async () => {
    const user = userEvent.setup();
    const sale = await createPlainSale();
    renderDetail(sale.id);

    await user.click(await screen.findByText('Batalkan transaksi'));
    await user.click(screen.getByRole('button', { name: 'Ya, batalkan' }));
    expect(await screen.findByText('Tulis alasan minimal 3 karakter.')).toBeTruthy();
    expect((await db.sales.get(sale.id))?.status).toBe('selesai');

    await user.type(screen.getByLabelText('Alasan pembatalan'), 'Salah input');
    await user.click(screen.getByRole('button', { name: 'Ya, batalkan' }));

    expect(await screen.findByText('Dibatalkan')).toBeTruthy();
    expect(screen.getByText(/Alasan: Salah input/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ya, batalkan' })).toBeNull();
    expect(screen.queryByText('Retur barang')).toBeNull();
    expect((await findProductBySku('SBK-001')).stockQuantity).toBe(18);
  });

  it('id yang tidak ada menampilkan "Transaksi tidak ditemukan"', async () => {
    renderDetail('ngawur');
    expect(await screen.findByText('Transaksi tidak ditemukan')).toBeTruthy();
  });

  it('tidak menampilkan harga beli maupun tombol hapus', async () => {
    const sale = await createPlainSale();
    renderDetail(sale.id);

    await screen.findByRole('heading', { name: sale.number });
    expect(document.body.textContent).not.toContain('68.000');
    expect(screen.queryByRole('button', { name: /hapus/i })).toBeNull();
  });
});
