// @vitest-environment jsdom
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { enterCashierMode } from '../api/cashier-mode';
import { setupPin } from '../api/setup-pin';
import { useSession } from '../session-context';
import { ExitCashierModePage } from './ExitCashierModePage';
import { OwnerOnly } from './OwnerOnly';
import { SessionProvider } from './SessionProvider';
import { SettingsPage } from './SettingsPage';

const CASHIER = { isCashierMode: true, hasPin: true };

function ModeLabel() {
  return <p>{useSession().isCashierMode ? 'sedang Mode Kasir' : 'sedang pemilik'}</p>;
}

describe('Mode Kasir', () => {
  beforeEach(resetDatabaseWithSeed);

  it('OwnerOnly: kasir melihat pesan khusus pemilik, pemilik melihat isi halaman', () => {
    const { unmount } = renderWithProviders(<OwnerOnly><p>isi rahasia</p></OwnerOnly>, undefined, '/', CASHIER);
    expect(screen.getByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Keluar Mode Kasir' })).toBeTruthy();
    expect(screen.queryByText('isi rahasia')).toBeNull();
    unmount();

    renderWithProviders(<OwnerOnly><p>isi rahasia</p></OwnerOnly>);
    expect(screen.getByText('isi rahasia')).toBeTruthy();
  });

  it('mode bertahan setelah QueryClient baru (simulasi muat ulang)', async () => {
    await setupPin('1357');
    await enterCashierMode();

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <SessionProvider>
          <ModeLabel />
        </SessionProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('sedang Mode Kasir')).toBeTruthy();
  });

  it('Pengaturan: izin jual melebihi stok tersimpan, dan PIN baru menampilkan kode pemulihan sekali', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    await user.click(await screen.findByLabelText('Izinkan jual melebihi stok'));
    await screen.findByText('Stok bisa menjadi minus. Peringatan tetap muncul di kasir.');
    expect((await db.settings.get('allowOversell'))?.value).toBe(true);

    await user.type(screen.getByLabelText('PIN baru'), '1357');
    await user.type(screen.getByLabelText('Isi ulang PIN'), '1357');
    await user.click(screen.getByRole('button', { name: 'Buat PIN' }));

    expect(await screen.findByText(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeTruthy();
    expect(screen.getByText(/Kode hanya ditampilkan sekali/)).toBeTruthy();
    expect(await db.settings.get('ownerPin')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Sudah saya catat' }));
    expect(screen.queryByText(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeNull();
  });

  it('Pengaturan: PIN yang tidak sama ditolak dan tidak ada yang tersimpan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    await user.type(await screen.findByLabelText('PIN baru'), '1357');
    await user.type(screen.getByLabelText('Isi ulang PIN'), '1358');
    await user.click(screen.getByRole('button', { name: 'Buat PIN' }));

    expect(await screen.findByText('Isi ulang PIN harus sama dengan PIN baru.')).toBeTruthy();
    expect(await db.settings.get('ownerPin')).toBeUndefined();
  });

  it('keluar Mode Kasir: PIN salah menampilkan sisa percobaan, setelah 5 kali terkunci', async () => {
    await setupPin('1357');
    await enterCashierMode();
    const user = userEvent.setup();
    renderWithProviders(<ExitCashierModePage />, undefined, '/', CASHIER);

    await user.type(screen.getByLabelText('PIN pemilik'), '0000');
    await user.click(screen.getByRole('button', { name: 'Keluar Mode Kasir' }));
    expect(await screen.findByText('PIN salah. Sisa percobaan 4.')).toBeTruthy();

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await user.click(screen.getByRole('button', { name: 'Keluar Mode Kasir' }));
      await screen.findByText(/PIN salah\. Sisa percobaan|Terlalu banyak percobaan/);
    }
    expect(await screen.findByText(/Terlalu banyak percobaan\. Coba lagi setelah pukul \d{2}:\d{2}\./)).toBeTruthy();
  });
});
