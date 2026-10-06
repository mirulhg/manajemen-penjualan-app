import { toast } from 'sonner';

import { useAllowOversell } from '../api/use-allow-oversell';
import { useSetAllowOversell } from '../api/use-session-mutations';
import { SectionCard } from '../../../components/ui/SectionCard';
import { SettingSwitchRow } from '../../../components/ui/SettingSwitchRow';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function OversellSetting() {
  const allowOversell = useAllowOversell();
  const mutation = useSetAllowOversell();

  function handleToggle(checked: boolean) {
    mutation.mutate(checked, {
      onSuccess: () => toast.success(`Jual melebihi stok ${checked ? 'diizinkan' : 'tidak diizinkan'}`),
    });
  }

  function handleRetry() {
    void allowOversell.refetch();
  }

  return (
    <SectionCard id="sales-heading" title="Penjualan" description="Aturan saat kasir mencatat transaksi.">
      {allowOversell.isError ? (
        <Alert variant="destructive" className="p-3">
          <p>Pengaturan tidak bisa dibaca dari penyimpanan di perangkat ini.</p>
          <Button size="lg" type="button" onClick={handleRetry}>
            Coba lagi
          </Button>
        </Alert>
      ) : (
        <SettingSwitchRow
          id="allow-oversell"
          label="Izinkan jual melebihi stok"
          description="Stok bisa menjadi minus. Peringatan tetap muncul di kasir."
          checked={allowOversell.data === true}
          disabled={allowOversell.isPending || mutation.isPending}
          onCheckedChange={handleToggle}
        />
      )}
      {mutation.isError && (
        <Alert variant="destructive" className="p-3">
          Pengaturan gagal disimpan. Coba lagi.
        </Alert>
      )}
    </SectionCard>
  );
}
