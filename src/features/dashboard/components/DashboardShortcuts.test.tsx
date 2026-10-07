// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../../test/render';
import { DashboardShortcuts } from './DashboardShortcuts';

function renderShortcuts(session: Parameters<typeof renderWithProviders>[3] = {}) {
  return renderWithProviders(
    <DashboardShortcuts historyQuery="periode=7-hari" transactionCount={28} />,
    undefined,
    '/dasbor',
    session,
  );
}

describe('DashboardShortcuts', () => {
  it('empat baris: jumlah transaksi periode dan peringatan stok baru ikut tampil', async () => {
    renderShortcuts();

    const transactions = screen.getByRole('link', { name: /Lihat transaksi/ });
    expect(transactions.textContent).toContain('28 transaksi');
    expect(transactions.getAttribute('href')).toBe('/penjualan?periode=7-hari');
    expect(screen.getByRole('link', { name: 'Analisis produk' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Laporan' })).toBeTruthy();
    expect((await screen.findByRole('link', { name: /Peringatan stok/ })).textContent).toMatch(/\d+ baru/);
  });

  it('lonceng dimatikan: baris Peringatan stok tidak tampil', () => {
    renderShortcuts({ alertsBellEnabled: false });

    expect(screen.queryByRole('link', { name: /Peringatan stok/ })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('Mode Kasir tanpa izin peringatan: baris Peringatan stok tersembunyi', () => {
    renderShortcuts({ isCashierMode: true, alertsInCashierMode: false });

    expect(screen.queryByRole('link', { name: /Peringatan stok/ })).toBeNull();
  });
});
