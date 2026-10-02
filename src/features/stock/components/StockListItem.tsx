import { formatNumber } from '../../../utils/format-number';
import type { Product } from '../schema';
import { getStockStatus } from '../stock-status';
import { StockStatusBadge } from './StockStatusBadge';

type StockListItemProps = {
  product: Product;
};

export function StockListItem({ product }: StockListItemProps) {
  const status = getStockStatus(product.stockQuantity, product.minStock);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium">{product.name}</p>
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
    </div>
  );
}
