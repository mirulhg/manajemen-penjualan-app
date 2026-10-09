// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { HelpSheetHost } from './HelpSheetHost';

// Meniru chunk isi panduan yang gagal diunduh (offline atau versi baru).
vi.mock('./HelpTopicSheet', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

function Harness() {
  const location = useLocation();
  return (
    <>
      <p>aplikasi tetap hidup</p>
      <p data-testid="lokasi">{location.pathname + location.search}</p>
      <HelpSheetHost />
    </>
  );
}

describe('HelpSheetHost saat isi panduan gagal dimuat', () => {
  it('menampilkan toast, menghapus parameter, dan tidak menjatuhkan aplikasi', async () => {
    renderWithProviders(
      <Routes>
        <Route path="*" element={<Harness />} />
      </Routes>,
      createTestQueryClient(),
      '/stok?q=beras&bantuan=kasir',
    );

    expect(await screen.findByText('Panduan belum bisa dimuat. Periksa koneksi internet, lalu coba lagi.')).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('lokasi').textContent).toBe('/stok?q=beras'));
    expect(screen.getByText('aplikasi tetap hidup')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
