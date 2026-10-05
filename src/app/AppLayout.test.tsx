// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';

import { saveStoreProfile } from '../features/store-profile/api/save-store-profile';
import { renderWithProviders, createTestQueryClient } from '../test/render';
import { resetDatabaseWithSeed } from '../test/reset-database';
import { AppLayout } from './AppLayout';

function renderLayout(isCashierMode: boolean) {
  renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/stok" element={<p>isi halaman</p>} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    '/stok',
    { isCashierMode, hasPin: true },
  );
}

function labels(navName: string) {
  return within(screen.getByRole('navigation', { name: navName }))
    .getAllByRole('link')
    .map((link) => link.textContent);
}

describe('AppLayout', () => {
  it('pemilik: Dasbor, Stok, Kasir, Riwayat, Pengaturan di tab bar dan header, tanpa penanda mode', () => {
    renderLayout(false);

    expect(labels('Menu bawah')).toEqual(['Dasbor', 'Stok', 'Kasir', 'Riwayat', 'Pengaturan']);
    expect(labels('Menu utama')).toEqual(['Dasbor', 'Stok', 'Kasir', 'Riwayat', 'Pengaturan']);
    expect(screen.queryByText('Mode Kasir')).toBeNull();
  });

  it('Mode Kasir: Kasir, Stok, Keluar, dan header bertuliskan Mode Kasir', () => {
    renderLayout(true);

    expect(labels('Menu bawah')).toEqual(['Kasir', 'Stok', 'Keluar']);
    expect(screen.getByText('Mode Kasir')).toBeTruthy();
  });

  it('item aktif ditandai aria-current', () => {
    renderLayout(false);

    const active = within(screen.getByRole('navigation', { name: 'Menu bawah' })).getByRole('link', { name: 'Stok' });
    expect(active.getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('isi halaman')).toBeTruthy();
  });
});

describe('AppLayout: tampilan kerangka', () => {
  beforeEach(resetDatabaseWithSeed);

  it('tab bar: tiap item punya ikon dan label, item aktif ditandai aria-current tanpa garis bawah', () => {
    renderLayout(false);

    const tabBar = within(screen.getByRole('navigation', { name: 'Menu bawah' }));
    for (const link of tabBar.getAllByRole('link')) {
      expect(link.querySelector('svg')).not.toBeNull();
      expect(link.textContent).not.toBe('');
    }
    const active = tabBar.getByRole('link', { name: 'Stok' });
    expect(active.getAttribute('aria-current')).toBe('page');
    expect(active.className).not.toContain('underline');
    expect(tabBar.getByRole('link', { name: 'Kasir' }).getAttribute('aria-current')).toBeNull();
  });

  it('header menampilkan "Toko Saya" bila profil toko kosong', async () => {
    renderLayout(false);

    expect(await screen.findByText('Toko Saya')).toBeTruthy();
  });

  it('header menampilkan nama toko dari profil', async () => {
    await saveStoreProfile({ name: 'Warung Amirul', address: '', phone: '' }, { kind: 'unchanged' });
    renderLayout(false);

    expect(await screen.findByText('Warung Amirul')).toBeTruthy();
    expect(screen.queryByText('Toko Saya')).toBeNull();
  });
});
