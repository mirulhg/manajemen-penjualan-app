import type { SaleDisplayStatus } from '../sale-status';

type SaleStatusLabelProps = {
  status: SaleDisplayStatus;
};

const LABELS = {
  selesai: { text: 'Selesai', className: 'bg-status-aman-bg text-status-aman-text' },
  'retur-sebagian': { text: 'Retur sebagian', className: 'bg-status-menipis-bg text-status-menipis-text' },
  'diretur-penuh': { text: 'Diretur penuh', className: 'bg-status-menipis-bg text-status-menipis-text' },
  dibatalkan: { text: 'Dibatalkan', className: 'bg-status-habis-bg text-status-habis-text' },
} as const;

// Status selalu berupa teks; warna hanya penguat.
export function SaleStatusLabel({ status }: SaleStatusLabelProps) {
  const { text, className } = LABELS[status];
  return (
    <span className={`inline-block rounded-md px-2 py-1 text-sm font-medium ${className}`}>{text}</span>
  );
}
