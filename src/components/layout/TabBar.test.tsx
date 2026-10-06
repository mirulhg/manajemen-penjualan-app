// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Package } from 'lucide-react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { TabBar } from './TabBar';

const ITEMS = [
  { to: '/dasbor', label: 'Dasbor', icon: Home },
  { to: '/stok', label: 'Stok', icon: Package },
];

function countIndicators(link: HTMLElement) {
  return link.querySelectorAll('.bg-accent').length;
}

describe('TabBar', () => {
  afterEach(cleanup);

  it('indikator aktif hanya satu dan pindah ke tab yang baru dibuka', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/dasbor']}>
        <TabBar items={ITEMS} />
      </MemoryRouter>,
    );
    const dasbor = screen.getByRole('link', { name: 'Dasbor' });
    const stok = screen.getByRole('link', { name: 'Stok' });

    expect(countIndicators(dasbor)).toBe(1);
    expect(countIndicators(stok)).toBe(0);

    await user.click(stok);

    expect(countIndicators(dasbor)).toBe(0);
    expect(countIndicators(stok)).toBe(1);
  });
});
