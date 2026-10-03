// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { MIXED_IMPORT_CSV } from '../../../test/import-sample';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { OwnerOnly } from '../../session';
import { ImportProductsPage } from './ImportProductsPage';

describe('ImportProductsPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('CSV campur: pratinjau 8/1/6, impor, lalu hasil dan tombol laporan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImportProductsPage />);

    await user.upload(
      screen.getByLabelText('File barang'),
      new File([MIXED_IMPORT_CSV], 'campur.csv', { type: 'text/csv' }),
    );

    expect(await screen.findByText('Siap diimpor 8 · Dilewati 1 · Gagal 6')).toBeTruthy();
    expect(screen.getByText('Baris 10: SKU sudah ada: Beras Premium 5 kg')).toBeTruthy();
    expect(screen.getByText('SKU ATK-001 sudah ada di baris 2')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Impor 8 barang' }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('8 barang berhasil diimpor.');
    expect(status.textContent).toContain('Dilewati 1');
    expect(status.textContent).toContain('Gagal 6');
    expect(screen.getByRole('button', { name: 'Unduh laporan baris gagal' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat daftar stok' })).toBeTruthy();
    expect(await db.products.count()).toBe(38);
  });

  it('semua baris sudah ada: tombol impor nonaktif', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImportProductsPage />);
    const csv = 'SKU;Nama;Kategori;Satuan;Stok Awal;Batas Minimum;Harga Beli;Harga Jual\nSBK-001;Beras;Sembako;sak;1;;1000;2000\n';

    await user.upload(screen.getByLabelText('File barang'), new File([csv], 'ada.csv'));

    expect(await screen.findByText('Siap diimpor 0 · Dilewati 1 · Gagal 0')).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Impor 0 barang' }).disabled).toBe(true);
  });

  it('kolom wajib hilang dan file PDF dijelaskan dengan langkah berikutnya', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderWithProviders(<ImportProductsPage />);

    await user.upload(screen.getByLabelText('File barang'), new File(['SKU;Nama\nA-1;x\n'], 'kurang.csv'));
    expect((await screen.findByRole('alert')).textContent).toContain('Kolom Kategori, Satuan, Stok Awal, Harga Beli, Harga Jual tidak ditemukan');

    await user.upload(screen.getByLabelText('File barang'), new File(['x'], 'daftar.pdf'));
    expect((await screen.findByRole('alert')).textContent).toContain('Format file tidak didukung');
  });

  it('Pilih file lain kembali ke langkah pertama', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImportProductsPage />);

    await user.upload(screen.getByLabelText('File barang'), new File([MIXED_IMPORT_CSV], 'campur.csv'));
    await user.click(await screen.findByRole('button', { name: 'Pilih file lain' }));

    expect(screen.getByLabelText('File barang')).toBeTruthy();
  });

  it('di Mode Kasir halaman impor menampilkan pesan khusus pemilik', () => {
    renderWithProviders(
      <OwnerOnly>
        <ImportProductsPage />
      </OwnerOnly>,
      undefined,
      '/stok/impor',
      { isCashierMode: true, hasPin: true },
    );

    expect(screen.getByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    expect(screen.queryByLabelText('File barang')).toBeNull();
  });
});
