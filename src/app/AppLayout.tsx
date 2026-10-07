import { History, LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { AlertBell } from '../components/layout/AlertBell';
import { MainNav } from '../components/layout/MainNav';
import type { NavItem } from '../components/layout/nav-items';
import { PageEnter } from '../components/layout/PageEnter';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/layout/TabBar';
import { useUnreadAlertCount } from '../features/alerts';
import { useSession } from '../features/session';
import { useStoreProfile } from '../features/store-profile';
import { CommandPaletteTrigger } from './command-palette/CommandPaletteTrigger';
import { getPageWidth } from './wide-routes';

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
  const width = getPageWidth(useLocation().pathname);
  const items = isCashierMode ? CASHIER_ITEMS : OWNER_ITEMS;
  // Kasir hanya melihat lonceng bila pemilik mengaktifkannya (isinya informasi belanja pemilik).
  const isBellVisible = alertsBellEnabled && (!isCashierMode || alertsInCashierMode);

  return (
    <>
      <PageShell
        width={width}
        brand={
          <>
            {/* Sama dengan kop laporan: tanpa profil, nama toko ditulis "Toko Saya". */}
            <p className="truncate text-lg font-semibold">{profile?.name ?? 'Toko Saya'}</p>
            {isCashierMode && <Badge variant="outline">Mode Kasir</Badge>}
          </>
        }
        actions={
          <>
            <MainNav items={items} />
            <CommandPaletteTrigger />
            {isBellVisible && <AlertBell count={unreadCount} href="/peringatan" />}
          </>
        }
        tabBar={<TabBar items={items} />}
      >
        <PageEnter>
          <Outlet />
        </PageEnter>
      </PageShell>
    <Toaster offset={{ bottom: 'var(--toast-offset)' }} mobileOffset={{ bottom: 'var(--toast-offset)' }} />
    </>
  );
}
