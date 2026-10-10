// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { HELP_GROUPS } from '../help-topics';
import { HelpIndexPage } from './HelpIndexPage';
import { HelpSheetHost } from './HelpSheetHost';
import { HelpTopicPage } from './HelpTopicPage';

function renderHelp(route: string, session: Parameters<typeof renderWithProviders>[3] = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/bantuan" element={<><HelpIndexPage /><HelpSheetHost /></>} />
      <Route path="/bantuan/:slug" element={<HelpTopicPage notFound={<p>tidak ada</p>} />} />
      <Route path="/keluar-mode-kasir" element={<p>layar keluar</p>} />
    </Routes>,
    createTestQueryClient(),
    route,
    session,
  );
}

describe('indeks Bantuan', () => {
  it('pemilik melihat 5 kelompok dan 21 topik dengan ringkasan', () => {
    renderHelp('/bantuan');

    expect(screen.getByRole('heading', { level: 1, name: 'Bantuan' })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(HELP_GROUPS.length);
    expect(screen.getAllByRole('link')).toHaveLength(21);
    expect(screen.getByRole('link', { name: /Mencatat penjualan di Kasir/ }).getAttribute('href')).toBe('/bantuan?bantuan=kasir');
  });

  it('daftar topik satu kelompok dua kolom mulai lg', () => {
    const { container } = renderHelp('/bantuan');
    const lists = container.querySelectorAll('section ul');
    expect(lists.length).toBe(HELP_GROUPS.length);
    lists.forEach((list) => expect(list.className).toContain('lg:grid-cols-2'));
  });

  it('kasir hanya melihat topik untuk semua, tanpa kelompok yang kosong', () => {
    renderHelp('/bantuan', { isCashierMode: true });

    const titles = screen.getAllByRole('link').map((link) => within(link).getByText(/./, { selector: 'span.font-medium' }).textContent);
    expect(titles).toEqual(['Mencatat penjualan di Kasir', 'Melihat daftar stok', 'Mode Kasir & PIN', 'Apa yang baru & Segera hadir', 'Kamus istilah', 'Tanya jawab']);
    expect(screen.queryByRole('heading', { name: 'Memulai' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Melihat hasil' })).toBeNull();
  });

  it('kasir melihat Peringatan stok bila lonceng dan izin Mode Kasir sama-sama nyala', () => {
    renderHelp('/bantuan', { isCashierMode: true, alertsBellEnabled: true, alertsInCashierMode: true });
    expect(screen.getByRole('link', { name: /Peringatan stok menipis/ })).toBeTruthy();
  });
});

describe('halaman topik', () => {
  it('menampilkan bagian, langkah bernomor, contoh, dan teks tebal tanpa tanda **', () => {
    const { container } = renderHelp('/bantuan/kasir');

    expect(screen.getByRole('heading', { level: 1, name: 'Mencatat penjualan di Kasir' })).toBeTruthy();
    ['Untuk apa', 'Langkah', 'Contoh', 'Perlu diketahui'].forEach((name) =>
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy(),
    );
    expect(container.querySelectorAll('ol > li')).toHaveLength(7);
    expect(screen.getByText(/Rp186\.000/)).toBeTruthy();
    expect(screen.getByText('Keranjang tidak disimpan.').tagName).toBe('STRONG');
    expect(container.textContent).not.toContain('**');
    expect(screen.getByRole('link', { name: 'Buka Kasir' }).getAttribute('href')).toBe('/kasir');
  });

  it('pemilik melihat butir ringkasan stok, kasir melihat butir Mode Kasir', () => {
    const owner = renderHelp('/bantuan/stok');
    expect(screen.getByText(/ringkasan "Jenis barang"/)).toBeTruthy();
    expect(screen.queryByText(/Di Mode Kasir, harga beli/)).toBeNull();
    owner.unmount();

    renderHelp('/bantuan/stok', { isCashierMode: true });
    expect(screen.queryByText(/ringkasan "Jenis barang"/)).toBeNull();
    expect(screen.getByText(/Di Mode Kasir, harga beli/)).toBeTruthy();
  });

  it('Kamus istilah untuk kasir tidak memuat istilah laba', () => {
    renderHelp('/bantuan/istilah', { isCashierMode: true });
    const table = screen.getByRole('table');
    expect(within(table).getByText('SKU')).toBeTruthy();
    expect(within(table).queryByText(/HPP/)).toBeNull();
    expect(within(table).queryByText('Laba kotor')).toBeNull();
  });

  it('topik pemilik yang dibuka di Mode Kasir menampilkan layar khusus pemilik', () => {
    renderHelp('/bantuan/laporan', { isCashierMode: true });
    expect(screen.getByRole('heading', { name: 'Halaman ini hanya untuk pemilik' })).toBeTruthy();
  });

  it('tombol tujuan Mode Kasir & PIN mengikuti mode', () => {
    const owner = renderHelp('/bantuan/mode-kasir');
    expect(screen.getByRole('link', { name: 'Buka Pengaturan' }).getAttribute('href')).toBe('/pengaturan');
    owner.unmount();

    renderHelp('/bantuan/mode-kasir', { isCashierMode: true });
    expect(screen.getByRole('link', { name: 'Keluar Mode Kasir' }).getAttribute('href')).toBe('/keluar-mode-kasir');
  });

  it('slug yang tidak dikenal menampilkan elemen 404 dari app', () => {
    renderHelp('/bantuan/abc');
    expect(screen.getByText('tidak ada')).toBeTruthy();
  });

  it('topik tanpa tujuan tidak punya tombol tujuan', () => {
    renderHelp('/bantuan/istilah');
    expect(screen.queryByRole('link', { name: /^Buka / })).toBeNull();
  });

  it('bagian "Perlu diketahui" tampil dalam kotak lembut, bagian lain tidak', () => {
    renderHelp('/bantuan/kasir');

    const notes = screen.getByRole('heading', { level: 2, name: 'Perlu diketahui' }).closest('section');
    const steps = screen.getByRole('heading', { level: 2, name: 'Langkah' }).closest('section');
    expect(notes?.className).toContain('bg-secondary');
    expect(steps?.className).not.toContain('bg-secondary');
  });

  it('mengetuk baris topik membuka modal di halaman Bantuan tanpa pindah halaman', async () => {
    const user = userEvent.setup();
    renderHelp('/bantuan');

    await user.click(screen.getByRole('link', { name: /Profil toko/ }));

    const dialog = await screen.findByRole('dialog', { name: 'Profil toko' });
    expect(within(dialog).getByRole('link', { name: 'Buka Pengaturan' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Bantuan', hidden: true })).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Tutup' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
