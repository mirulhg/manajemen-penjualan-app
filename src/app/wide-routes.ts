// Halaman yang butuh ruang lebih di layar lebar (Kasir dua kolom, tabel Stok, Riwayat, grid bento Analisis produk). Dicocokkan persis, jadi /stok/:id tetap sempit.
// Dipakai lewat pathname, bukan handle route, karena AppLayout juga dirender di MemoryRouter pada test.
const WIDE_PATHS = ['/stok', '/kasir', '/penjualan', '/dasbor/produk'];

export function isWidePath(pathname: string): boolean {
  return WIDE_PATHS.includes(pathname);
}
