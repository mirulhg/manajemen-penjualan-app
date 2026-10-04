// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';

import { AppLayout } from '../../../app/AppLayout';
import { db } from '../../../lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { AlertsPage } from './AlertsPage';

type SessionOverrides = { isCashierMode?: boolean; alertsInCashierMode?: boolean; alertsBellEnabled?: boolean };

function renderApp(route: string, session: SessionOverrides = {}) {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dasbor" element={<p>halaman dasbor</p>} />
        <Route path="/peringatan" element={<AlertsPage />} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    route,
    { hasPin: true, ...session },
  );
}

const bellLink = (count: number) => screen.queryByRole('link', { name: `Peringatan stok, ${count} belum dibaca` });

describe('lonceng dan halaman peringatan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('lonceng menunjukkan 12; membuka halaman memuat 4 Habis dan 8 Menipis lalu lonceng menjadi 0', async () => {
    renderApp('/dasbor');

    const bell = await screen.findByRole('link', { name: 'Peringatan stok, 12 belum dibaca' });
    await userEvent.click(bell);

    expect(await screen.findByRole('link', { name: 'Telur Ayam 1 kg' })).toBeTruthy();
    expect(screen.getAllByText('Habis', { selector: 'span' })).toHaveLength(4);
    expect(screen.getAllByText('Menipis', { selector: 'span' })).toHaveLength(8);

    await waitFor(() => {
      expect(bellLink(0)).toBeTruthy();
    });
    expect(await db.stockAlerts.filter((alert) => alert.readAt === null).count()).toBe(0);
  });

  it('Habis di atas Menipis dan setiap nama menaut ke detail barang', async () => {
    renderApp('/peringatan');

    const first = await screen.findByRole('link', { name: 'Teh Siap Minum 350 ml' });
    expect(first.getAttribute('href')).toMatch(/^\/stok\/[0-9a-f-]{36}$/);
    const badges = screen.getAllByText(/^(Habis|Menipis)$/, { selector: 'span' }).map((badge) => badge.textContent);
    expect(badges.slice(0, 4)).toEqual(['Habis', 'Habis', 'Habis', 'Habis']);
  });

  it('keadaan kosong: tidak ada barang menipis atau habis', async () => {
    await db.stockAlerts.clear();
    renderApp('/peringatan');

    expect(await screen.findByText('Tidak ada barang yang menipis atau habis.')).toBeTruthy();
  });

  it('pemilik melihat Daftar perlu restock dengan saran jumlah dan tombol bagikan', async () => {
    renderApp('/peringatan');

    const table = await screen.findByRole('table', { name: /perlu dibeli/ });
    const rows = [...table.querySelectorAll('tbody tr')].map((row) => row.textContent);
    expect(rows.find((text) => text?.includes('Minyak Goreng 2 L'))).toContain('8 pouch');
    expect(rows.find((text) => text?.includes('Telur Ayam 1 kg'))).toContain('6 pack');
    expect(rows.find((text) => text?.includes('Teh Siap Minum 350 ml'))).toContain('13 botol');
    expect(rows.find((text) => text?.includes('Roti Tawar'))).toContain('4 bungkus');
    expect(rows.find((text) => text?.includes('Penyedap Rasa 100 g'))).toContain('5 bungkus');
    expect(screen.getByRole('button', { name: 'Bagikan daftar' })).toBeTruthy();
  });
});

describe('Mode Kasir', () => {
  beforeEach(resetDatabaseWithSeed);

  it('bawaan: tanpa lonceng, dan /peringatan diblokir', async () => {
    renderApp('/peringatan', { isCashierMode: true });

    expect(await screen.findByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Peringatan stok/ })).toBeNull();
  });

  it('bila diaktifkan: lonceng tampil dan halaman terbuka TANPA Daftar perlu restock dan tombol bagikan', async () => {
    renderApp('/peringatan', { isCashierMode: true, alertsInCashierMode: true });

    expect(await screen.findByRole('link', { name: 'Telur Ayam 1 kg' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Peringatan stok, \d+ belum dibaca/ })).toBeTruthy();
    expect(screen.queryByText('Daftar perlu restock')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bagikan daftar' })).toBeNull();
  });

  it('lonceng dimatikan di pengaturan: tidak tampil untuk pemilik', async () => {
    renderApp('/dasbor', { alertsBellEnabled: false });

    await screen.findByText('halaman dasbor');
    expect(screen.queryByRole('link', { name: /Peringatan stok/ })).toBeNull();
  });
});

describe('Bagikan daftar', () => {
  beforeEach(resetDatabaseWithSeed);

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'share');
    Reflect.deleteProperty(navigator, 'clipboard');
    vi.restoreAllMocks();
  });

  it('memakai navigator.share bila ada, dengan teks tanpa harga beli', async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    renderApp('/peringatan');

    fireEvent.click(await screen.findByRole('button', { name: 'Bagikan daftar' }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const text = share.mock.calls[0]?.[0].text ?? '';
    expect(text).toContain('- Minyak Goreng 2 L: 8 pouch');
    expect(text).toContain('- Telur Ayam 1 kg: 6 pack');
    expect(text.split('\n')).toHaveLength(13);
    expect(text).not.toMatch(/Rp|34\.?000|27\.?000/);
    expect(await screen.findByText('Daftar dibagikan.')).toBeTruthy();
  });

  it('tanpa navigator.share: daftar disalin dan muncul tautan WhatsApp', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderApp('/peringatan');

    fireEvent.click(await screen.findByRole('button', { name: 'Bagikan daftar' }));

    expect((await screen.findByRole('status')).textContent).toContain('Daftar disalin');
    const link = screen.getByRole('link', { name: 'Buka WhatsApp' });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('- Roti Tawar: 4 bungkus');
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('- Roti Tawar: 4 bungkus'));
  });

  it('salin gagal: pesan jelas dan tautan WhatsApp tetap tersedia', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('ditolak')) },
      configurable: true,
    });
    renderApp('/peringatan');

    fireEvent.click(await screen.findByRole('button', { name: 'Bagikan daftar' }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/tidak bisa disalin otomatis/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Buka WhatsApp' })).toBeTruthy();
  });

  it('membatalkan menu bagikan (AbortError) bukan kesalahan dan tidak jatuh ke salin', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('dibatalkan', 'AbortError'));
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderApp('/peringatan');

    fireEvent.click(await screen.findByRole('button', { name: 'Bagikan daftar' }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
