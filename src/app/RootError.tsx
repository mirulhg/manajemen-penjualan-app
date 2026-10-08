import { TriangleAlert } from 'lucide-react';
import { useRouteError } from 'react-router';

import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { PageShell } from '../components/layout/PageShell';

// Dipakai bila AppLayout sendiri rusak, jadi tidak boleh bergantung pada hook sesi.
export function RootError() {
  const error = useRouteError();

  return (
    <PageShell brand={<p className="text-lg font-semibold">Manajemen Stok</p>}>
      <ErrorScreen
        icon={TriangleAlert}
        title="Aplikasi mengalami kesalahan"
        description="Ada yang tidak berjalan semestinya. Data yang sudah tersimpan tidak terpengaruh. Muat ulang halaman."
        detail={error instanceof Error ? error.message : String(error)}
      >
        <ReloadButton />
      </ErrorScreen>
    </PageShell>
  );
}
