import { Outlet } from 'react-router';

import { MainNav } from '../components/layout/MainNav';
import type { NavItem } from '../components/layout/nav-items';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/layout/TabBar';
import { useSession } from '../features/session';

const OWNER_ITEMS: NavItem[] = [
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
  const { isCashierMode } = useSession();
  const items = isCashierMode ? CASHIER_ITEMS : OWNER_ITEMS;

  return (
    <PageShell
      nav={<MainNav items={items} />}
      tabBar={<TabBar items={items} />}
      statusLabel={isCashierMode ? 'Mode Kasir' : undefined}
    >
      <Outlet />
    </PageShell>
  );
}
