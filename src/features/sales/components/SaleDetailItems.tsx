import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { SaleItemProgress } from '../sale-returns';

type SaleDetailItemsProps = {
  progress: SaleItemProgress[];
};

export function SaleDetailItems({ progress }: SaleDetailItemsProps) {
  return (
    <section aria-labelledby="sale-items-heading" className="mt-6">
      <h2 id="sale-items-heading" className="mb-2 text-lg font-semibold">
        Barang
      </h2>
      <ul className="rounded-md border border-border bg-surface">
        {progress.map(({ item, net, returnedQuantity }) => (
          <li key={item.id} className="border-b border-border px-4 py-3 last:border-b-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium">{item.productName}</p>
              <p className="shrink-0 font-medium">{formatRupiah(net)}</p>
            </div>
            <p className="text-sm text-text-muted">
              {formatNumber(item.quantity)} {item.unit} × {formatRupiah(item.unitPrice)}
              {item.discount > 0 && ` · diskon ${formatRupiah(item.discount)}`}
            </p>
            {returnedQuantity > 0 && (
              <p className="text-sm">
                Sudah diretur {formatNumber(returnedQuantity)} {item.unit}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-text-muted">
        Nilai di kanan adalah nilai bersih setelah diskon barang dan bagian diskon transaksi.
      </p>
    </section>
  );
}
