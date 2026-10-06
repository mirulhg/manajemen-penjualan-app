// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test/render';
import { ReportActions } from './ReportActions';

describe('ReportActions', () => {
  it('menu Unduh berisi CSV dan Excel, dan keduanya memanggil ekspor yang sama dengan format masing-masing', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    renderWithProviders(<ReportActions onExport={onExport} pendingFormat={null} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Unduh' }));
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeTruthy();
    await user.click(screen.getByRole('menuitem', { name: 'CSV' }));
    expect(onExport).toHaveBeenLastCalledWith('csv');

    await user.click(screen.getByRole('button', { name: 'Unduh' }));
    await user.click(screen.getByRole('menuitem', { name: 'Excel (.xlsx)' }));
    expect(onExport).toHaveBeenLastCalledWith('xlsx');
    expect(onExport).toHaveBeenCalledTimes(2);
  });

  it('saat file disiapkan: tombol menampilkan "Menyiapkan…" dan nonaktif', () => {
    renderWithProviders(<ReportActions onExport={vi.fn()} pendingFormat="xlsx" error={null} />);

    const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Menyiapkan…' });
    expect(button.disabled).toBe(true);
  });

  it('tombol Cetak memanggil window.print', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderWithProviders(<ReportActions onExport={vi.fn()} pendingFormat={null} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Cetak / Simpan PDF' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });
});
