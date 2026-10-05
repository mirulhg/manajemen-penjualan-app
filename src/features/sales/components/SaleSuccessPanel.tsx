import { Link } from 'react-router';

import { formatRupiah } from '../../../utils/format-rupiah';
import type { Sale } from '../../../lib/db/records';
import { useSession } from '../../session';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    <Alert variant="success" role="status" className="space-y-2 p-4">
      <p className="font-medium">Transaksi {sale.number} tersimpan</p>
      <p>Total {formatRupiah(sale.total)}</p>
      <p className="text-2xl font-semibold">Kembalian {formatRupiah(sale.change)}</p>
      {!isCashierMode && (
        <Button asChild variant="outline"><Link to={`/penjualan/${sale.id}`}>
          Lihat transaksi
        </Link></Button>
      )}
      <Button size="lg" className="w-full text-lg" type="button" ref={focusOnMount} onClick={onNewSale}>
        Transaksi baru
      </Button>
    </Alert>
  );
}
