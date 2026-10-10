// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/database';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { SettingsPage } from './SettingsPage';

describe('baris "Apa yang baru" di Pengaturan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menaut ke /pembaruan, tepat di atas "Bantuan & panduan"', () => {
    renderWithProviders(<SettingsPage />);

    const link = screen.getByRole('link', { name: /Apa yang baru/ });
    expect(link.getAttribute('href')).toBe('/pembaruan');
    const help = screen.getByRole('link', { name: 'Bantuan & panduan' });
    expect(link.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('badge "Baru" tampil selama versi ini belum dilihat, dan hilang setelahnya', async () => {
    const { unmount } = renderWithProviders(<SettingsPage />);
    expect(await screen.findByText('Baru')).toBeTruthy();
    unmount();

    await db.settings.put({ key: 'changelogSeenVersion', value: __APP_VERSION__ });
    renderWithProviders(<SettingsPage />);
    await waitFor(() => expect(screen.getByRole('link', { name: /Apa yang baru/ })).toBeTruthy());
    expect(screen.queryByText('Baru')).toBeNull();
  });
});
