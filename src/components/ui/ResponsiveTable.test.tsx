// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { setViewportWidth } from '../../test/viewport';
import { ResponsiveTable } from './ResponsiveTable';
import type { TableColumn } from './ResponsiveTable';

type Row = { name: string; profit: number; revenue: number };

const ROWS: Row[] = [
  { name: 'Kecap Manis 520 ml', profit: 84_000, revenue: 616_000 },
  { name: 'Minyak Goreng 2 L', profit: 68_000, revenue: 646_000 },
];

const COLUMNS: TableColumn<Row>[] = [
  { header: 'Produk', cell: (row) => row.name },
  { header: 'Omzet', cell: (row) => `Rp ${row.revenue}` },
  { header: 'Laba kotor', cell: (row) => `Rp ${row.profit}` },
];

function renderTable() {
  return renderWithProviders(
    <ResponsiveTable
      caption="Laba per produk"
      columns={COLUMNS}
      rows={ROWS}
      getKey={(row) => row.name}
      summary={{
        title: (row) => row.name,
        value: (row) => `Rp ${row.profit}`,
        detail: (row) => `Omzet Rp ${row.revenue}`,
      }}
    />,
  );
}

describe('ResponsiveTable', () => {
  afterEach(() => {
    setViewportWidth(1280);
  });

  it('md ke atas: hanya tabel, tanpa daftar ringkas', () => {
    renderTable();

    expect(screen.getByRole('table', { name: 'Laba per produk' })).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Laba per produk' })).toBeNull();
  });

  it('di bawah md: daftar ringkas berisi angka kunci di kanan dan angka pendukung di baris kedua', () => {
    setViewportWidth(390);
    renderTable();

    const list = screen.getByRole('list', { name: 'Laba per produk' });
    const first = within(list).getAllByRole('listitem')[0];
    expect(first?.textContent).toContain('Kecap Manis 520 ml');
    expect(first?.textContent).toContain('Omzet Rp 616000');
    expect(first?.textContent).toContain('Rp 84000');
  });

  it('cetak selalu tabel lengkap: tabel tetap ada di HP dan memaksa tampil lewat print:, daftar disembunyikan saat cetak', () => {
    setViewportWidth(390);
    renderTable();

    const tableWrapper = screen.getByText('Laba per produk', { selector: 'caption' }).closest('div');
    expect(tableWrapper?.className).toContain('hidden');
    expect(tableWrapper?.className).toContain('md:block');
    expect(tableWrapper?.className).toContain('print:block');
    expect(screen.getByRole('list', { name: 'Laba per produk' }).className).toContain('print:hidden');
  });
});
