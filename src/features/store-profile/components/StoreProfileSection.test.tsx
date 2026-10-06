// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { getStoreProfile } from '../../../lib/db/settings';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { StoreProfileSection } from './StoreProfileSection';

describe('StoreProfileSection', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menyimpan profil: toast, tombol berubah, dan isian tetap', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoreProfileSection />);

    await user.type(await screen.findByLabelText('Nama toko'), 'Toko Sari Makmur');
    await user.type(screen.getByLabelText('Telepon (opsional)'), '0812345678');
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));

    expect(await screen.findByText(/Profil toko disimpan\. Dipakai di kop laporan\./)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tersimpan' })).toBeTruthy();
    expect(await getStoreProfile()).toMatchObject({ name: 'Toko Sari Makmur', phone: '0812345678' });
  });

  it('nama terlalu pendek: pesan di bawah field, tidak tersimpan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoreProfileSection />);

    const field = await screen.findByLabelText('Nama toko');
    await user.type(field, 'A');
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));

    expect(await screen.findByText('Tulis nama toko minimal 2 karakter.')).toBeTruthy();
    expect(field.getAttribute('aria-describedby')).toBe('store-name-error');
    expect(await db.settings.get('storeProfile')).toBeUndefined();
  });

  it('telepon tidak valid ditolak dan isian tidak hilang', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoreProfileSection />);

    await user.type(await screen.findByLabelText('Nama toko'), 'Toko Sari');
    await user.type(screen.getByLabelText('Telepon (opsional)'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));

    expect(await screen.findByText(/Telepon hanya boleh angka/)).toBeTruthy();
    expect(screen.getByDisplayValue('Toko Sari')).toBe(screen.getByLabelText('Nama toko'));
    expect(await db.settings.get('storeProfile')).toBeUndefined();
  });
});
