import { Link } from 'react-router';

import { StoreProfileSection } from '../../store-profile';
import { AlertSettingsSection } from './AlertSettingsSection';
import { EnterCashierModeSection } from './EnterCashierModeSection';
import { OversellSetting } from './OversellSetting';
import { PinSection } from './PinSection';
import { Button } from '@/components/ui/button';

export function SettingsPage() {
  return (
    <section className="space-y-8">
      <title>Pengaturan · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Pengaturan</h1>
      <OversellSetting />
      <StoreProfileSection />
      <AlertSettingsSection />
      <PinSection />
      <EnterCashierModeSection />
      <Button asChild variant="outline"><Link to="/kategori">
        Kelola kategori
      </Link></Button>
    </section>
  );
}
