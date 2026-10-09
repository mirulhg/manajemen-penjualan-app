import { HelpLink } from '../../help';
import { CashierContent } from './CashierContent';

export function CashierPage() {
  return (
    <section>
      <title>Kasir · Manajemen Stok</title>
      <div className="mb-4 flex items-center gap-1">
        <h1 className="text-xl font-semibold">Kasir</h1>
        <HelpLink topic="kasir" />
      </div>
      <CashierContent />
    </section>
  );
}
