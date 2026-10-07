import { ScrollTable } from '../../../components/ui/ScrollTable';
import { describeDaysUntilOut, FORECAST_DAYS } from '../../../lib/db/product-analytics-rows';
import { formatNumber } from '../../../utils/format-number';
import { useStockForecast } from '../api/use-product-analysis';
import { ChartSection } from './ChartSection';
import { ProductNameLink } from './ProductNameLink';

const averageFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function StockForecastSection() {
  const { data, isPending, error, refetch } = useStockForecast();

  function handleRetry() {
    void refetch();
  }

  return (
    <ChartSection
      title="Perkiraan stok habis"
      status={{ isPending, error, isEmpty: !data || data.length === 0, onRetry: handleRetry }}
    >
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Dihitung dari penjualan {FORECAST_DAYS} hari terakhir. Saran restock cukup untuk {FORECAST_DAYS} hari ke depan.
        </p>
        <ScrollTable caption="Barang aktif menurut perkiraan waktu habis, paling cepat habis di atas">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-2 font-medium">Produk</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Stok</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Rata-rata/hari</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Perkiraan habis</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Saran restock</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.productId} className="border-b border-border last:border-b-0">
                <td className="px-3 py-1">
                  <ProductNameLink productId={row.productId} name={row.name} isArchived={false} />
                </td>
                <td className="px-3 py-1 text-right">{formatNumber(row.stockQuantity)}</td>
                <td className="px-3 py-1 text-right">{averageFormat.format(row.averagePerDay)}</td>
                <td className="px-3 py-1 text-right">{describeDaysUntilOut(row.daysUntilOut)}</td>
                <td className="px-3 py-1 text-right">
                  {row.restockSuggestion > 0 ? `${formatNumber(row.restockSuggestion)} ${row.unit}` : 'Belum perlu'}
                </td>
              </tr>
            ))}
          </tbody>
        </ScrollTable>
      </div>
    </ChartSection>
  );
}
