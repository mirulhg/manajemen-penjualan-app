import { formatDateTime } from '../../../utils/format-date-time';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { PriceChange } from '../../../lib/db/records';

type PriceChangeItemProps = {
  change: PriceChange;
};

const FIELD_LABELS = { purchasePrice: 'Harga beli', sellingPrice: 'Harga jual' } as const;

export function PriceChangeItem({ change }: PriceChangeItemProps) {
  return (
    <li className="border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">{FIELD_LABELS[change.field]}</p>
        <time dateTime={change.createdAt} className="text-sm text-muted-foreground">
          {formatDateTime(change.createdAt)}
        </time>
      </div>
      <p>
        {formatRupiah(change.before)} → {formatRupiah(change.after)}
      </p>
      <p className="text-sm text-muted-foreground">{change.actor}</p>
    </li>
  );
}
