import { describe, expect, it } from 'vitest';

import { getPageWidth } from './wide-routes';

describe('getPageWidth', () => {
  it('bento hanya untuk Dasbor, Indeks Laporan, dan Analisis produk', () => {
    expect(['/dasbor', '/laporan', '/dasbor/produk'].map(getPageWidth)).toEqual(['bento', 'bento', 'bento']);
    expect(getPageWidth('/laporan/penjualan')).toBe('default');
  });

  it('Kasir, Stok, dan Riwayat tetap wide; detail barang dan halaman lain default', () => {
    expect(['/kasir', '/stok', '/penjualan'].map(getPageWidth)).toEqual(['wide', 'wide', 'wide']);
    expect(['/stok/abc', '/pengaturan', '/peringatan'].map(getPageWidth)).toEqual(['default', 'default', 'default']);
  });
});
