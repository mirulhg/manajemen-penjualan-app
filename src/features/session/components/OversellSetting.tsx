import type { ChangeEvent } from 'react';

import { useAllowOversell } from '../api/use-allow-oversell';
import { useSetAllowOversell } from '../api/use-session-mutations';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function OversellSetting() {
  const allowOversell = useAllowOversell();
  const mutation = useSetAllowOversell();

  function handleToggle(event: ChangeEvent<HTMLInputElement>) {
    mutation.mutate(event.target.checked);
  }

  function handleRetry() {
    void allowOversell.refetch();
  }

  return (
    <section aria-labelledby="sales-heading" className="space-y-3">
      <h2 id="sales-heading" className="text-lg font-semibold">
        Penjualan
      </h2>
      {allowOversell.isError ? (
        <Alert variant="destructive" className="p-3">
          <p>Pengaturan tidak bisa dibaca dari penyimpanan di perangkat ini.</p>
          <Button size="lg" type="button" onClick={handleRetry}>
            Coba lagi
          </Button>
        </Alert>
      ) : (
        <>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              checked={allowOversell.data === true}
              disabled={allowOversell.isPending || mutation.isPending}
              onChange={handleToggle}
            />
            Izinkan jual melebihi stok
          </label>
          <p className="text-sm text-muted-foreground">Stok bisa menjadi minus. Peringatan tetap muncul di kasir.</p>
        </>
      )}
      {mutation.isError && (
        <Alert variant="destructive" className="p-3">
          Pengaturan gagal disimpan. Coba lagi.
        </Alert>
      )}
    </section>
  );
}
