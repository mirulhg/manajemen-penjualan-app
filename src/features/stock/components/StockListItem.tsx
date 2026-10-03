import { Link, useLocation } from 'react-router';

import { formatNumber } from '../../../utils/format-number';
import type { Product } from '../schema';
import { getStockStatus } from '../stock-status';
import { StockStatusBadge } from './StockStatusBadge';

type StockListItemProps = {
  product: Product;
};

export function StockListItem({ product }: StockListItemProps) {
  const location = useLocation();
  const status = getStockStatus(product.stockQuantity, product.minStock);

  return (
    <Link
      to={`/stok/${product.id}`}
      state={{ search: location.search }}
      className="flex min-h-11 items-center justify-between gap-4 px-4 py-3"
    >
      <div className="min-w-0">
        <p className="font-medium">
          {product.name}
          {product.archivedAt !== null && (
            <span className="ml-2 rounded-md border border-border px-2 py-1 text-sm font-normal text-text-muted">
              Diarsipkan
            </span>
          )}
        </p>
        <p className="text-sm text-text-muted">
          {product.sku} · {product.category}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className="font-medium">
          {formatNumber(product.stockQuantity)} {product.unit}
        </p>
        <StockStatusBadge status={status} />
      </div>
    </Link>
  );
}
