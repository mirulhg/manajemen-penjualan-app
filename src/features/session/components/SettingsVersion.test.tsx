// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import packageJson from '../../../../package.json' with { type: 'json' };
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menampilkan versi aplikasi dari package.json', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText(`Versi ${packageJson.version}`)).toBeTruthy();
  });

  it('menampilkan "developed by dev.myrules" dengan nama pengembang berfont tanda tangan', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText('developed by', { exact: false }).textContent).toBe('developed by dev.myrules');
    expect(screen.getByText('dev.myrules').className).toContain('font-signature');
  });

  it('punya baris "Bantuan & panduan" ke halaman Bantuan', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByRole('link', { name: 'Bantuan & panduan' }).getAttribute('href')).toBe('/bantuan');
  });
});
