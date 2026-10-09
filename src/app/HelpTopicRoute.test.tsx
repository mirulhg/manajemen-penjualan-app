// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../test/render';
import { HelpTopicRoute } from './HelpTopicRoute';

function renderRoute(path: string) {
  renderWithProviders(
    <Routes>
      <Route path="/bantuan/:slug" element={<HelpTopicRoute />} />
    </Routes>,
    createTestQueryClient(),
    path,
  );
}

describe('HelpTopicRoute', () => {
  it('slug yang tidak dikenal menampilkan "Halaman tidak ditemukan"', () => {
    renderRoute('/bantuan/abc');
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeTruthy();
  });

  it('slug yang dikenal menampilkan topiknya', () => {
    renderRoute('/bantuan/kasir');
    expect(screen.getByRole('heading', { level: 1, name: 'Mencatat penjualan di Kasir' })).toBeTruthy();
  });
});
