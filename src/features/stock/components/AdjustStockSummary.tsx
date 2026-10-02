import { formatNumber } from '../../../utils/format-number';
import type { Product } from '../schema';
import { getStockStatus } from '../stock-status';
import { StockStatusBadge } from './StockStatusBadge';

type AdjustStockSummaryProps = {
  product: Product;
};

export function AdjustStockSummary({ product }: AdjustStockSummaryProps) {
  const status = getStockStatus(product.stockQuantity, product.minStock);

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-sm text-text-muted">
        {product.sku} · {product.category}
      </p>
      <p className="mt-4 flex items-center gap-2">
        <span>
          Stok sekarang: <strong>{formatNumber(product.stockQuantity)} {product.unit}</strong>
        </span>
        <StockStatusBadge status={status} />
      </p>
    </div>
  );
}
