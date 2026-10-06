import { ChartColumn, ChevronRight, FileText, ReceiptText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

type DashboardShortcutsProps = {
  // Query periode terpilih, supaya Riwayat terbuka dengan periode yang sama dengan dasbor.
  historyQuery: string;
};

type Shortcut = { to: string; label: string; icon: LucideIcon };

export function DashboardShortcuts({ historyQuery }: DashboardShortcutsProps) {
  const shortcuts: Shortcut[] = [
    { to: historyQuery ? `/penjualan?${historyQuery}` : '/penjualan', label: 'Lihat transaksi', icon: ReceiptText },
    { to: '/dasbor/produk', label: 'Analisis produk', icon: ChartColumn },
    { to: '/laporan', label: 'Laporan', icon: FileText },
  ];

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
      {shortcuts.map((shortcut) => (
        <li key={shortcut.to}>
          <Link to={shortcut.to} className="tap-row flex min-h-12 items-center gap-3 px-4 py-2 font-medium">
            <shortcut.icon aria-hidden="true" className="size-5 text-muted-foreground" />
            <span className="flex-1">{shortcut.label}</span>
            <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
