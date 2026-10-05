import { useSession } from '../../session';
import { useOpenAlerts } from '../api/use-alerts';
import { AlertList } from './AlertList';
import { AlertsSkeleton } from './AlertsSkeleton';
import { RestockSection } from './RestockSection';
import { Button } from '@/components/ui/button';

export function AlertsContent() {
  const { isCashierMode } = useSession();
  const { data, isPending, error, refetch } = useOpenAlerts();

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <AlertsSkeleton />;
  if (error) {
    return (
      <div role="alert">
        <p className="text-muted-foreground">
          Peringatan stok gagal dibaca dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal, muat ulang halaman.
        </p>
        <p className="mt-2 rounded-md border border-border bg-card p-3 text-sm">{error.message}</p>
        <Button size="lg" className="mt-3" type="button" onClick={handleRetry}>
          Coba lagi
        </Button>
      </div>
    );
  }
  if (data.length === 0) return <p className="text-muted-foreground">Tidak ada barang yang menipis atau habis.</p>;

  return (
    <div className="space-y-8">
      <AlertList alerts={data} />
      {!isCashierMode && <RestockSection />}
    </div>
  );
}
