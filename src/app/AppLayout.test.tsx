// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';

import { renderWithProviders, createTestQueryClient } from '../test/render';
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
  it('pemilik: Stok, Kasir, Riwayat, Pengaturan di tab bar dan header, tanpa penanda mode', () => {
    renderLayout(false);

    expect(labels('Menu bawah')).toEqual(['Stok', 'Kasir', 'Riwayat', 'Pengaturan']);
    expect(labels('Menu utama')).toEqual(['Stok', 'Kasir', 'Riwayat', 'Pengaturan']);
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
