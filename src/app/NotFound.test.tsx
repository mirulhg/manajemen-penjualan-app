// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../test/render';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('pemilik: judul, penjelasan, dan tautan Ke Dasbor tanpa tombol kembali', () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByRole('heading', { level: 1, name: 'Halaman tidak ditemukan' })).toBeTruthy();
    expect(screen.getByText(/Mungkin salah ketik/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ke Dasbor' }).getAttribute('href')).toBe('/dasbor');
    expect(screen.queryByText(/Kembali/)).toBeNull();
  });

  it('Mode Kasir: tautan menjadi Ke Kasir', () => {
    renderWithProviders(<NotFound />, undefined, '/abc', { isCashierMode: true, hasPin: true });

    expect(screen.getByRole('link', { name: 'Ke Kasir' }).getAttribute('href')).toBe('/kasir');
    expect(screen.queryByRole('link', { name: 'Ke Dasbor' })).toBeNull();
  });
});
