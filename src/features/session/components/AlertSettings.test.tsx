// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { getOpenAlerts } from '../../../lib/db/stock-alerts';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { AlertSettingsSection } from './AlertSettingsSection';

async function submitDefault(value: string) {
  const field = screen.getByLabelText('Batas menipis default');
  await userEvent.clear(field);
  if (value !== '') await userEvent.type(field, value);
  await userEvent.click(screen.getByRole('button', { name: 'Simpan batas' }));
  return field;
}

describe('pengaturan peringatan stok', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menyimpan batas default 10: toast, peringatan baru terbuka, dan isian bersih', async () => {
    renderWithProviders(<AlertSettingsSection />);

    await submitDefault('10');

    expect(await screen.findByText(/Batas menipis disimpan\. Status stok dan peringatan sudah diperbarui\./)).toBeTruthy();
    expect((await db.settings.get('defaultMinStock'))?.value).toBe(10);
    expect(await getOpenAlerts()).toHaveLength(15);
  });

  it.each([
    ['0', 'Isi batas berupa bilangan bulat antara 1 dan 1.000.'],
    ['1001', 'Isi batas berupa bilangan bulat antara 1 dan 1.000.'],
    ['2,5', 'Isi batas berupa bilangan bulat antara 1 dan 1.000.'],
    ['abc', 'Isi batas berupa bilangan bulat antara 1 dan 1.000.'],
    ['', 'Isi batas berupa bilangan bulat antara 1 dan 1.000.'],
  ])('nilai "%s" ditolak dengan pesan di bawah field dan tidak tersimpan', async (value, message) => {
    renderWithProviders(<AlertSettingsSection />);

    const field = await submitDefault(value);

    expect(await screen.findByText(message)).toBeTruthy();
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(await db.settings.get('defaultMinStock')).toBeUndefined();
    expect(await getOpenAlerts()).toHaveLength(12);
  });

  it('tiga pilihan menyimpan ke pengaturan; peringatan di Mode Kasir bawaannya mati', async () => {
    renderWithProviders(<AlertSettingsSection />);

    const cashierSwitch = screen.getByRole('switch', { name: 'Tampilkan peringatan di Mode Kasir' });
    const bellSwitch = screen.getByRole('switch', { name: 'Tampilkan lonceng peringatan' });
    expect(cashierSwitch.getAttribute('aria-checked')).toBe('false');
    expect(bellSwitch.getAttribute('aria-checked')).toBe('true');

    await userEvent.click(cashierSwitch);
    await userEvent.click(bellSwitch);

    await waitFor(async () => {
      expect((await db.settings.get('alertsInCashierMode'))?.value).toBe(true);
      expect((await db.settings.get('alertsBellEnabled'))?.value).toBe(false);
    });
  });

  it('menjelaskan bahwa jam tenang dan penerima butuh akun online', () => {
    renderWithProviders(<AlertSettingsSection />);

    expect(screen.getByText(/Jam tenang dan penerima: butuh akun online/)).toBeTruthy();
  });
});
