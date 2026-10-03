import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { SaleReturn } from '../../../lib/db/records';
import type { SaleItemProgress } from '../sale-returns';

type SaleReturnsListProps = {
  returns: SaleReturn[];
  progress: SaleItemProgress[];
};

export function SaleReturnsList({ returns, progress }: SaleReturnsListProps) {
  if (returns.length === 0) return null;
  const itemsById = new Map(progress.map((entry) => [entry.item.id, entry.item]));

  return (
    <section aria-labelledby="sale-returns-heading" className="mt-6">
      <h2 id="sale-returns-heading" className="mb-2 text-lg font-semibold">
        Retur
      </h2>
      <ul className="rounded-md border border-border bg-surface">
        {returns.map((saleReturn) => (
          <li key={saleReturn.id} className="border-b border-border px-4 py-3 last:border-b-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium">{saleReturn.number}</p>
              <p className="shrink-0 font-medium">{formatRupiah(saleReturn.refundTotal)}</p>
            </div>
            <p className="text-sm text-text-muted">{formatDateTime(saleReturn.createdAt)}</p>
            <ul className="text-sm">
              {saleReturn.items.map((line) => {
                const item = itemsById.get(line.saleItemId);
                return (
                  <li key={line.saleItemId}>
                    {item?.productName ?? 'Barang'} × {formatNumber(line.quantity)} {item?.unit}
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-text-muted">Alasan: {saleReturn.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
