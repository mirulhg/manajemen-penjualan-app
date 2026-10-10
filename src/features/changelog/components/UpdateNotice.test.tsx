// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { CURRENT_RELEASE } from '../current-release';
import { UpdateNotice } from './UpdateNotice';

function renderNotice(isCashierMode = false) {
  return renderWithProviders(<UpdateNotice isCashierMode={isCashierMode} />, createTestQueryClient(), '/dasbor', { isCashierMode });
}

const TOAST_TITLE = `Diperbarui ke versi ${CURRENT_RELEASE.version}`;

async function settle() {
  // Beri kesempatan pembacaan IndexedDB dan toast selesai sebelum memeriksa bahwa tidak ada toast.
  await new Promise((resolve) => setTimeout(resolve, 150));
}

describe('UpdateNotice', () => {
  beforeEach(async () => {
    await resetDatabaseWithSeed();
    toast.dismiss();
  });

  it('pemasangan baru (database kosong): tanpa toast, kedua kunci diisi versi sekarang', async () => {
    await db.products.clear();
    renderNotice();

    await waitFor(async () => expect((await db.settings.get('notifiedVersion'))?.value).toBe(CURRENT_RELEASE.version));
    expect((await db.settings.get('changelogSeenVersion'))?.value).toBe(CURRENT_RELEASE.version);
    await settle();
    expect(screen.queryByText(TOAST_TITLE)).toBeNull();
  });

  it('pembaruan dengan data yang sudah ada: toast sekali dengan tombol "Lihat yang baru"', async () => {
    renderNotice();

    expect(await screen.findByText(TOAST_TITLE)).toBeTruthy();
    expect(screen.getByText(CURRENT_RELEASE.title)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Lihat yang baru' })).toBeTruthy();
    expect((await db.settings.get('notifiedVersion'))?.value).toBe(CURRENT_RELEASE.version);
  });

  it('muat ulang (kunci sudah tercatat): tidak ada toast lagi', async () => {
    await db.settings.put({ key: 'notifiedVersion', value: CURRENT_RELEASE.version });
    renderNotice();

    await settle();
    expect(screen.queryByText(TOAST_TITLE)).toBeNull();
  });

  it('gagal membaca catatan versi: diam-diam, aplikasi tetap terbuka', async () => {
    const readSpy = vi.spyOn(db.settings, 'get').mockRejectedValue(new Error('IndexedDB rusak'));
    try {
      renderNotice();
      await settle();
      expect(screen.queryByText(TOAST_TITLE)).toBeNull();
    } finally {
      readSpy.mockRestore();
    }
  });
});
