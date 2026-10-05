import { Link } from 'react-router';

import { formatRupiah } from '../../../utils/format-rupiah';
import type { Sale } from '../../../lib/db/records';
import { useSession } from '../../session';

type SaleSuccessPanelProps = {
  sale: Sale;
  onNewSale: () => void;
};

// Referensi stabil di luar komponen: fokus hanya dipindah saat tombol pertama kali tampil, bukan di setiap render.
function focusOnMount(element: HTMLButtonElement | null) {
  element?.focus();
}

export function SaleSuccessPanel({ sale, onNewSale }: SaleSuccessPanelProps) {
  const { isCashierMode } = useSession();

  return (
    <div role="status" className="space-y-2 rounded-md bg-status-aman-bg p-4 text-status-aman-text">
      <p className="font-medium">Transaksi {sale.number} tersimpan</p>
      <p>Total {formatRupiah(sale.total)}</p>
      <p className="text-2xl font-semibold">Kembalian {formatRupiah(sale.change)}</p>
      {!isCashierMode && (
        <Link to={`/penjualan/${sale.id}`} className="inline-flex min-h-11 items-center font-medium underline">
          Lihat transaksi
        </Link>
      )}
      <button
        type="button"
        ref={focusOnMount}
        onClick={onNewSale}
        className="min-h-12 w-full rounded-md bg-primary px-4 text-lg font-medium text-primary-foreground"
      >
        Transaksi baru
      </button>
    </div>
  );
}
