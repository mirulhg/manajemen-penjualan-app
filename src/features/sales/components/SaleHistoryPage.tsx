import { HelpLink } from '../../help';
import { SaleHistoryContent } from './SaleHistoryContent';

export function SaleHistoryPage() {
  return (
    <section>
      <title>Riwayat Penjualan · Manajemen Stok</title>
      <div className="mb-4 flex items-center gap-1">
        <h1 className="text-xl font-semibold">Riwayat Penjualan</h1>
        <HelpLink topic="riwayat" />
      </div>
      <SaleHistoryContent />
    </section>
  );
}
