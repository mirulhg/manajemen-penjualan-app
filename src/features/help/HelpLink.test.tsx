// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { HelpLink } from './HelpLink';
import { HelpSheetHost } from './components/HelpSheetHost';

describe('HelpLink', () => {
  it('pemilik melihat tombol bantuan bernama topiknya, tersembunyi saat cetak', () => {
    renderWithProviders(<HelpLink topic="retur-batal" />);

    const link = screen.getByRole('link', { name: 'Bantuan: Retur dan batal transaksi' });
    expect(link.getAttribute('href')).toBe('/?bantuan=retur-batal');
    expect(link.className).toContain('print:hidden');
  });

  it('kasir tidak melihat tombol untuk topik khusus pemilik', () => {
    renderWithProviders(<HelpLink topic="retur-batal" />, undefined, '/', { isCashierMode: true });
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('kasir melihat tombol untuk topik yang terbuka bagi semua', () => {
    renderWithProviders(<HelpLink topic="kasir" />, undefined, '/', { isCashierMode: true });
    expect(screen.getByRole('link', { name: 'Bantuan: Mencatat penjualan di Kasir' })).toBeTruthy();
  });

  it('topik peringatan untuk kasir hanya muncul bila lonceng dan izin Mode Kasir nyala', () => {
    const hidden = renderWithProviders(<HelpLink topic="peringatan" />, undefined, '/', {
      isCashierMode: true,
      alertsBellEnabled: true,
      alertsInCashierMode: false,
    });
    expect(screen.queryByRole('link')).toBeNull();
    hidden.unmount();

    renderWithProviders(<HelpLink topic="peringatan" />, undefined, '/', {
      isCashierMode: true,
      alertsBellEnabled: true,
      alertsInCashierMode: true,
    });
    expect(screen.getByRole('link', { name: 'Bantuan: Peringatan stok menipis' })).toBeTruthy();
  });

  it('mengetuk "?" membuka modal di halaman yang sama; menutupnya mengembalikan fokus ke tombol "?"', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <HelpLink topic="kasir" />
        <HelpSheetHost />
      </>,
      undefined,
      '/stok?q=beras',
    );

    const trigger = screen.getByRole('link', { name: 'Bantuan: Mencatat penjualan di Kasir' });
    expect(trigger.getAttribute('href')).toBe('/stok?q=beras&bantuan=kasir');
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Mencatat penjualan di Kasir' })).toBeTruthy();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Bantuan: Mencatat penjualan di Kasir' })));
  });
});
