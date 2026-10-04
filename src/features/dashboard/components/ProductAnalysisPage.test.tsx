// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Outlet, Route, Routes } from 'react-router';

import { db } from '../../../lib/db/database';
import { createTestQueryClient, renderWithProviders } from '../../../test/render';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { createSaleAt } from '../../sales/api/create-sale';
import { seedSampleSales } from '../../sales/seed-sample-sales';
import { OwnerOnly } from '../../session';
import { SAMPLE_PRODUCT_SKUS } from '../../stock';
import { ProductAnalysisPage } from './ProductAnalysisPage';

const NOW = new Date(2026, 9, 3, 10, 0);

function renderPage(route: string, isCashierMode = false) {
  return renderWithProviders(
    <Routes>
      <Route
        element={
          <OwnerOnly>
            <Outlet />
          </OwnerOnly>
        }
      >
        <Route path="/dasbor/produk" element={<ProductAnalysisPage />} />
      </Route>
    </Routes>,
    createTestQueryClient(),
    route,
    { isCashierMode, hasPin: true },
  );
}

function sectionOf(heading: string) {
  const section = screen.getByRole('heading', { name: heading }).closest('section');
  if (!section) throw new Error(`Bagian ${heading} tidak ada`);
  return within(section);
}

function firstRowText(table: HTMLElement) {
  return table.querySelector('tbody tr')?.textContent ?? '';
}

describe('ProductAnalysisPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await resetDatabaseWithSeed();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Mode Kasir: pesan khusus pemilik, tanpa angka laba', async () => {
    await seedSampleSales(SAMPLE_PRODUCT_SKUS, NOW);
    renderPage('/dasbor/produk', true);

    expect(await screen.findByText('Halaman ini hanya untuk pemilik')).toBeTruthy();
    expect(screen.queryByText('Omzet & laba')).toBeNull();
  });

  it('data belum cukup: satu pesan dengan jumlah hari, tanpa bagian lain', async () => {
    const beras = await findProductBySku('SBK-001');
    await createSaleAt(
      {
        items: [{ productId: beras.id, quantity: 1, discount: 0 }],
        paymentMethod: 'transfer',
        transactionDiscount: 0,
        expectedTotal: 74_000,
      },
      new Date(2026, 9, 1, 9, 0),
    );
    renderPage('/dasbor/produk');

    expect(await screen.findByText(/saat ini baru 3 hari/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Data belum cukup' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Terlaris' })).toBeNull();
  });

  describe('dengan data penjualan contoh', () => {
    beforeEach(async () => {
      await seedSampleSales(SAMPLE_PRODUCT_SKUS, NOW);
    });

    it('urut Omzet bawaan dengan kalimat Pareto; ganti ke Laba kotor mengubah urutan dan menghapus kalimat', async () => {
      renderPage('/dasbor/produk');

      expect(await screen.findByText('15 produk menyumbang 80% omzet')).toBeTruthy();
      const revenue = sectionOf('Omzet & laba');
      expect(firstRowText(revenue.getByRole('table'))).toContain('Beras Premium 5 kg');
      expect(firstRowText(revenue.getByRole('table'))).toContain('Penyumbang 80% omzet');

      await userEvent.selectOptions(revenue.getByLabelText('Urutkan berdasarkan'), 'laba');

      await waitFor(() => {
        expect(firstRowText(sectionOf('Omzet & laba').getByRole('table'))).toContain('Kecap Manis 520 ml');
      });
      expect(screen.queryByText(/produk menyumbang 80% omzet/)).toBeNull();
    });

    it('?ambang=60 dari URL: hanya Pasta Gigi dan Roti Tawar, dan pilihan ambang ikut', async () => {
      renderPage('/dasbor/produk?ambang=60');

      const slow = await screen.findByRole('table', { name: /tanpa penjualan dalam 60 hari/ });
      expect([...slow.querySelectorAll('tbody tr')].map((row) => row.querySelector('a')?.textContent)).toEqual([
        'Pasta Gigi 190 g',
        'Roti Tawar',
      ]);
      expect(sectionOf('Lambat laku').getByLabelText<HTMLSelectElement>('Tidak terjual dalam').value).toBe('60');
      expect(within(slow).getAllByText('Belum pernah')).toHaveLength(2);
    });

    it('ganti ambang menulis ?ambang= dan memuat daftar baru', async () => {
      renderPage('/dasbor/produk');
      await screen.findByRole('table', { name: /dalam 30 hari terakhir/ });

      await userEvent.selectOptions(screen.getByLabelText('Tidak terjual dalam'), '60');

      expect(await screen.findByRole('table', { name: /dalam 60 hari terakhir/ })).toBeTruthy();
    });

    it('perkiraan stok habis: baris teratas, satuan saran restock, dan keterangan 14 hari', async () => {
      renderPage('/dasbor/produk');

      const forecast = (await screen.findByRole('table', { name: /perkiraan waktu habis/ })).querySelectorAll('tbody tr');
      expect(forecast).toHaveLength(27);
      expect(forecast[0]?.textContent).toContain('Telur Ayam 1 kg');
      expect(forecast[0]?.textContent).toContain('Sudah habis');
      expect(forecast[0]?.textContent).toContain('4 pack');
      expect(forecast[1]?.textContent).toContain('sekitar 3 hari');
      expect(screen.getByText(/Saran restock cukup untuk 14 hari ke depan/)).toBeTruthy();
    });

    it('barang arsip: berlabel Diarsipkan di peringkat, tidak muncul di perkiraan habis; nama menaut ke detail', async () => {
      const minyak = await findProductBySku('SBK-002');
      await db.products.update(minyak.id, { archivedAt: NOW.toISOString() });
      renderPage('/dasbor/produk');

      const revenue = (await screen.findByRole('table', { name: /menurut omzet/ })).querySelectorAll('tbody tr');
      const minyakRow = [...revenue].find((row) => row.textContent?.includes('Minyak Goreng 2 L'));
      expect(minyakRow?.textContent).toContain('(Diarsipkan)');
      expect(minyakRow?.querySelector('a')?.getAttribute('href')).toBe(`/stok/${minyak.id}`);

      const forecast = await screen.findByRole('table', { name: /perkiraan waktu habis/ });
      expect(forecast.textContent).not.toContain('Minyak Goreng 2 L');
    });

    it('Terlaris memakai grafik batang dengan tautan ke detail barang dan tabel alternatif', async () => {
      renderPage('/dasbor/produk');

      const link = await screen.findByRole('link', { name: 'Mi Instan Goreng' });
      expect(link.getAttribute('href')).toBe(`/stok/${(await findProductBySku('MKR-001')).id}`);
    });
  });
});
