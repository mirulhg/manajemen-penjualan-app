// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { NewProductForm } from './NewProductForm';

describe('NewProductForm', () => {
  beforeEach(resetDatabaseWithSeed);

  it('SKU kembar: pesan menyebut pemilik di bawah field SKU, isian lain tidak hilang', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewProductForm categories={[]} units={[]} />);

    await user.type(screen.getByLabelText('Nama barang'), 'Beras Murah 5 kg');
    await user.type(screen.getByLabelText('SKU'), 'sbk-001');
    await user.type(screen.getByLabelText('Kategori'), 'Sembako');
    await user.type(screen.getByLabelText('Satuan'), 'sak');
    await user.type(screen.getByLabelText('Stok awal'), '5');
    await user.type(screen.getByLabelText('Harga beli (Rp)'), '60.000');
    await user.type(screen.getByLabelText('Harga jual (Rp)'), '65.000');
    await user.click(screen.getByRole('button', { name: 'Simpan barang' }));

    const skuInput = screen.getByLabelText('SKU');
    await waitFor(() => {
      const describedBy = skuInput.getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(describedBy)?.textContent).toBe(
        'SKU SBK-001 sudah dipakai oleh Beras Premium 5 kg.',
      );
    });
    expect(screen.getByLabelText<HTMLInputElement>('Nama barang').value).toBe('Beras Murah 5 kg');
    expect(screen.getByLabelText<HTMLInputElement>('Harga beli (Rp)').value).toBe('60.000');
    expect(await db.products.count()).toBe(30);
  });

  it('petunjuk batas menipis menyebut batas default dari pengaturan', () => {
    const first = renderWithProviders(<NewProductForm categories={[]} units={[]} />);
    expect(screen.getByText('Kosongkan untuk memakai batas default 5.')).toBeTruthy();
    first.unmount();

    renderWithProviders(<NewProductForm categories={[]} units={[]} />, createTestQueryClient(), '/', { defaultMinStock: 7 });
    expect(screen.getByText('Kosongkan untuk memakai batas default 7.')).toBeTruthy();
  });
});
