import { History, LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from 'lucide-react';
import { Outlet } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { AlertBell } from '../components/layout/AlertBell';
import { MainNav } from '../components/layout/MainNav';
import type { NavItem } from '../components/layout/nav-items';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/layout/TabBar';
import { useUnreadAlertCount } from '../features/alerts';
import { useSession } from '../features/session';
import { useStoreProfile } from '../features/store-profile';

const OWNER_ITEMS: NavItem[] = [
  { to: '/dasbor', label: 'Dasbor', icon: LayoutDashboard },
  { to: '/stok', label: 'Stok', icon: Package },
  { to: '/kasir', label: 'Kasir', icon: ShoppingCart },
  { to: '/penjualan', label: 'Riwayat', icon: History },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

const CASHIER_ITEMS: NavItem[] = [
  { to: '/kasir', label: 'Kasir', icon: ShoppingCart },
  { to: '/stok', label: 'Stok', icon: Package },
  { to: '/keluar-mode-kasir', label: 'Keluar', icon: LogOut },
];

export function AppLayout() {
  const { isCashierMode, alertsBellEnabled, alertsInCashierMode } = useSession();
  const { data: unreadCount = 0 } = useUnreadAlertCount();
  const { data: profile } = useStoreProfile();
  const items = isCashierMode ? CASHIER_ITEMS : OWNER_ITEMS;
  // Kasir hanya melihat lonceng bila pemilik mengaktifkannya (isinya informasi belanja pemilik).
  const isBellVisible = alertsBellEnabled && (!isCashierMode || alertsInCashierMode);

  return (
    <PageShell
      brand={
        <>
          {/* Sama dengan kop laporan: tanpa profil, nama toko ditulis "Toko Saya". */}
          <p className="truncate text-lg font-semibold">{profile?.name ?? 'Toko Saya'}</p>
          {isCashierMode && <Badge variant="outline">Mode Kasir</Badge>}
        </>
      }
      nav={<MainNav items={items} />}
      bell={isBellVisible ? <AlertBell count={unreadCount} href="/peringatan" /> : undefined}
      tabBar={<TabBar items={items} />}
    >
      <Outlet />
    </PageShell>
  );
}
