// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MapPinOff } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';

import { ErrorScreen } from './ErrorScreen';

afterEach(cleanup);

function renderScreen(detail?: string) {
  render(
    <ErrorScreen icon={MapPinOff} title="Judul uji" description="Penjelasan uji" detail={detail}>
      <button type="button">Aksi uji</button>
    </ErrorScreen>,
  );
}

describe('ErrorScreen', () => {
  it('menampilkan judul sebagai h1, penjelasan, dan aksi', () => {
    renderScreen();

    expect(screen.getByRole('heading', { level: 1, name: 'Judul uji' })).toBeTruthy();
    expect(screen.getByText('Penjelasan uji')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Aksi uji' })).toBeTruthy();
  });

  it('detail teknis tertutup secara default dan berisi pesan', () => {
    renderScreen('pesan error asli');

    const details = screen.getByText('Detail teknis').closest('details');
    expect(details?.open).toBe(false);
    expect(screen.getByText('pesan error asli')).toBeTruthy();
  });

  it('tanpa detail tidak ada elemen details', () => {
    renderScreen();

    expect(screen.queryByText('Detail teknis')).toBeNull();
  });
});
