import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import type { StockMovement } from '../schema';

type StockMovementItemProps = {
  movement: StockMovement;
  unit: string;
};

const TYPE_LABELS = {
  awal: 'Stok awal',
  masuk: 'Stok masuk',
  koreksi: 'Koreksi',
  jual: 'Penjualan',
} as const;

function formatDelta(delta: number): string {
  if (delta > 0) return `+${formatNumber(delta)}`;
  if (delta < 0) return `−${formatNumber(Math.abs(delta))}`;
  return '0';
}

export function StockMovementItem({ movement, unit }: StockMovementItemProps) {
  const delta = movement.quantityAfter - movement.quantityBefore;

  return (
    <li className="border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">
          {TYPE_LABELS[movement.type]} {formatDelta(delta)}
        </p>
        <time dateTime={movement.createdAt} className="text-sm text-text-muted">
          {formatDateTime(movement.createdAt)}
        </time>
      </div>
      <p>
        {formatNumber(movement.quantityBefore)} → {formatNumber(movement.quantityAfter)} {unit}
      </p>
      <p className="text-sm text-text-muted">
        {movement.reason} · {movement.actor}
      </p>
    </li>
  );
}
