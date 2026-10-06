// @vitest-environment jsdom
import { QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { db } from '../../../lib/db/database';
import { createTestQueryClient } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { SessionProvider } from '../../session';
import { DailySummaryCard } from './DailySummaryCard';

const TODAY = new Date(2026, 9, 4, 8, 0);
const TOMORROW = new Date(2026, 9, 5, 8, 0);

// SessionProvider sungguhan (membaca settings dari database), karena yang diuji justru penyimpanan "ditutup hari ini".
function renderCard() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>
        <SessionProvider>
          <DailySummaryCard />
        </SessionProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DailySummaryCard', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('menampilkan jumlah habis dan menipis, omzet kemarin, dan tautan ke daftar perlu restock', async () => {
    renderCard();

    expect(await screen.findByText('4 barang habis · 8 menipis')).toBeTruthy();
    expect(screen.getByText(/Kemarin: omzet Rp 0 dari 0 transaksi/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat daftar restock' }).getAttribute('href')).toBe('/peringatan');
  });

  it('hilang setelah "Tutup untuk hari ini", tetap hilang setelah dimuat ulang, dan muncul lagi esok hari', async () => {
    renderCard();
    await userEvent.click(await screen.findByRole('button', { name: 'Tutup untuk hari ini' }));

    await waitFor(() => {
      expect(screen.queryByText('4 barang habis · 8 menipis')).toBeNull();
    });
    expect((await db.settings.get('dailySummaryDismissedOn'))?.value).toBe('2026-10-04');

    // Muat ulang (QueryClient baru, hari yang sama): tetap tertutup.
    cleanup();
    renderCard();
    await waitFor(() => {
      expect(screen.queryByText('4 barang habis · 8 menipis')).toBeNull();
    });

    // Esok harinya kartu muncul lagi.
    cleanup();
    vi.setSystemTime(TOMORROW);
    renderCard();
    expect(await screen.findByText('4 barang habis · 8 menipis')).toBeTruthy();
  });

  it('dimatikan di pengaturan: kartu tidak tampil', async () => {
    await db.settings.put({ key: 'dailySummaryEnabled', value: false });
    renderCard();

    await waitFor(() => {
      expect(screen.queryByText('4 barang habis · 8 menipis')).toBeNull();
    });
    expect(screen.queryByText('4 barang habis · 8 menipis')).toBeNull();
  });
});
