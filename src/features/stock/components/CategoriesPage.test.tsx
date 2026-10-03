// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { archiveProduct } from '../api/archive-product';
import { CategoriesPage } from './CategoriesPage';

async function renderPage() {
  renderWithProviders(<CategoriesPage />);
  return screen.findByRole('list');
}

function rowOf(list: HTMLElement, name: string) {
  const row = within(list)
    .getAllByRole('listitem')
    .find((item) => within(item).queryByText(name) !== null);
  if (!row) throw new Error(`Baris ${name} tidak ada`);
  return row;
}

describe('CategoriesPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menampilkan 6 kategori A–Z dengan jumlah barang aktif', async () => {
    const list = await renderPage();

    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(6);
    expect(rows.map((row) => row.querySelector('p')?.textContent)).toEqual([
      'Bumbu Dapur',
      'Kebutuhan Rumah',
      'Makanan Ringan',
      'Minuman',
      'Perlengkapan Mandi',
      'Sembako',
    ]);
    expect(within(rowOf(list, 'Bumbu Dapur')).getByText('5 barang aktif')).toBeTruthy();
  });

  it('menambah kategori: muncul dengan 0 barang aktif; nama yang sama ditolak', async () => {
    const user = userEvent.setup();
    const list = await renderPage();

    await user.type(screen.getByLabelText('Kategori baru'), 'Alat Tulis');
    await user.click(screen.getByRole('button', { name: 'Tambah kategori' }));

    expect(await screen.findByText('Kategori Alat Tulis ditambahkan.')).toBeTruthy();
    expect(within(rowOf(list, 'Alat Tulis')).getByText('0 barang aktif')).toBeTruthy();

    await user.type(screen.getByLabelText('Kategori baru'), 'alat tulis');
    await user.click(screen.getByRole('button', { name: 'Tambah kategori' }));
    expect(await screen.findByText('Kategori alat tulis sudah ada.')).toBeTruthy();
  });

  it('Hapus pada kategori yang dipakai nonaktif dengan alasannya', async () => {
    const list = await renderPage();

    const row = rowOf(list, 'Sembako');
    const button = within(row).getByRole<HTMLButtonElement>('button', { name: 'Hapus' });
    expect(button.disabled).toBe(true);
    expect(within(row).getByText('Masih dipakai 6 barang (termasuk yang diarsipkan).')).toBeTruthy();
  });

  it('menghapus kategori kosong setelah konfirmasi', async () => {
    const user = userEvent.setup();
    const list = await renderPage();
    await user.type(screen.getByLabelText('Kategori baru'), 'Alat Tulis');
    await user.click(screen.getByRole('button', { name: 'Tambah kategori' }));
    await screen.findByText('Kategori Alat Tulis ditambahkan.');

    await user.click(within(rowOf(list, 'Alat Tulis')).getByText('Hapus'));
    await user.click(screen.getByRole('button', { name: 'Ya, hapus' }));

    await waitFor(() => expect(within(list).queryByText('Alat Tulis')).toBeNull());
    expect(await db.categories.count()).toBe(6);
  });

  it('mengganti nama: produk ikut berubah dan fokus kembali ke tombol Ubah nama', async () => {
    const user = userEvent.setup();
    const list = await renderPage();

    const row = rowOf(list, 'Bumbu Dapur');
    await user.click(within(row).getByRole('button', { name: 'Ubah nama' }));
    const input = screen.getByLabelText('Nama kategori');
    await user.clear(input);
    await user.type(input, 'Bumbu & Rempah');
    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await within(list).findByText('Bumbu & Rempah')).toBeTruthy();
    expect(await db.products.where('category').equals('Bumbu & Rempah').count()).toBe(5);
    expect(document.activeElement).toBe(within(rowOf(list, 'Bumbu & Rempah')).getByRole('button', { name: 'Ubah nama' }));
  });

  it('mengganti nama dengan nama kategori lain menampilkan error; Batal mengembalikan fokus', async () => {
    const user = userEvent.setup();
    const list = await renderPage();

    const row = rowOf(list, 'Minuman');
    const trigger = within(row).getByRole('button', { name: 'Ubah nama' });
    await user.click(trigger);
    const input = screen.getByLabelText('Nama kategori');
    await user.clear(input);
    await user.type(input, 'sembako');
    await user.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(await screen.findByText('Kategori sembako sudah ada.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByLabelText('Nama kategori')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('menampilkan jumlah barang diarsipkan', async () => {
    await archiveProduct((await findProductBySku('MKR-005')).id);
    const list = await renderPage();

    expect(within(rowOf(list, 'Makanan Ringan')).getByText('4 barang aktif · 1 diarsipkan')).toBeTruthy();
  });
});
