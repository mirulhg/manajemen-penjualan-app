import { ChevronRight, CircleQuestionMark, Sparkles, Tags } from 'lucide-react';
import { Link } from 'react-router';

import { useHasUnseenChangelog } from '../../changelog';
import { DemoDataSection } from '../../demo-data';
import { HelpLink } from '../../help';
import { StoreProfileSection } from '../../store-profile';
import { Badge } from '@/components/ui/badge';
import { AlertSettingsSection } from './AlertSettingsSection';
import { EnterCashierModeSection } from './EnterCashierModeSection';
import { OversellSetting } from './OversellSetting';
import { PinSection } from './PinSection';
import { DeveloperSignature } from './DeveloperSignature';

export function SettingsPage() {
  const hasUnseenChangelog = useHasUnseenChangelog();

  return (
    <section className="space-y-4">
      <title>Pengaturan · Manajemen Stok</title>
      <div className="flex items-center gap-1">
        <h1 className="text-xl font-semibold">Pengaturan</h1>
        <HelpLink topic="pengaturan" />
      </div>
      <OversellSetting />
      <StoreProfileSection />
      <AlertSettingsSection />
      <PinSection />
      <EnterCashierModeSection />
      <DemoDataSection />
      <Link
        to="/pembaruan"
        className="tap-row flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-4 py-2 font-medium"
      >
        <Sparkles aria-hidden="true" className="size-5 text-muted-foreground" />
        <span className="flex-1">Apa yang baru</span>
        {hasUnseenChangelog && <Badge variant="accent">Baru</Badge>}
        <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
      </Link>
      <Link
        to="/bantuan"
        className="tap-row flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-4 py-2 font-medium"
      >
        <CircleQuestionMark aria-hidden="true" className="size-5 text-muted-foreground" />
        <span className="flex-1">Bantuan &amp; panduan</span>
        <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
      </Link>
      <Link
        to="/kategori"
        className="tap-row flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-4 py-2 font-medium"
      >
        <Tags aria-hidden="true" className="size-5 text-muted-foreground" />
        <span className="flex-1">Kelola kategori</span>
        <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-muted-foreground">Versi {__APP_VERSION__}</p>
        <DeveloperSignature />
      </div>
    </section>
  );
}
