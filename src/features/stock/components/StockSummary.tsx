import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { Product } from '../schema';
import { getStockSummary } from '../stock-summary';

type StockSummaryProps = {
  products: Product[];
};

export function StockSummary({ products }: StockSummaryProps) {
  const { productCount, totalUnits, stockValue } = getStockSummary(products);
  const figures = [
    { label: 'Jenis barang', value: formatNumber(productCount) },
    { label: 'Total unit', value: formatNumber(totalUnits) },
    { label: 'Nilai stok', value: formatRupiah(stockValue) },
  ];

  return (
    <dl className="grid grid-cols-3 gap-4 rounded-md border border-border bg-surface p-4">
      {figures.map((figure) => (
        <div key={figure.label}>
          <dt className="text-sm text-text-muted">{figure.label}</dt>
          <dd className="font-semibold">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}
