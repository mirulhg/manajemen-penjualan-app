// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Outlet, Route, Routes } from 'react-router';

import { HomeRedirect } from '../../../app/HomeRedirect';
import { createSaleAt } from '../../sales/api/create-sale';
import { seedSampleSales } from '../../sales/seed-sample-sales';
import { SAMPLE_PRODUCT_SKUS } from '../../stock';
import { OwnerOnly } from '../../session';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { setReducedMotion } from '../../../test/viewport';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { DashboardPage } from './DashboardPage';

const NOW = new Date(2026, 9, 3, 10, 0, 0);

function renderRoutes(route: string, isCashierMode: boolean) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/kasir" element={<p>halaman kasir</p>} />
      <Route
        element={
          <OwnerOnly>
            <Outlet />
          </OwnerOnly>
        }
      >
        <Route path="/dasbor" element={<DashboardPage />} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    route,
    { isCashierMode, hasPin: true },
  );
}

describe('DashboardPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('belum ada penjualan sama sekali: ajakan ke Kasir, bukan deretan angka nol', async () => {
    renderRoutes('/dasbor', false);

    expect(await screen.findByText('Belum ada penjualan')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Buka Kasir' }).getAttribute('href')).toBe('/kasir');
  });

  it('periode Hari ini: transaksi tampil di kartu, pembanding kemarin kosong ditulis sebagai teks', async () => {
    const beras = await findProductBySku('SBK-001');
    const mi = await findProductBySku('MKR-001');
    const air = await findProductBySku('MNM-001');
    await createSaleAt(
      {
        items: [
          { productId: beras.id, quantity: 2, discount: 0 },
          { productId: mi.id, quantity: 3, discount: 0 },
          { productId: air.id, quantity: 1, discount: 0 },
        ],
        paymentMethod: 'tunai',
        transactionDiscount: 0,
        amountPaid: 162_000,
        expectedTotal: 162_000,
      },
      NOW,
    );
    renderRoutes('/dasbor?periode=hari-ini', false);

    // Satu transaksi: omzet dan rata-rata sama-sama 162.000.
    expect((await screen.findAllByText('Rp 162.000')).length).toBe(2);
    // Omzet, rata-rata, dan laba kotor sebelumnya Rp 0; Transaksi sebelumnya 0 (bukan Rupiah).
    expect(screen.getAllByText(/baru ada di periode ini · sebelumnya Rp 0/).length).toBe(3);
    expect(screen.getByText('baru ada di periode ini · sebelumnya 0')).toBeTruthy();
    expect(screen.getAllByText('Rp 15.100').length).toBe(1);
    expect(screen.getByRole('link', { name: 'Lihat transaksi' }).getAttribute('href')).toBe('/penjualan');
  });

  it('bento Dasbor lg: grid 4 kolom, Tren 3 + Jam sibuk 1, Kategori 2 + Pintasan 2', async () => {
    const beras = await findProductBySku('SBK-001');
    await createSaleAt(
      {
        items: [{ productId: beras.id, quantity: 1, discount: 0 }],
        paymentMethod: 'tunai',
        transactionDiscount: 0,
        amountPaid: 74_000,
        expectedTotal: 74_000,
      },
      NOW,
    );
    const { container } = renderRoutes('/dasbor?periode=hari-ini', false);

    const trendHeading = await screen.findByRole('heading', { name: /Tren/ });
    const grid = container.querySelector('[data-stagger-children]');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-4');
    expect(screen.getByRole('heading', { name: 'Ringkasan periode', hidden: true }).closest('div')?.className).toContain('lg:col-span-4');
    expect(trendHeading.closest('div[class*="col-span"]')?.className).toContain('lg:col-span-3');
    expect(screen.getByRole('heading', { name: 'Omzet per kategori' }).closest('div[class*="col-span"]')?.className).toContain('lg:col-span-2');

  });

  it('link Lihat transaksi membawa periode yang dipilih', async () => {
    const beras = await findProductBySku('SBK-001');
    await createSaleAt(
      {
        items: [{ productId: beras.id, quantity: 1, discount: 0 }],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      NOW,
    );
    renderRoutes('/dasbor?periode=7-hari', false);

    await screen.findByText('Ringkasan periode');
    expect(screen.getByRole('link', { name: 'Lihat transaksi' }).getAttribute('href')).toBe('/penjualan?periode=7-hari');
  });

  it('Mode Kasir di /dasbor: pesan khusus pemilik', async () => {
    renderRoutes('/dasbor', true);

    expect(await screen.findByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    expect(screen.queryByText('Belum ada penjualan')).toBeNull();
  });

  it('"/" mengarah ke dasbor untuk pemilik dan ke kasir di Mode Kasir', async () => {
    const owner = renderRoutes('/', false);
    expect(await screen.findByText('Belum ada penjualan')).toBeTruthy();
    owner.unmount();

    renderRoutes('/', true);
    expect(await screen.findByText('halaman kasir')).toBeTruthy();
  });
});

