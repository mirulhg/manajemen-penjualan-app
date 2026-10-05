import { Link } from 'react-router';

const COMING_SOON = ['Stok', 'Pergerakan stok'];

export function ReportsPage() {
  return (
    <section>
      <title>Laporan · Manajemen Stok</title>
      <h1 className="mb-4 text-xl font-semibold">Laporan</h1>
      <ul className="space-y-3">
        <li className="rounded-md border border-border bg-surface">
          <Link to="/laporan/penjualan" className="block min-h-11 p-4">
            <span className="block font-medium text-primary">Penjualan</span>
            <span className="block text-sm text-text-muted">
              Transaksi, omzet, diskon, retur, dan metode bayar per periode.
            </span>
          </Link>
        </li>
        <li className="rounded-md border border-border bg-surface">
          <Link to="/laporan/laba-kotor" className="block min-h-11 p-4">
            <span className="block font-medium text-primary">Laba kotor</span>
            <span className="block text-sm text-text-muted">Omzet, HPP, dan laba per kategori dan per produk.</span>
          </Link>
        </li>
        {COMING_SOON.map((name) => (
          <li key={name} className="rounded-md border border-border bg-surface p-4">
            <span className="block font-medium">{name}</span>
            <span className="block text-sm text-text-muted">Segera hadir</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
