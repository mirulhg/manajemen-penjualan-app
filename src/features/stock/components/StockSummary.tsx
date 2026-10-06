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
    <div className="rounded-md border border-border bg-card p-4">
      <p className="mb-2 text-sm text-muted-foreground">Barang aktif</p>
      <dl className="grid grid-cols-2 gap-4">
        {figures.map((figure) => (
          <div key={figure.label} className={figure.label === 'Nilai stok' ? 'col-span-2' : undefined}>
            <dt className="text-sm text-muted-foreground">{figure.label}</dt>
            <dd className="font-semibold">{figure.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
