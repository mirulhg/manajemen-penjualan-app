import { OwnerOnly, useSession } from '../../session';
import { AlertsContent } from './AlertsContent';

export function AlertsPage() {
  const { isCashierMode, alertsInCashierMode } = useSession();
  const page = (
    <section>
      <title>Peringatan Stok · Manajemen Stok</title>
      <h1 className="mb-4 text-xl font-semibold">Peringatan stok</h1>
      <AlertsContent />
    </section>
  );

  // Kasir hanya boleh bila pemilik mengaktifkannya; selain itu halaman ini seperti halaman pemilik lainnya.
  return isCashierMode && alertsInCashierMode ? page : <OwnerOnly>{page}</OwnerOnly>;
}
