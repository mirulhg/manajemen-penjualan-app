import type { ReactNode } from 'react';

import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { Product } from '../schema';
import { DEFAULT_MIN_STOCK, getStockStatus } from '../stock-status';
import { StockStatusBadge } from './StockStatusBadge';

type ProductInfoProps = {
  product: Product;
};

export function ProductInfo({ product }: ProductInfoProps) {
  const minStockText =
    product.minStock === null ? `${DEFAULT_MIN_STOCK} (default)` : formatNumber(product.minStock);
  const rows: { label: string; value: ReactNode }[] = [
    { label: 'SKU', value: product.sku },
    { label: 'Kategori', value: product.category },
    { label: 'Satuan', value: product.unit },
    {
      label: 'Stok sekarang',
      value: (
        <span className="flex items-center gap-2">
          {formatNumber(product.stockQuantity)} {product.unit}
          <StockStatusBadge status={getStockStatus(product.stockQuantity, product.minStock)} />
        </span>
      ),
    },
    { label: 'Batas stok menipis', value: minStockText },
    { label: 'Harga beli', value: formatRupiah(product.purchasePrice) },
    { label: 'Harga jual', value: formatRupiah(product.sellingPrice) },
    { label: 'Nilai stok', value: formatRupiah(product.stockQuantity * product.purchasePrice) },
    { label: 'Dibuat', value: formatDateTime(product.createdAt) },
    { label: 'Terakhir diperbarui', value: formatDateTime(product.updatedAt) },
  ];

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm text-text-muted">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
