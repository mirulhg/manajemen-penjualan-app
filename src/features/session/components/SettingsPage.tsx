import { Link } from 'react-router';

import { AlertSettingsSection } from './AlertSettingsSection';
import { EnterCashierModeSection } from './EnterCashierModeSection';
import { OversellSetting } from './OversellSetting';
import { PinSection } from './PinSection';

export function SettingsPage() {
  return (
    <section className="space-y-8">
      <title>Pengaturan · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Pengaturan</h1>
      <OversellSetting />
      <AlertSettingsSection />
      <PinSection />
      <EnterCashierModeSection />
      <Link to="/kategori" className="inline-flex min-h-11 items-center font-medium text-primary">
        Kelola kategori
      </Link>
    </section>
  );
}
