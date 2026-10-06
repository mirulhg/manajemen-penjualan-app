// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { LineChart } from './LineChart';

const CURRENT = [
  { label: '1 Okt', value: 1_000 },
  { label: '2 Okt', value: 2_000 },
  { label: '3 Okt', value: 0 },
];
const PREVIOUS = [
  { label: '24 Sep', value: 500 },
  { label: '25 Sep', value: 1_500 },
  { label: '26 Sep', value: 2_500 },
];

function renderChart(withComparison: boolean) {
  return renderWithProviders(
    <LineChart
      title="Omzet per periode"
      series={[
        { name: 'Periode ini', points: CURRENT },
        ...(withComparison ? [{ name: 'Periode sebelumnya', points: PREVIOUS }] : []),
      ]}
      formatValue={(value) => `Rp ${value}`}
      formatAxis={(value) => `Rp ${value}`}
      labelHeader="Tanggal"
    />,
  );
}

describe('LineChart label langsung', () => {
  it('dua seri: nama pendek tiap seri ada di ujung kanan garis, selain legenda dan tabel', () => {
    renderWithProviders(
      <LineChart
        title="Omzet per periode"
        series={[
          { name: 'Periode ini', shortName: 'Periode ini', points: CURRENT },
          { name: 'Periode sebelumnya', shortName: 'Sebelumnya', points: PREVIOUS },
        ]}
        formatValue={(value) => `Rp ${value}`}
        formatAxis={(value) => `Rp ${value}`}
        labelHeader="Tanggal"
      />,
    );

    const labels = screen.getAllByText('Sebelumnya');
    expect(labels).toHaveLength(1);
    expect(labels[0]?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getAllByText('Periode ini').length).toBeGreaterThanOrEqual(2);
  });
});

describe('LineChart', () => {
  it('tabel alternatif memuat nilai yang sama dengan data, termasuk hari bernilai 0', async () => {
    renderChart(true);

    expect(screen.queryByRole('table')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan tabel' }));

    const table = screen.getByRole('table', { name: 'Omzet per periode' });
    const rows = [...table.querySelectorAll('tbody tr')].map((row) =>
      [...row.querySelectorAll('td')].map((cell) => cell.textContent),
    );
    expect(rows).toEqual([
      ['1 Okt', 'Rp 1000', 'Rp 500'],
      ['2 Okt', 'Rp 2000', 'Rp 1500'],
      ['3 Okt', 'Rp 0', 'Rp 2500'],
    ]);
    expect(screen.getByRole('button', { name: 'Sembunyikan tabel' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('fokus menampilkan titik pertama; panah kanan memindahkan titik dan mengumumkan nilainya', async () => {
    const { container } = renderChart(true);
    const live = container.querySelector('[aria-live="polite"]');

    await userEvent.tab();
    expect(live?.textContent).toBe('1 Okt: Periode ini Rp 1000, Periode sebelumnya Rp 500');

    await userEvent.keyboard('{ArrowRight}');
    expect(live?.textContent).toBe('2 Okt: Periode ini Rp 2000, Periode sebelumnya Rp 1500');

    await userEvent.keyboard('{End}');
    expect(live?.textContent).toContain('3 Okt: Periode ini Rp 0');
    await userEvent.keyboard('{ArrowRight}');
    expect(live?.textContent).toContain('3 Okt');

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(live?.textContent).toContain('1 Okt');
  });

  it('tooltip muncul saat fokus dan berisi label, nilai, serta nilai pembanding', async () => {
    renderChart(true);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByText('Periode sebelumnya (25 Sep): Rp 1500')).toBeTruthy();
    expect(screen.getByText('Periode ini: Rp 2000')).toBeTruthy();
  });

  it('dua seri: legenda teks ada, garis pembanding putus-putus; satu seri: tanpa legenda', () => {
    const { container, unmount } = renderChart(true);
    expect(container.querySelector('figure > ul')?.textContent).toBe('Periode iniPeriode sebelumnya');
    const dashes = [...container.querySelectorAll('polyline')].map((line) => line.getAttribute('stroke-dasharray'));
    expect(dashes).toEqual([null, '6 4']);
    unmount();

    const single = renderChart(false);
    expect(single.container.querySelector('figure > ul')).toBeNull();
  });

  it('pointer memilih titik terdekat', () => {
    const { container } = renderChart(false);
    const group = screen.getByRole('group', { name: 'Omzet per periode' });
    group.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) });

    fireEvent.pointerMove(group, { clientX: 190, pointerType: 'mouse' });
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toContain('3 Okt');
  });

  it('sumbu Y hanya satu dan label sumbunya memakai format sumbu', () => {
    renderChart(false);
    expect(screen.getAllByText('Rp 0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rp 2000').length).toBeGreaterThan(0);
  });
});
