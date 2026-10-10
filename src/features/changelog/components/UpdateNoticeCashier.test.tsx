// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { UpdateNotice } from './UpdateNotice';

vi.mock('../current-release', () => ({
  CURRENT_RELEASE: { version: '9.9.9', title: 'Hanya untuk pemilik', isVisibleToCashier: false },
}));

describe('UpdateNotice di Mode Kasir', () => {
  beforeEach(async () => {
    await resetDatabaseWithSeed();
    toast.dismiss();
  });

  it('entri versi tanpa poin untuk kasir: tanpa toast, tetapi kunci tetap diperbarui', async () => {
    renderWithProviders(<UpdateNotice isCashierMode />, createTestQueryClient(), '/kasir', { isCashierMode: true });

    await waitFor(async () => expect((await db.settings.get('notifiedVersion'))?.value).toBe('9.9.9'));
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(screen.queryByText('Diperbarui ke versi 9.9.9')).toBeNull();
  });
});
