import { Link, useLocation } from 'react-router';

import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { Sale } from '../../../lib/db/records';
import { saleDisplayStatus } from '../sale-status';
import { SaleStatusLabel } from './SaleStatusLabel';

type SaleHistoryItemProps = {
  sale: Sale;
};

const METHOD_LABELS = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS' } as const;

export function SaleHistoryItem({ sale }: SaleHistoryItemProps) {
  const location = useLocation();

  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        to={`/penjualan/${sale.id}`}
        state={{ search: location.search }}
        className="flex min-h-11 items-center justify-between gap-4 px-4 py-3"
      >
        <div className="min-w-0">
          <p className="font-medium">{sale.number}</p>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(sale.createdAt)} · {METHOD_LABELS[sale.paymentMethod]} ·{' '}
            {formatNumber(sale.itemCount)} barang
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="font-medium">{formatRupiah(sale.total)}</p>
          <SaleStatusLabel status={saleDisplayStatus(sale)} />
        </div>
      </Link>
    </li>
  );
}
