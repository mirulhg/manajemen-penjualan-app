// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChartSection } from './ChartSection';

afterEach(cleanup);

function renderSection(status: Partial<Parameters<typeof ChartSection>[0]['status']>) {
  render(
    <ChartSection title="Contoh" status={{ isPending: false, error: null, isEmpty: true, onRetry: vi.fn(), ...status }}>
      <p>isi</p>
    </ChartSection>,
  );
}

describe('ChartSection', () => {
  it('keadaan kosong memakai teks bawaan tentang periode', () => {
    renderSection({});
    expect(screen.getByText('Belum ada penjualan di periode ini.')).toBeTruthy();
  });

  it('keadaan kosong memakai emptyText bila diberikan', () => {
    renderSection({ emptyText: 'Teks khusus.' });
    expect(screen.getByText('Teks khusus.')).toBeTruthy();
    expect(screen.queryByText('Belum ada penjualan di periode ini.')).toBeNull();
  });

  it('bila tidak kosong, menampilkan isinya', () => {
    renderSection({ isEmpty: false });
    expect(screen.getByText('isi')).toBeTruthy();
  });
});
