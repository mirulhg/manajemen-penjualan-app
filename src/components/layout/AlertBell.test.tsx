// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { AlertBell } from './AlertBell';

describe('AlertBell', () => {
  it('teks pembaca layar menyebut jumlah, dan angka tampil hanya bila > 0', () => {
    const { container, unmount } = renderWithProviders(<AlertBell count={12} href="/peringatan" />);
    expect(screen.getByRole('link', { name: 'Peringatan stok, 12 belum dibaca' }).getAttribute('href')).toBe('/peringatan');
    expect(container.textContent).toContain('12');
    unmount();

    const none = renderWithProviders(<AlertBell count={0} href="/peringatan" />);
    expect(screen.getByRole('link', { name: 'Peringatan stok, 0 belum dibaca' })).toBeTruthy();
    expect(none.container.querySelector('[aria-hidden="true"]:not(svg)')).toBeNull();
  });

  it('jumlah di atas 99 ditulis 99+ di tampilan, tetapi lengkap untuk pembaca layar', () => {
    const { container } = renderWithProviders(<AlertBell count={150} href="/peringatan" />);

    expect(container.textContent).toContain('99+');
    expect(screen.getByRole('link', { name: 'Peringatan stok, 150 belum dibaca' })).toBeTruthy();
  });
});
