import { Link } from 'react-router';

export function DashboardEmpty() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Belum ada penjualan</h2>
      <p className="mt-2 text-text-muted">Dasbor terisi setelah ada transaksi pertama. Catat penjualan di Kasir.</p>
      <Link to="/kasir" className="mt-4 inline-flex min-h-11 items-center font-medium text-primary">
        Buka Kasir
      </Link>
    </div>
  );
}
