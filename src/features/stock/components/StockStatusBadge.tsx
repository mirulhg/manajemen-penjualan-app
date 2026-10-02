import type { StockStatus } from '../stock-status';

type StockStatusBadgeProps = {
  status: StockStatus;
};

const BADGE_STYLES = {
  aman: { label: 'Aman', className: 'bg-status-aman-bg text-status-aman-text' },
  menipis: { label: 'Menipis', className: 'bg-status-menipis-bg text-status-menipis-text' },
  habis: { label: 'Habis', className: 'bg-status-habis-bg text-status-habis-text' },
} as const;

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const { label, className } = BADGE_STYLES[status];

  return (
    <span className={`inline-block rounded-md px-2 py-1 text-sm font-medium ${className}`}>
      {label}
    </span>
  );
}
