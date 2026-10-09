import { HelpLink } from '../../help';
import { canCashierSeeAlerts, OwnerOnly, useSession } from '../../session';
import { AlertsContent } from './AlertsContent';

export function AlertsPage() {
  const session = useSession();
  const page = (
    <section>
      <title>Peringatan Stok · Manajemen Stok</title>
      <div className="mb-4 flex items-center gap-1">
        <h1 className="text-xl font-semibold">Peringatan stok</h1>
        <HelpLink topic="peringatan" />
      </div>
      <AlertsContent />
    </section>
  );

  // Kasir hanya boleh bila pemilik mengaktifkannya; selain itu halaman ini seperti halaman pemilik lainnya.
  return session.isCashierMode && canCashierSeeAlerts(session) ? page : <OwnerOnly>{page}</OwnerOnly>;
}
