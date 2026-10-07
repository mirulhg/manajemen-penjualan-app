import { ArrowLeftRight, ChevronRight, Package, Receipt, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { BentoGrid } from '../../../components/ui/BentoGrid';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { cn } from '@/lib/utils';

// Bento 2 kolom (md): Penjualan dan Pergerakan stok selebar baris. Bento 4 kolom (lg): Penjualan 2×2 di kiri; Laba kotor melebar di kanan atas,
// Stok dan Pergerakan stok satu kolom di bawahnya. Tanpa lubang di kedua lebar.
type ReportLink = { to: string; name: string; description: string; icon: LucideIcon; cell?: string; isLarge?: boolean };

const REPORTS: ReportLink[] = [
  { to: '/laporan/penjualan', name: 'Penjualan', description: 'Transaksi, omzet, diskon, retur, dan metode bayar per periode.', icon: Receipt, cell: 'md:col-span-2 lg:row-span-2', isLarge: true },
  { to: '/laporan/laba-kotor', name: 'Laba kotor', description: 'Omzet, HPP, dan laba per kategori dan per produk.', icon: TrendingUp, cell: 'lg:col-span-2' },
  { to: '/laporan/stok', name: 'Stok', description: 'Posisi stok dan nilai persediaan pada tanggal tertentu.', icon: Package },
  { to: '/laporan/pergerakan-stok', name: 'Pergerakan stok', description: 'Stok awal, masuk, terjual, retur, koreksi, dan stok akhir per barang.', icon: ArrowLeftRight, cell: 'md:col-span-2 lg:col-span-1' },
];

export function ReportsPage() {
  return (
    <SubpageLayout title="Laporan" heading="Laporan" backTo="/dasbor" backLabel="Kembali ke dasbor">
      <BentoGrid className="gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {REPORTS.map((report) => (
          <Link
            key={report.to}
            to={report.to}
            className={cn(
              'press flex min-h-11 items-center gap-4 rounded-md border border-border bg-card p-4 transition-shadow duration-(--duration-fast) ease-out hover:shadow-md md:items-start',
              report.isLarge && 'lg:flex-col lg:justify-between lg:p-6',
              report.cell,
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary',
                report.isLarge && 'lg:size-14',
              )}
            >
              <report.icon aria-hidden="true" className={cn('size-5', report.isLarge && 'lg:size-7')} />
            </span>
            <span className="min-w-0 flex-1 lg:w-full">
              <span className={cn('block font-medium', report.isLarge && 'lg:text-xl')}>{report.name}</span>
              <span className="block text-sm text-muted-foreground">{report.description}</span>
            </span>
            <ChevronRight aria-hidden="true" className={cn('size-5 shrink-0 text-muted-foreground', report.isLarge && 'lg:hidden')} />
          </Link>
        ))}
      </BentoGrid>
    </SubpageLayout>
  );
}