describe('DashboardPage grafik', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('30 hari: perbandingan, tren, kategori dengan total = omzet, dan jam sibuk', async () => {
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, NOW);
    renderRoutes('/dasbor?periode=30-hari', false);

    // Grafik dimuat lazy setelah kartu angka.
    // Legenda teks (li); nama seri yang sama juga ada di judul kolom tabel yang tersembunyi.
    const legend = await screen.findAllByText('Periode sebelumnya');
    expect(legend.some((element) => element.tagName === 'LI')).toBe(true);
    expect(screen.getByText('turun 2,9% · sebelumnya Rp 5.689.500')).toBeTruthy();
    expect(await screen.findByText('Total Rp 5.524.500')).toBeTruthy();
    expect(await screen.findByRole('group', { name: /Jumlah transaksi per jam/ })).toBeTruthy();
    expect(screen.getByLabelText<HTMLSelectElement>('Skala waktu').value).toBe('harian');
  });

  it('12 bulan: skala otomatis bulanan dan tautan Riwayat memakai rentang tanggal yang sama', async () => {
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, NOW);
    renderRoutes('/dasbor?periode=12-bulan', false);

    expect((await screen.findByLabelText<HTMLSelectElement>('Skala waktu')).value).toBe('bulanan');
    expect(screen.getByRole('link', { name: 'Lihat transaksi' }).getAttribute('href')).toBe(
      '/penjualan?periode=rentang&dari=2025-11-01&sampai=2026-10-03',
    );
  });

  it('?skala= di URL menimpa skala otomatis, nilai tidak valid diabaikan', async () => {
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, NOW);
    const first = renderRoutes('/dasbor?periode=30-hari&skala=mingguan', false);
    expect((await screen.findByLabelText<HTMLSelectElement>('Skala waktu')).value).toBe('mingguan');
    first.unmount();

    renderRoutes('/dasbor?periode=30-hari&skala=ngawur', false);
    expect((await screen.findByLabelText<HTMLSelectElement>('Skala waktu')).value).toBe('harian');
  });

  it('periode tanpa penjualan: tiap grafik menampilkan keadaan kosong, bukan grafik datar', async () => {
    // Penjualan ada, tetapi hanya kemarin; periode "Hari ini" kosong.
    const beras = await findProductBySku('SBK-001');
    await createSaleAt(
      {
        items: [{ productId: beras.id, quantity: 1, discount: 0 }],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      new Date(2026, 9, 2, 9, 0),
    );
    renderRoutes('/dasbor?periode=hari-ini', false);

    await waitFor(() => {
      expect(screen.getAllByText('Belum ada penjualan di periode ini.')).toHaveLength(3);
    });
    // Pagi hari bukan "turun 100%": keempat kartu menulis keterangan, bukan persentase.
    expect(screen.getAllByText('Belum ada penjualan hari ini')).toHaveLength(4);
    expect(screen.queryByText(/turun 100,0%/)).toBeNull();
  });
});

describe('DashboardPage tata letak', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await resetDatabaseWithSeed();
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('bawaan 7 hari: KPI memuat nilai sebelumnya, dan bagian "Hari ini dibanding kemarin" tidak ada', async () => {
    renderRoutes('/dasbor', false);

    expect(await screen.findByText('Rp 920.500')).toBeTruthy();
    expect(screen.getByRole('button', { name: '7 hari' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('turun 40,3% · sebelumnya Rp 1.542.500')).toBeTruthy();
    expect(screen.getByText('turun 26,3% · sebelumnya 38')).toBeTruthy();
    expect(screen.queryByText('Hari ini dibanding kemarin')).toBeNull();
  });

  it('"Lainnya" membuka Bulan ini, 12 bulan, dan Rentang; memilih salah satunya mengubah periode', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderRoutes('/dasbor', false);

    await user.click(await screen.findByRole('button', { name: 'Lainnya' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitemradio', { name: 'Bulan ini' })).toBeTruthy();
    expect(within(menu).getByRole('menuitemradio', { name: '12 bulan terakhir' })).toBeTruthy();
    expect(within(menu).getByRole('menuitemradio', { name: 'Rentang tanggal' })).toBeTruthy();

    await user.click(within(menu).getByRole('menuitemradio', { name: 'Bulan ini' }));

    expect(await screen.findByRole('button', { name: 'Bulan ini' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '7 hari' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('angka KPI berhitung naik hanya saat dasbor dibuka; ganti periode menampilkan angka langsung', async () => {
    setReducedMotion(false);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderRoutes('/dasbor', false);

    const countingValues = () => document.querySelectorAll('dd span[aria-hidden="true"]');
    await waitFor(() => expect(countingValues().length).toBeGreaterThan(0));
    await waitFor(() => expect(countingValues()).toHaveLength(0), { timeout: 2_000 });
    expect(await screen.findByText('Rp 920.500')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '30 hari' }));

    expect(await screen.findByText('Rp 5.524.500')).toBeTruthy();
    expect(countingValues()).toHaveLength(0);
    setReducedMotion(true);
  });
});
