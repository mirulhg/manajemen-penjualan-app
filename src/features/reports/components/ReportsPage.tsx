import { ArrowLeftRight, ChevronRight, Package, Receipt, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { BentoGrid } from '../../../components/ui/BentoGrid';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { cn } from '@/lib/utils';

// Bento md+: Penjualan 2×2 di kiri; Laba kotor melebar dua kolom, Stok dan Pergerakan stok satu kolom di baris bawahnya.
type ReportLink = { to: string; name: string; description: string; icon: LucideIcon; cell?: string };

const REPORTS: ReportLink[] = [
  { to: '/laporan/penjualan', name: 'Penjualan', description: 'Transaksi, omzet, diskon, retur, dan metode bayar per periode.', icon: Receipt, cell: 'md:col-span-2 md:row-span-2' },
  { to: '/laporan/laba-kotor', name: 'Laba kotor', description: 'Omzet, HPP, dan laba per kategori dan per produk.', icon: TrendingUp, cell: 'md:col-span-2' },
  { to: '/laporan/stok', name: 'Stok', description: 'Posisi stok dan nilai persediaan pada tanggal tertentu.', icon: Package },
  { to: '/laporan/pergerakan-stok', name: 'Pergerakan stok', description: 'Stok awal, masuk, terjual, retur, koreksi, dan stok akhir per barang.', icon: ArrowLeftRight },
];

export function ReportsPage() {
  return (
    <SubpageLayout title="Laporan" heading="Laporan" backTo="/dasbor" backLabel="Kembali ke dasbor">
      <BentoGrid className="gap-3 md:grid-cols-4">
        {REPORTS.map((report) => (
          <Link
            key={report.to}
            to={report.to}
            className={cn(
              'press flex min-h-11 items-center gap-4 rounded-md border border-border bg-card p-4 transition-shadow duration-(--duration-fast) ease-out hover:shadow-md md:items-start',
              report.cell,
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
              <report.icon aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{report.name}</span>
              <span className="block text-sm text-muted-foreground">{report.description}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </BentoGrid>
    </SubpageLayout>
  );
}
