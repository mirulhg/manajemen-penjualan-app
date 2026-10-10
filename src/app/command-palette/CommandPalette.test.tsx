// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { archiveProduct } from '../../features/stock/api/archive-product';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { createTestQueryClient, renderWithProviders } from '../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { HelpSheetHost } from '../../features/help';
import { CommandPaletteTrigger } from './CommandPaletteTrigger';

function CurrentLocation() {
  const location = useLocation();
  return <p data-testid="lokasi">{location.pathname + location.search}</p>;
}

function renderPalette(session: { isCashierMode: boolean } = { isCashierMode: false }, extra?: React.ReactNode) {
  return renderWithProviders(
    <>
      <button type="button">pemicu fokus</button>
      <CommandPaletteTrigger />
      <CurrentLocation />
      {extra}
    </>,
    createTestQueryClient(),
    '/dasbor',
    { ...session, hasPin: true },
  );
}

async function openWithKeyboard(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard('{Control>}k{/Control}');
  return screen.findByRole('dialog');
}

function lastPath() {
  return screen.getByTestId('lokasi').textContent;
}

describe('palette perintah', () => {
  beforeEach(resetDatabaseWithSeed);

  it('Ctrl+K membuka palette, Esc menutup, dan fokus kembali ke elemen sebelumnya', async () => {
    const user = userEvent.setup();
    renderPalette();
    const trigger = screen.getByRole('button', { name: 'pemicu fokus' });
    trigger.focus();

    const dialog = await openWithKeyboard(user);
    expect(within(dialog).getByRole('combobox')).toBeTruthy();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('dibuka dengan keyboard tanpa kelas animasi; dibuka dengan klik memakai animasi masuk', async () => {
    const user = userEvent.setup();
    renderPalette();

    const keyboardDialog = await openWithKeyboard(user);
    expect(keyboardDialog.className).not.toContain('animate-in');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'Cari atau buka halaman' }));
    expect((await screen.findByRole('dialog')).className).toContain('animate-in');
  });

  it('tanpa teks: grup Halaman dan Aksi; Barang baru muncul setelah mengetik', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);

    expect(within(dialog).getByText('Halaman')).toBeTruthy();
    expect(within(dialog).getByText('Aksi')).toBeTruthy();
    expect(within(dialog).queryByText('Barang')).toBeNull();
  });

  it('ketik "beras" lalu Enter membuka detail Beras Premium 5 kg', async () => {
    const user = userEvent.setup();
    const beras = await findProductBySku('SBK-001');
    renderPalette();

    await openWithKeyboard(user);
    await user.keyboard('beras');
    expect(await screen.findByText('Beras Premium 5 kg')).toBeTruthy();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(lastPath()).toBe(`/stok/${beras.id}`));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Halaman disaring: "lap" menampilkan Laporan dan keempat sub-laporannya', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.keyboard('lap');

    const labels = within(dialog).getAllByRole('option').map((option) => option.textContent);
    expect(labels.slice(0, 5)).toEqual(['Laporan', 'Laporan Penjualan', 'Laporan Laba kotor', 'Laporan Stok', 'Laporan Pergerakan stok']);
  });

  it('Mode Kasir: tanpa Laporan, Pengaturan, dan grup Aksi', async () => {
    const user = userEvent.setup();
    renderPalette({ isCashierMode: true });

    const dialog = await openWithKeyboard(user);

    const labels = within(dialog).getAllByRole('option').map((option) => option.textContent);
    expect(labels).toEqual(['Kasir', 'Stok', 'Apa yang baru', 'Bantuan', 'Keluar Mode Kasir']);
    expect(within(dialog).queryByText('Aksi')).toBeNull();
  });

  it('mengetik "pembaruan": halaman "Apa yang baru" dan topik panduannya muncul, dan memilih halamannya membuka /pembaruan', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.type(within(dialog).getByRole('combobox'), 'pembaruan');
    await user.click(await within(dialog).findByRole('option', { name: 'Apa yang baru' }));

    expect(lastPath()).toBe('/pembaruan');
  });

  it('"Barang masuk…" berpindah ke daftar barang; memilih barang membuka halaman sesuaikan; Backspace kembali', async () => {
    const user = userEvent.setup();
    const beras = await findProductBySku('SBK-001');
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.click(within(dialog).getByRole('option', { name: 'Barang masuk…' }));
    expect(await within(dialog).findByText('Pilih barang yang masuk')).toBeTruthy();

    await user.keyboard('{Backspace}');
    expect(await within(dialog).findByText('Halaman')).toBeTruthy();

    await user.click(within(dialog).getByRole('option', { name: 'Barang masuk…' }));
    await user.keyboard('beras');
    await user.click(await within(dialog).findByRole('option', { name: /Beras Premium 5 kg/ }));

    await waitFor(() => expect(lastPath()).toBe(`/stok/${beras.id}/sesuaikan`));
  });

  it('barang diarsipkan hanya muncul bila diketik minimal 2 huruf', async () => {
    const user = userEvent.setup();
    const beras = await findProductBySku('SBK-001');
    await archiveProduct(beras.id);
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.keyboard('b');
    await within(dialog).findByText('Barang');
    expect(within(dialog).queryByText('Diarsipkan')).toBeNull();

    await user.keyboard('eras');
    expect(await within(dialog).findByText('Diarsipkan')).toBeTruthy();
  });

  it('lebih dari 8 hasil: baris "Lihat semua di Stok" membuka daftar Stok dengan kata cari', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.keyboard('a');
    await user.click(await within(dialog).findByRole('option', { name: 'Lihat semua di Stok' }));

    await waitFor(() => expect(lastPath()).toBe('/stok?q=a'));
  });

  it('kata yang tidak ada: pesan kosong menyebut kata yang diketik', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.keyboard('zzz');

    expect(await within(dialog).findByText("Tidak ada hasil untuk 'zzz'")).toBeTruthy();
  });

  it('palette tidak terbuka saat Drawer sedang terbuka', async () => {
    const user = userEvent.setup();
    renderPalette(
      { isCashierMode: false },
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Bayar</DrawerTitle>
          <DrawerDescription>Contoh drawer</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByText('Contoh drawer');

    await user.keyboard('{Control>}k{/Control}');

    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('item "Bantuan" ada di grup Halaman untuk pemilik dan membuka indeks Bantuan', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);
    await user.keyboard('bantuan');
    await user.click(within(dialog).getByRole('option', { name: 'Bantuan' }));

    await waitFor(() => expect(lastPath()).toBe('/bantuan'));
  });

  it('grup Bantuan hanya muncul setelah mengetik, dan "retur" membuka topiknya sebagai modal di halaman ini', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = await openWithKeyboard(user);
    expect(within(dialog).queryByText('Bantuan', { selector: '[cmdk-group-heading]' })).toBeNull();

    await user.keyboard('retur');
    const option = await within(dialog).findByRole('option', { name: 'Retur dan batal transaksi' });
    expect(within(dialog).getByText('Bantuan', { selector: '[cmdk-group-heading]' })).toBeTruthy();
    await user.click(option);

    await waitFor(() => expect(lastPath()).toBe('/dasbor?bantuan=retur-batal'));
  });

  it('topik khusus pemilik tidak muncul di Mode Kasir, topik untuk semua tetap muncul', async () => {
    const user = userEvent.setup();
    renderPalette({ isCashierMode: true });

    const dialog = await openWithKeyboard(user);
    await user.keyboard('retur');
    expect(within(dialog).queryByRole('option', { name: 'Retur dan batal transaksi' })).toBeNull();

    await user.clear(within(dialog).getByRole('combobox'));
    await user.keyboard('pin');
    expect(await within(dialog).findByRole('option', { name: 'Mode Kasir & PIN' })).toBeTruthy();
  });

  it('memilih topik Bantuan menutup palette dan membuka modal topik di halaman yang sedang dibuka', async () => {
    const user = userEvent.setup();
    renderPalette({ isCashierMode: false }, <HelpSheetHost />);

    const dialog = await openWithKeyboard(user);
    await user.keyboard('retur');
    await user.click(await within(dialog).findByRole('option', { name: 'Retur dan batal transaksi' }));

    expect(await screen.findByRole('dialog', { name: 'Retur dan batal transaksi' })).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(lastPath()).toBe('/dasbor?bantuan=retur-batal');
  });
});
