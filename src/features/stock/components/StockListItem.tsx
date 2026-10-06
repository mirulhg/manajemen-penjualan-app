import { Link, useLocation } from 'react-router';

import { formatNumber } from '../../../utils/format-number';
import { useStockThreshold } from '../hooks/use-stock-threshold';
import type { Product } from '../schema';
import { getStockStatus } from '../stock-status';
import { StockStatusBadge } from './StockStatusBadge';

type StockListItemProps = {
  product: Product;
};

// HP: dua kolom (nama | stok + status). md ke atas: baris bergaya tabel, kolomnya sejajar dengan header di StockList.
export function StockListItem({ product }: StockListItemProps) {
  const location = useLocation();
  const status = getStockStatus(product.stockQuantity, product.minStock, useStockThreshold());

  return (
    <Link
      to={`/stok/${product.id}`}
      state={{ search: location.search }}
      className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 tap-row md:grid md:grid-cols-12"
    >
      <div className="min-w-0 md:col-span-5">
        <p className="line-clamp-2 font-medium">
          {product.name}
          {product.archivedAt !== null && (
            <span className="ml-2 rounded-md border border-border px-2 py-1 text-sm font-normal text-muted-foreground">
              Diarsipkan
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {product.sku}
          <span className="md:hidden"> · {product.category}</span>
        </p>
      </div>
      <p className="hidden truncate text-muted-foreground md:col-span-3 md:block">{product.category}</p>
      <div className="flex shrink-0 flex-col items-end gap-1 md:contents">
        <p className="font-medium md:col-span-2 md:text-right">
          {formatNumber(product.stockQuantity)} {product.unit}
        </p>
        <div className="md:col-span-2 md:pl-4">
          <StockStatusBadge status={status} />
        </div>
      </div>
    </Link>
  );
}
