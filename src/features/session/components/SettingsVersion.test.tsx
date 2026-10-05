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
});
