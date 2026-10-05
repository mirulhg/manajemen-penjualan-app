// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from './alert';
import { Badge } from './badge';
import { buttonVariants } from './button';

describe('primitif tema', () => {
  it('Alert destructive untuk error (role alert) dan success untuk sukses (role status), bukan token status stok', () => {
    render(
      <>
        <Alert variant="destructive">Gagal menyimpan</Alert>
        <Alert variant="success" role="status">
          Tersimpan
        </Alert>
      </>,
    );

    const error = screen.getByRole('alert');
    expect(error.className).toContain('text-destructive');
    expect(error.className).not.toContain('status-habis');
    const success = screen.getByRole('status');
    expect(success.className).toContain('text-success');
    expect(success.className).not.toContain('status-aman');
  });

  it('Badge status stok tetap memakai token status', () => {
    render(<Badge variant="habis">Habis</Badge>);

    expect(screen.getByText('Habis').className).toContain('status-habis');
  });

  it('Button: tinggi 44px bawaan, 48px untuk aksi utama (lg), semuanya memakai press', () => {
    expect(buttonVariants()).toContain('h-11');
    expect(buttonVariants({ size: 'lg' })).toContain('h-12');
    expect(buttonVariants({ size: 'icon' })).toContain('size-11');
    for (const variant of ['default', 'accent', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const) {
      expect(buttonVariants({ variant })).toContain('press');
    }
  });
});
