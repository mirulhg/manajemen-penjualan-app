import { formatDateTime } from '../../../utils/format-date-time';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { Sale } from '../../../lib/db/records';
import { saleDisplayStatus } from '../sale-status';
import { SaleStatusLabel } from './SaleStatusLabel';

type SaleDetailInfoProps = {
  sale: Sale;
};

const METHOD_LABELS = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS' } as const;

export function SaleDetailInfo({ sale }: SaleDetailInfoProps) {
  const rows = [
    { label: 'Waktu', value: formatDateTime(sale.createdAt) },
    { label: 'Pelaku', value: sale.actor },
    { label: 'Metode bayar', value: METHOD_LABELS[sale.paymentMethod] },
    { label: 'Subtotal', value: formatRupiah(sale.subtotal) },
    { label: 'Diskon barang', value: formatRupiah(sale.itemDiscountTotal) },
    { label: 'Diskon transaksi', value: formatRupiah(sale.transactionDiscount) },
    { label: 'Total', value: formatRupiah(sale.total) },
    { label: 'Uang diterima', value: formatRupiah(sale.amountPaid) },
    { label: 'Kembalian', value: formatRupiah(sale.change) },
    ...(sale.refundedTotal > 0
      ? [{ label: 'Sudah dikembalikan', value: formatRupiah(sale.refundedTotal) }]
      : []),
  ];

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{sale.number}</h2>
        <SaleStatusLabel status={saleDisplayStatus(sale)} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
      {sale.status === 'dibatalkan' && sale.cancelledAt && (
        <div className="mt-4 rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          <p className="font-medium">Dibatalkan pada {formatDateTime(sale.cancelledAt)}</p>
          <p>Alasan: {sale.cancelReason}</p>
          <p>Oleh: {sale.cancelledBy}</p>
        </div>
      )}
    </div>
  );
}
