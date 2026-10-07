import { Bell, ChartColumn, ChevronRight, FileText, ReceiptText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { useUnreadAlertCount } from '../../alerts';
import { useSession } from '../../session';
import { formatNumber } from '../../../utils/format-number';

type DashboardShortcutsProps = {
  // Query periode terpilih, supaya Riwayat terbuka dengan periode yang sama dengan dasbor.
  historyQuery: string;
  transactionCount: number;
};

type Shortcut = { to: string; label: string; icon: LucideIcon; detail?: string };

export function DashboardShortcuts({ historyQuery, transactionCount }: DashboardShortcutsProps) {
  const { isCashierMode, alertsBellEnabled, alertsInCashierMode } = useSession();
  const { data: unreadCount = 0 } = useUnreadAlertCount();
  // Sama dengan aturan lonceng di AppLayout.
  const isAlertShortcutVisible = alertsBellEnabled && (!isCashierMode || alertsInCashierMode);

  const shortcuts: Shortcut[] = [
    {
      to: historyQuery ? `/penjualan?${historyQuery}` : '/penjualan',
      label: 'Lihat transaksi',
      icon: ReceiptText,
      detail: `${formatNumber(transactionCount)} transaksi`,
    },
    { to: '/dasbor/produk', label: 'Analisis produk', icon: ChartColumn },
    { to: '/laporan', label: 'Laporan', icon: FileText },
    ...(isAlertShortcutVisible
      ? [{ to: '/peringatan', label: 'Peringatan stok', icon: Bell, detail: `${formatNumber(unreadCount)} baru` }]
      : []),
  ];

  return (
    <ul className="flex h-full flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
      {shortcuts.map((shortcut) => (
        <li key={shortcut.to} className="flex flex-1">
          <Link to={shortcut.to} className="tap-row flex min-h-12 flex-1 items-center gap-3 px-4 py-2 font-medium">
            <shortcut.icon aria-hidden="true" className="size-5 text-muted-foreground" />
            <span className="flex-1">{shortcut.label}</span>
            {shortcut.detail && <span className="text-sm font-normal text-muted-foreground">{shortcut.detail}</span>}
            <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
