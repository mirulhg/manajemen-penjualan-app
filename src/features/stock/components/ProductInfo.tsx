import type { ReactNode } from 'react';

import { formatDateTime } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useSession } from '../../session';
import { useStockThreshold } from '../hooks/use-stock-threshold';
import type { Product } from '../schema';
import { getStockStatus } from '../stock-status';
import { getStockValue } from '../stock-value';
import { StockStatusBadge } from './StockStatusBadge';

type ProductInfoProps = {
  product: Product;
};

export function ProductInfo({ product }: ProductInfoProps) {
  const { isCashierMode } = useSession();
  const defaultMinStock = useStockThreshold();
  const minStockText =
    product.minStock === null ? `${formatNumber(defaultMinStock)} (default)` : formatNumber(product.minStock);
  const rows: { label: string; value: ReactNode }[] = [
    { label: 'SKU', value: product.sku },
    { label: 'Kategori', value: product.category },
    { label: 'Satuan', value: product.unit },
    {
      label: 'Stok sekarang',
      value: (
        <span className="flex items-center gap-2">
          {formatNumber(product.stockQuantity)} {product.unit}
          <StockStatusBadge status={getStockStatus(product.stockQuantity, product.minStock, defaultMinStock)} />
        </span>
      ),
    },
    { label: 'Batas stok menipis', value: minStockText },
    // Kasir tidak boleh melihat harga beli maupun nilai stok; barisnya tidak dibuat sama sekali.
    ...(isCashierMode ? [] : [{ label: 'Harga beli', value: formatRupiah(product.purchasePrice) }]),
    { label: 'Harga jual', value: formatRupiah(product.sellingPrice) },
    ...(isCashierMode
      ? []
      : [{ label: 'Nilai stok', value: formatRupiah(getStockValue(product.stockQuantity, product.purchasePrice)) }]),
    { label: 'Dibuat', value: formatDateTime(product.createdAt) },
    { label: 'Terakhir diperbarui', value: formatDateTime(product.updatedAt) },
  ];

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">
        {product.name}
        {product.archivedAt !== null && (
          <span className="ml-2 rounded-md border border-border px-2 py-1 text-sm font-normal text-muted-foreground">
            Diarsipkan
          </span>
        )}
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
