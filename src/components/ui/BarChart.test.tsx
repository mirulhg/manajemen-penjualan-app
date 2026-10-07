// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { BarChart } from './BarChart';

const DATA = [
  { label: 'Sembako', value: 2_000 },
  { label: 'Minuman', value: 500 },
  { label: 'Makanan Ringan', value: 100 },
];

function renderBars(orientation: 'horizontal' | 'vertical') {
  return renderWithProviders(
    <BarChart
      title="Omzet per kategori produk"
      data={DATA}
      orientation={orientation}
      formatValue={(value) => `Rp ${value}`}
      columns={{ label: 'Kategori', value: 'Omzet' }}
    />,
  );
}

describe('BarChart', () => {
  it('satu seri: tanpa legenda, dan hanya batang terbesar yang diberi label nilai', () => {
    const { container } = renderBars('vertical');

    expect(container.querySelector('figure > ul')).toBeNull();
    // Dibatasi ke area batang; tabel (tersembunyi) memang memuat semua nilai.
    const bars = container.querySelector('[aria-hidden="true"]');
    expect(bars?.textContent).toContain('Rp 2000');
    expect(bars?.textContent).not.toContain('Rp 500');
  });

  it('keyboard: panah memindahkan batang yang disorot dan mengumumkan nilainya', async () => {
    const { container } = renderBars('horizontal');
    const live = container.querySelector('[aria-live="polite"]');

    await userEvent.tab();
    expect(live?.textContent).toBe('Sembako: Rp 2000');
    await userEvent.keyboard('{ArrowDown}');
    expect(live?.textContent).toBe('Minuman: Rp 500');
    // Batang yang disorot menampilkan nilainya.
    expect(container.querySelectorAll('li')[1]?.textContent).toContain('Rp 500');
  });

  it('tabel alternatif memuat semua batang dengan nilainya', async () => {
    renderBars('horizontal');
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan tabel' }));

    const table = screen.getByRole('table', { name: 'Omzet per kategori produk' });
    expect([...table.querySelectorAll('tbody tr')].map((row) => row.textContent)).toEqual([
      'SembakoRp 2000',
      'MinumanRp 500',
      'Makanan RinganRp 100',
    ]);
    expect([...table.querySelectorAll('th')].map((cell) => cell.textContent)).toEqual(['Kategori', 'Omzet']);
  });

  it('tanpa data tidak merender apa pun', () => {
    const { container } = renderWithProviders(
      <BarChart
        title="Kosong"
        data={[]}
        orientation="vertical"
        formatValue={String}
        columns={{ label: 'Jam', value: 'Transaksi' }}
      />,
    );
    expect(container.querySelector('figure')).toBeNull();
  });

  it('menyorot batang hanya untuk mouse, bukan sentuhan', () => {
    const { container } = renderBars('horizontal');
    const rows = container.querySelectorAll('ul > li');
    const minuman = rows[1];
    if (!minuman) throw new Error('Baris Minuman tidak ditemukan');

    fireEvent.pointerEnter(minuman, { pointerType: 'touch' });
    expect(minuman.className).not.toContain('opacity-60');
    expect(rows[0]?.className).not.toContain('opacity-60');

    fireEvent.pointerEnter(minuman, { pointerType: 'mouse' });
    expect(rows[0]?.className).toContain('opacity-60');
  });
});
