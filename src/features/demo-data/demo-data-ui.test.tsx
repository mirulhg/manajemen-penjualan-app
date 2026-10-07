// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardEmpty } from '../dashboard/components/DashboardEmpty';
import { SettingsPage } from '../session/components/SettingsPage';
import { db } from '../../lib/db/database';
import { renderWithProviders } from '../../test/render';
import { resetDatabaseWithSeed } from '../../test/reset-database';
import { DemoBanner } from './components/DemoBanner';
import { DEMO_TABLES } from './demo-tables';

const SLOW_TEST_TIMEOUT_MS = 30_000;

function renderSettingsWithBanner(session: Parameters<typeof renderWithProviders>[3] = {}) {
  return renderWithProviders(
    <>
      <DemoBanner />
      <SettingsPage />
    </>,
    undefined,
    '/pengaturan',
    session,
  );
}

async function emptyDatabase() {
  await Promise.all(DEMO_TABLES.map((table) => table.clear()));
}

describe('UI data contoh', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('database kosong', () => {
    beforeEach(emptyDatabase);

    it('Pengaturan: tombol aktif; setelah dimuat muncul banner dengan PIN 1234, dan tombol nonaktif', async () => {
      const user = userEvent.setup();
      renderSettingsWithBanner();

      const button = await screen.findByRole('button', { name: 'Muat data contoh' });
      await waitFor(() => expect(button).toHaveProperty('disabled', false));
      await user.click(button);

      expect(await screen.findByText('Data contoh', { selector: 'p' }, { timeout: 20_000 })).toBeTruthy();
      expect((await screen.findByText('1234')).textContent).toBe('1234');
      await waitFor(() => expect(screen.getByRole('button', { name: 'Muat data contoh' })).toHaveProperty('disabled', true));
      expect(await db.products.count()).toBe(20);
    }, SLOW_TEST_TIMEOUT_MS);

    it('Hapus data contoh meminta konfirmasi, lalu mengembalikan database kosong dan menghapus banner', async () => {
      const user = userEvent.setup();
      renderSettingsWithBanner();
      await user.click(await screen.findByRole('button', { name: 'Muat data contoh' }));
      await screen.findByText('1234', undefined, { timeout: 20_000 });

      await user.click(screen.getByText('Hapus data contoh', { selector: 'summary' }));
      expect(screen.getByText(/tidak bisa dibatalkan/)).toBeTruthy();
      expect(await db.products.count()).toBe(20);
      await user.click(screen.getByRole('button', { name: 'Ya, hapus semua' }));

      await waitFor(async () => expect(await db.products.count()).toBe(0));
      await waitFor(() => expect(screen.queryByText('1234')).toBeNull());
      expect(await db.settings.get('isDemo')).toBeUndefined();
    }, SLOW_TEST_TIMEOUT_MS);

    it('empty state Dasbor menyediakan tombol Muat data contoh', async () => {
      renderWithProviders(<DashboardEmpty />);

      const button = await screen.findByRole('button', { name: 'Muat data contoh' });
      await waitFor(() => expect(button).toHaveProperty('disabled', false));
    });

    it('VITE_DEMO=true: banner info muncul; tanpa flag tidak ada banner', async () => {
      vi.stubEnv('VITE_DEMO', 'true');
      const withFlag = renderWithProviders(<DemoBanner />);
      expect(await screen.findByText('Mode demo')).toBeTruthy();
      withFlag.unmount();

      vi.stubEnv('VITE_DEMO', 'false');
      renderWithProviders(<DemoBanner />);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.queryByText('Mode demo')).toBeNull();
    });
  });

  describe('database berisi data asli', () => {
    beforeEach(resetDatabaseWithSeed);

    it('tombol nonaktif dengan penjelasan, dan tidak ada banner data contoh', async () => {
      renderSettingsWithBanner();

      const button = await screen.findByRole('button', { name: 'Muat data contoh' });
      await waitFor(() => expect(button).toHaveProperty('disabled', true));
      expect(screen.getByText('Hanya bisa dimuat saat belum ada barang dan transaksi.')).toBeTruthy();
      expect(screen.queryByText('Data contoh', { selector: 'p' })).toBeNull();
      expect(await db.products.count()).toBe(30);
    });
  });

  it('Mode Kasir tidak melihat banner data contoh', async () => {
    await resetDatabaseWithSeed();
    await db.settings.put({ key: 'isDemo', value: true });
    renderWithProviders(<DemoBanner />, undefined, '/stok', { isCashierMode: true, hasPin: true });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText('Data contoh', { selector: 'p' })).toBeNull();
  });
});
