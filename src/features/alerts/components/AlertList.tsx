import { useRef } from 'react';
import { Link } from 'react-router';

import type { OpenAlert } from '../../../lib/db/stock-alerts';
import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { StockStatusBadge } from '../../stock';
import { useStockThreshold } from '../../stock';
import { useMarkAlertsRead } from '../api/use-alerts';
import { ChevronRight } from 'lucide-react';

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
    <ul ref={handleListRef} className="rounded-md border border-border bg-card">
      {alerts.map(({ alert, product }) => (
        <li key={alert.id} className="border-b border-border last:border-b-0">
          <Link to={`/stok/${product.id}`} className="tap-row flex min-h-11 items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Stok {formatNumber(product.stockQuantity)} {product.unit} · Batas {formatNumber(product.minStock ?? defaultMinStock)}
              </p>
              <p className="text-sm text-muted-foreground">Sejak {formatDateTime(alert.openedAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StockStatusBadge status={alert.level} />
              <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
