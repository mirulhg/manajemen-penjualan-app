import { Link } from 'react-router';

const REPORTS = [
  { to: '/laporan/penjualan', name: 'Penjualan', description: 'Transaksi, omzet, diskon, retur, dan metode bayar per periode.' },
  { to: '/laporan/laba-kotor', name: 'Laba kotor', description: 'Omzet, HPP, dan laba per kategori dan per produk.' },
  { to: '/laporan/stok', name: 'Stok', description: 'Posisi stok dan nilai persediaan pada tanggal tertentu.' },
  { to: '/laporan/pergerakan-stok', name: 'Pergerakan stok', description: 'Stok awal, masuk, terjual, retur, koreksi, dan stok akhir per barang.' },
];

export function ReportsPage() {
  return (
    <section>
      <title>Laporan · Manajemen Stok</title>
      <h1 className="mb-4 text-xl font-semibold">Laporan</h1>
      <ul className="space-y-3">
        {REPORTS.map((report) => (
          <li key={report.to} className="rounded-md border border-border bg-surface">
            <Link to={report.to} className="block min-h-11 p-4">
              <span className="block font-medium text-primary">{report.name}</span>
              <span className="block text-sm text-text-muted">{report.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
