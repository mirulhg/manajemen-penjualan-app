// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { ChangelogPage } from './ChangelogPage';

function renderPage(route = '/pembaruan', isCashierMode = false) {
  return renderWithProviders(<ChangelogPage />, createTestQueryClient(), route, { isCashierMode, hasPin: true });
}

function entryHeadings() {
  return screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '');
}

describe('halaman Pembaruan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menampilkan judul, versi yang dipakai, dan tab "Apa yang baru" secara bawaan', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Pembaruan' })).toBeTruthy();
    expect(screen.getByText(__APP_VERSION__, { selector: 'strong' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Apa yang baru' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Segera hadir' }).getAttribute('aria-selected')).toBe('false');
  });

  it('pemilik melihat 15 kartu, tanpa teks penanda (pemilik) atau tanda ** yang terlihat', () => {
    renderPage();

    expect(entryHeadings()).toHaveLength(15);
    expect(entryHeadings()[0]).toBe('v0.12.0 — Apa yang baru & Segera hadir');
    const text = screen.getByRole('tabpanel').textContent ?? '';
    expect(text).not.toContain('(pemilik)');
    expect(text).not.toContain('**');
  });

  it('memberi badge "Versi Anda" pada tepat satu entri, yaitu versi yang sedang dipakai', () => {
    renderPage();

    expect(screen.getAllByText('Versi Anda')).toHaveLength(1);
  });

  it('?tab=segera-hadir membuka rencana per kelompok: Berikutnya 2, Direncanakan 1, Dipertimbangkan 4', () => {
    renderPage('/pembaruan?tab=segera-hadir');

    expect(screen.getByRole('tab', { name: 'Segera hadir' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/Rencana dapat berubah/)).toBeTruthy();
    const count = (name: string) => within(screen.getByRole('region', { name })).getAllByRole('listitem').length;
    expect(count('Berikutnya')).toBe(2);
    expect(count('Direncanakan')).toBe(1);
    expect(count('Dipertimbangkan')).toBe(4);
  });

  it('Mode Kasir: 11 kartu tanpa entri khusus pemilik, dan rencana khusus pemilik hilang', () => {
    renderPage('/pembaruan', true);

    expect(entryHeadings()).toHaveLength(11);
    expect(entryHeadings().join(' ')).not.toContain('v0.11.2');
    expect(screen.queryByText(/Fase 4|Laporan$/)).toBeNull();
  });

  it('Mode Kasir: rencana khusus pemilik tidak tampil', () => {
    renderPage('/pembaruan?tab=segera-hadir', true);

    expect(screen.queryByText('Cadangkan & pulihkan data')).toBeNull();
    expect(screen.queryByText('Varian produk')).toBeNull();
    expect(screen.queryByText('Laporan terjadwal ke email')).toBeNull();
    expect(screen.getByText('Scan barcode')).toBeTruthy();
  });

  it('membuka halaman mencatat versi ini sebagai sudah dilihat', async () => {
    renderPage();

    await waitFor(async () => expect((await db.settings.get('changelogSeenVersion'))?.value).toBe(__APP_VERSION__));
  });

  it('ada tombol bantuan ke topik pembaruan', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Bantuan: Apa yang baru & Segera hadir' })).toBeTruthy();
  });
});
