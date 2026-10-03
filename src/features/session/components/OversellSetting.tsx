import type { ChangeEvent } from 'react';

import { useAllowOversell } from '../api/use-allow-oversell';
import { useSetAllowOversell } from '../api/use-session-mutations';

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
        <div role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          <p>Pengaturan tidak bisa dibaca dari penyimpanan di perangkat ini.</p>
          <button type="button" onClick={handleRetry} className="min-h-11 font-medium underline">
            Coba lagi
          </button>
        </div>
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
          <p className="text-sm text-text-muted">Stok bisa menjadi minus. Peringatan tetap muncul di kasir.</p>
        </>
      )}
      {mutation.isError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Pengaturan gagal disimpan. Coba lagi.
        </p>
      )}
    </section>
  );
}
