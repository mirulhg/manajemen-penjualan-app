// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { StartupError } from './StartupError';

afterEach(cleanup);

describe('StartupError', () => {
  it('menampilkan judul, tombol Muat ulang, dan pesan error di detail teknis yang tertutup', () => {
    render(<StartupError error={new Error('IndexedDB diblokir')} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Aplikasi gagal dimulai' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Muat ulang' })).toBeTruthy();
    expect(screen.getByText('IndexedDB diblokir').closest('details')?.open).toBe(false);
  });
});
