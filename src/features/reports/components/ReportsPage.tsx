import { ArrowLeftRight, ChevronRight, Package, Receipt, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

type ReportLink = { to: string; name: string; description: string; icon: LucideIcon };

const REPORTS: ReportLink[] = [
  { to: '/laporan/penjualan', name: 'Penjualan', description: 'Transaksi, omzet, diskon, retur, dan metode bayar per periode.', icon: Receipt },
  { to: '/laporan/laba-kotor', name: 'Laba kotor', description: 'Omzet, HPP, dan laba per kategori dan per produk.', icon: TrendingUp },
  { to: '/laporan/stok', name: 'Stok', description: 'Posisi stok dan nilai persediaan pada tanggal tertentu.', icon: Package },
  { to: '/laporan/pergerakan-stok', name: 'Pergerakan stok', description: 'Stok awal, masuk, terjual, retur, koreksi, dan stok akhir per barang.', icon: ArrowLeftRight },
];

export function ReportsPage() {
  return (
    <section>
      <title>Laporan · Manajemen Stok</title>
      <h1 className="mb-4 text-xl font-semibold">Laporan</h1>
      <ul className="space-y-3">
        {REPORTS.map((report) => (
          <li key={report.to} className="rounded-md border border-border bg-card">
            <Link to={report.to} className="tap-row flex min-h-11 items-center gap-4 rounded-md p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                <report.icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{report.name}</span>
                <span className="block text-sm text-muted-foreground">{report.description}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
