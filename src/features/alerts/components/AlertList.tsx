import { useRef } from 'react';
import { Link } from 'react-router';

import type { OpenAlert } from '../../../lib/db/stock-alerts';
import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { StockStatusBadge } from '../../stock';
import { useStockThreshold } from '../../stock';
import { useMarkAlertsRead } from '../api/use-alerts';

type AlertListProps = {
  alerts: OpenAlert[];
};

export function AlertList({ alerts }: AlertListProps) {
  const defaultMinStock = useStockThreshold();
  const markRead = useMarkAlertsRead();
  const hasMarked = useRef(false);

  // Dipanggil saat daftar benar-benar tampil: membuka halaman = semua peringatan dibaca. Callback ref (bukan useEffect) dengan
  // penjaga, jadi hanya sekali walau komponen dirender ulang atau StrictMode memasang dua kali.
  function handleListRef(element: HTMLUListElement | null) {
    if (!element || hasMarked.current) return;
    hasMarked.current = true;
    markRead.mutate();
  }

  return (
    <ul ref={handleListRef} className="rounded-md border border-border bg-surface">
      {alerts.map(({ alert, product }) => (
        <li
          key={alert.id}
          className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <Link to={`/stok/${product.id}`} className="inline-flex min-h-11 items-center font-medium text-primary underline">
              {product.name}
            </Link>
            <p className="text-sm text-text-muted">
              Stok {formatNumber(product.stockQuantity)} {product.unit} · Batas {formatNumber(product.minStock ?? defaultMinStock)}
            </p>
            <p className="text-sm text-text-muted">Sejak {formatDateTime(alert.openedAt)}</p>
          </div>
          <StockStatusBadge status={alert.level} />
        </li>
      ))}
    </ul>
  );
}
