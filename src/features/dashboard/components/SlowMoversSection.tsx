import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { ScrollTable } from '../../../components/ui/ScrollTable';
import { formatNumber } from '../../../utils/format-number';
import { formatLocalDate } from '../../../utils/format-date-time';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useSlowMovers } from '../api/use-product-analysis';
import { SLOW_MOVER_THRESHOLDS } from '../hooks/use-analysis-params';
import type { SlowMoverThreshold } from '../hooks/use-analysis-params';
import { ChartSection } from './ChartSection';
import { ProductNameLink } from './ProductNameLink';

type SlowMoversSectionProps = {
  threshold: SlowMoverThreshold;
  onThresholdChange: (threshold: SlowMoverThreshold) => void;
};

function findThreshold(value: string): SlowMoverThreshold {
  return SLOW_MOVER_THRESHOLDS.find((option) => String(option) === value) ?? 30;
}

export function SlowMoversSection({ threshold, onThresholdChange }: SlowMoversSectionProps) {
  const { data, isPending, error, refetch } = useSlowMovers(threshold);

  function handleRetry() {
    void refetch();
  }

  function handleThresholdChange(value: string) {
    onThresholdChange(findThreshold(value));
  }

  return (
    <ChartSection title="Lambat laku" isPending={isPending} error={error} isEmpty={false} onRetry={handleRetry}>
      <div className="space-y-3">
        <FormField id="analysis-threshold" label="Tidak terjual dalam" error={undefined}>
          {(control) => (
            <select
              {...control}
              value={threshold}
              onChange={(event) => handleThresholdChange(event.target.value)}
              className={FIELD_CLASS}
            >
              {SLOW_MOVER_THRESHOLDS.map((option) => (
                <option key={option} value={option}>
                  {option} hari terakhir
                </option>
              ))}
            </select>
          )}
        </FormField>
        {data && data.length === 0 ? (
          <p className="text-text-muted">Semua barang aktif terjual dalam {threshold} hari terakhir.</p>
        ) : (
          <ScrollTable caption={`Barang aktif tanpa penjualan dalam ${threshold} hari terakhir`}>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-3 py-2 font-medium">Produk</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Stok</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Nilai stok</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Terakhir terjual</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr key={row.productId} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-1">
                    <ProductNameLink productId={row.productId} name={row.name} isArchived={false} />
                  </td>
                  <td className="px-3 py-1 text-right">
                    {formatNumber(row.stockQuantity)} {row.unit}
                  </td>
                  <td className="px-3 py-1 text-right">{formatRupiah(row.stockValue)}</td>
                  <td className="px-3 py-1 text-right">
                    {row.lastSoldDate ? formatLocalDate(row.lastSoldDate) : 'Belum pernah'}
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        )}
      </div>
    </ChartSection>
  );
}
