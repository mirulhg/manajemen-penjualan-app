// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { setViewportWidth } from '../../../test/viewport';
import { useHelpSheet } from '../use-help-sheet';
import { HelpSheetHost } from './HelpSheetHost';

let pageMounts = 0;

function CountedPage() {
  useState(() => {
    pageMounts += 1;
    return pageMounts;
  });
  return <p>isi halaman</p>;
}

function Harness() {
  const { open } = useHelpSheet();
  const location = useLocation();
  return (
    <>
      <CountedPage />
      <button type="button" onClick={() => open('kasir')}>
        buka panduan
      </button>
      <p data-testid="lokasi">{location.pathname + location.search}</p>
      <HelpSheetHost />
    </>
  );
}

function renderHost(route: string, session: Parameters<typeof renderWithProviders>[3] = {}) {
  pageMounts = 0;
  return renderWithProviders(
    <Routes>
      <Route path="*" element={<Harness />} />
    </Routes>,
    createTestQueryClient(),
    route,
    session,
  );
}

function lastPath() {
  return screen.getByTestId('lokasi').textContent;
}

afterEach(() => setViewportWidth(1280));

describe('HelpSheetHost', () => {
  it('?bantuan=kasir di /kasir membuka modal berjudul topiknya tanpa tombol "Buka Kasir"', async () => {
    renderHost('/kasir?bantuan=kasir');

    const dialog = await screen.findByRole('dialog', { name: 'Mencatat penjualan di Kasir' });
    expect(within(dialog).queryByRole('link', { name: 'Buka Kasir' })).toBeNull();
    expect(within(dialog).getByRole('link', { name: 'Semua topik' }).getAttribute('href')).toBe('/bantuan');
  });

  it('?bantuan=profil-toko di /bantuan menampilkan "Buka Pengaturan" dan tidak menampilkan "Semua topik"', async () => {
    renderHost('/bantuan?bantuan=profil-toko');

    const dialog = await screen.findByRole('dialog', { name: 'Profil toko' });
    expect(within(dialog).getByRole('link', { name: 'Buka Pengaturan' }).getAttribute('href')).toBe('/pengaturan');
    expect(within(dialog).queryByRole('link', { name: 'Semua topik' })).toBeNull();
  });

  it('kepala modal: kata "Bantuan", judul bagian h3, tombol Tutup, dan kotak Perlu diketahui', async () => {
    renderHost('/stok?bantuan=kasir');

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Bantuan')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Tutup' })).toBeTruthy();
    expect(within(dialog).getByRole('heading', { level: 3, name: 'Langkah' })).toBeTruthy();
    expect(within(dialog).queryByRole('heading', { level: 2, name: 'Langkah' })).toBeNull();
    expect(within(dialog).getByRole('heading', { name: 'Perlu diketahui' }).closest('section')?.className).toContain('bg-secondary');
  });

  it('dibuka dari dalam aplikasi: tombol Tutup dan Esc mengembalikan alamat ke semula, parameter lain tetap', async () => {
    const user = userEvent.setup();
    renderHost('/penjualan?periode=7-hari');

    await user.click(screen.getByRole('button', { name: 'buka panduan' }));
    await screen.findByRole('dialog');
    expect(lastPath()).toBe('/penjualan?periode=7-hari&bantuan=kasir');

    await user.click(screen.getByRole('button', { name: 'Tutup' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(lastPath()).toBe('/penjualan?periode=7-hari');

    await user.click(screen.getByRole('button', { name: 'buka panduan' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(lastPath()).toBe('/penjualan?periode=7-hari');
  });

  it('dibuka lewat alamat langsung: menutup menghapus parameter bantuan saja', async () => {
    const user = userEvent.setup();
    renderHost('/penjualan?periode=7-hari&bantuan=kasir');

    await user.click(await screen.findByRole('button', { name: 'Tutup' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(lastPath()).toBe('/penjualan?periode=7-hari');
  });

  it('halaman di belakang modal tidak dipasang ulang saat modal dibuka dan ditutup', async () => {
    const user = userEvent.setup();
    renderHost('/stok');

    await user.click(screen.getByRole('button', { name: 'buka panduan' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Tutup' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    expect(pageMounts).toBe(1);
  });

  it('slug yang tidak dikenal: parameter dihapus dan tidak ada yang tampil', async () => {
    renderHost('/stok?q=beras&bantuan=abc');

    await waitFor(() => expect(lastPath()).toBe('/stok?q=beras'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('topik pemilik di Mode Kasir: parameter dihapus dan tidak ada yang tampil', async () => {
    renderHost('/kasir?bantuan=laporan', { isCashierMode: true });

    await waitFor(() => expect(lastPath()).toBe('/kasir'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('topik Peringatan di Mode Kasir tanpa izin: parameter dihapus', async () => {
    renderHost('/kasir?bantuan=peringatan', { isCashierMode: true, alertsBellEnabled: true, alertsInCashierMode: false });

    await waitFor(() => expect(lastPath()).toBe('/kasir'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Mode Kasir & PIN: kasir melihat tombol "Keluar Mode Kasir"', async () => {
    renderHost('/stok?bantuan=mode-kasir', { isCashierMode: true });

    const dialog = await screen.findByRole('dialog', { name: 'Mode Kasir & PIN' });
    expect(within(dialog).getByRole('link', { name: 'Keluar Mode Kasir' }).getAttribute('href')).toBe('/keluar-mode-kasir');
  });

  it('di layar sempit tampil sebagai panel bawah (Drawer) dengan judul yang sama', async () => {
    setViewportWidth(390);
    renderHost('/stok?bantuan=kasir');

    const dialog = await screen.findByRole('dialog', { name: 'Mencatat penjualan di Kasir' });
    expect(dialog.getAttribute('data-vaul-drawer-direction')).toBe('bottom');
  });
});
