// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../../lib/db/database';
import { renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { AdjustStockForm } from './AdjustStockForm';

function getDescription(input: HTMLElement): string {
  const describedBy = input.getAttribute('aria-describedby');
  if (!describedBy) throw new Error('Field tidak punya aria-describedby');
  return describedBy
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');
}

describe('AdjustStockForm', () => {
  beforeEach(resetDatabaseWithSeed);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sukses: pesan tersimpan, field kosong, tombol "Tersimpan"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdjustStockForm product={await findProductBySku('SBK-001')} />);

    await user.type(screen.getByLabelText('Jumlah diterima'), '7');
    await user.type(screen.getByLabelText('Alasan'), 'Kiriman supplier');
    await user.click(screen.getByRole('button', { name: 'Simpan penyesuaian' }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('Tersimpan. Stok Beras Premium 5 kg sekarang 25 sak.');
    expect(screen.getByLabelText<HTMLInputElement>('Jumlah diterima').value).toBe('');
    expect(screen.getByLabelText<HTMLInputElement>('Alasan').value).toBe('');
    expect(screen.getByRole('button', { name: 'Tersimpan' })).toBeTruthy();
    expect(await db.stockMovements.count()).toBe(31);
  });

  it('koreksi tanpa perubahan: pesan di bawah field jumlah, terhubung lewat aria-describedby', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdjustStockForm product={await findProductBySku('MND-003')} />);

    await user.click(screen.getByRole('radio', { name: /Koreksi/ }));
    await user.type(screen.getByLabelText('Jumlah hasil hitung'), '0');
    await user.type(screen.getByLabelText('Alasan'), 'Hasil stock opname');
    await user.click(screen.getByRole('button', { name: 'Simpan penyesuaian' }));

    await waitFor(() => {
      expect(getDescription(screen.getByLabelText('Jumlah hasil hitung'))).toContain(
        'Hasil hitung sama dengan stok sekarang (0). Tidak ada yang perlu dikoreksi.',
      );
    });
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('error tak terduga: alert muncul dan isian tidak hilang', async () => {
    const user = userEvent.setup();
    vi.spyOn(db.stockMovements, 'add').mockRejectedValueOnce(new Error('penyimpanan penuh'));
    renderWithProviders(<AdjustStockForm product={await findProductBySku('SBK-001')} />);

    await user.type(screen.getByLabelText('Jumlah diterima'), '7');
    await user.type(screen.getByLabelText('Alasan'), 'Kiriman supplier');
    await user.click(screen.getByRole('button', { name: 'Simpan penyesuaian' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Penyimpanan di perangkat ini gagal');
    expect(screen.getByLabelText<HTMLInputElement>('Jumlah diterima').value).toBe('7');
    expect(screen.getByLabelText<HTMLInputElement>('Alasan').value).toBe('Kiriman supplier');
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('validasi: alasan "ab" menampilkan pesan di bawah field alasan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdjustStockForm product={await findProductBySku('SBK-001')} />);

    await user.type(screen.getByLabelText('Jumlah diterima'), '7');
    await user.type(screen.getByLabelText('Alasan'), 'ab');
    await user.click(screen.getByRole('button', { name: 'Simpan penyesuaian' }));

    await waitFor(() => {
      expect(getDescription(screen.getByLabelText('Alasan'))).toContain(
        'Tulis alasan minimal 3 karakter.',
      );
    });
    expect(await db.stockMovements.count()).toBe(30);
  });
});
