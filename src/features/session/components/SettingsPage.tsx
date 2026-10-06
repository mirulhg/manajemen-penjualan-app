import { ChevronRight, Tags } from 'lucide-react';
import { Link } from 'react-router';

import { StoreProfileSection } from '../../store-profile';
import { AlertSettingsSection } from './AlertSettingsSection';
import { EnterCashierModeSection } from './EnterCashierModeSection';
import { OversellSetting } from './OversellSetting';
import { PinSection } from './PinSection';

export function SettingsPage() {
  return (
    <section className="space-y-4">
      <title>Pengaturan · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Pengaturan</h1>
      <OversellSetting />
      <StoreProfileSection />
      <AlertSettingsSection />
      <PinSection />
      <EnterCashierModeSection />
      <Link
        to="/kategori"
        className="tap-row flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-4 py-2 font-medium"
      >
        <Tags aria-hidden="true" className="size-5 text-muted-foreground" />
        <span className="flex-1">Kelola kategori</span>
        <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
      </Link>
      <p className="text-sm text-muted-foreground">Versi {__APP_VERSION__}</p>
    </section>
  );
}
