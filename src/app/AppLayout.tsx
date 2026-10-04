import { Outlet } from 'react-router';

import { AlertBell } from '../components/layout/AlertBell';
import { MainNav } from '../components/layout/MainNav';
import type { NavItem } from '../components/layout/nav-items';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/layout/TabBar';
import { useUnreadAlertCount } from '../features/alerts';
import { useSession } from '../features/session';

const OWNER_ITEMS: NavItem[] = [
  { to: '/dasbor', label: 'Dasbor' },
  { to: '/stok', label: 'Stok' },
  { to: '/kasir', label: 'Kasir' },
  { to: '/penjualan', label: 'Riwayat' },
  { to: '/pengaturan', label: 'Pengaturan' },
];

const CASHIER_ITEMS: NavItem[] = [
  { to: '/kasir', label: 'Kasir' },
  { to: '/stok', label: 'Stok' },
  { to: '/keluar-mode-kasir', label: 'Keluar' },
];

export function AppLayout() {
  const { isCashierMode, alertsBellEnabled, alertsInCashierMode } = useSession();
  const { data: unreadCount = 0 } = useUnreadAlertCount();
  const items = isCashierMode ? CASHIER_ITEMS : OWNER_ITEMS;
  // Kasir hanya melihat lonceng bila pemilik mengaktifkannya (isinya informasi belanja pemilik).
  const isBellVisible = alertsBellEnabled && (!isCashierMode || alertsInCashierMode);

  return (
    <PageShell
      nav={<MainNav items={items} />}
      bell={isBellVisible ? <AlertBell count={unreadCount} href="/peringatan" /> : undefined}
      tabBar={<TabBar items={items} />}
      statusLabel={isCashierMode ? 'Mode Kasir' : undefined}
    >
      <Outlet />
    </PageShell>
  );
}
