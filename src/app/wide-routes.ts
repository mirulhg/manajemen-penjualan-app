export type PageWidth = 'default' | 'wide' | 'bento';

// Halaman yang butuh ruang lebih di layar lebar. Dicocokkan persis, jadi /stok/:id tetap sempit.
// Dipakai lewat pathname, bukan handle route, karena AppLayout juga dirender di MemoryRouter pada test.
// wide: Kasir dua kolom, tabel Stok, Riwayat. bento: grid kartu Dasbor, Indeks Laporan, Analisis produk.
const WIDE_PATHS = ['/stok', '/kasir', '/penjualan'];
const BENTO_PATHS = ['/dasbor', '/laporan', '/dasbor/produk'];

export function getPageWidth(pathname: string): PageWidth {
  if (BENTO_PATHS.includes(pathname)) return 'bento';
  return WIDE_PATHS.includes(pathname) ? 'wide' : 'default';
}
