import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { ScrollTable } from '../../../components/ui/ScrollTable';
import { markParetoContributors, rankBy } from '../../../lib/db/product-analytics-rows';
import type { DateRange } from '../../../utils/date-period';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useProductSales } from '../api/use-product-analysis';
import type { RankingKey } from '../hooks/use-analysis-params';
import { ChartSection } from './ChartSection';
import { ProductNameLink } from './ProductNameLink';

type RevenueProfitSectionProps = {
  range: DateRange;
  ranking: RankingKey;
  onRankingChange: (ranking: RankingKey) => void;
};

const TOP_LIMIT = 10;
const PARETO_THRESHOLD = 0.8;
const percentFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function RevenueProfitSection({ range, ranking, onRankingChange }: RevenueProfitSectionProps) {
  const { data, isPending, error, refetch } = useProductSales(range);

  function handleRetry() {
    void refetch();
  }

  function handleRankingChange(value: string) {
    onRankingChange(value === 'laba' ? 'laba' : 'omzet');
  }

  // Pareto selalu dari peringkat omzet SELURUH produk, walau tabel hanya menampilkan 10 baris.
  const byRevenue = data ? rankBy(data, 'revenue') : [];
  const pareto = markParetoContributors(byRevenue, PARETO_THRESHOLD);
  const shown = (ranking === 'omzet' ? byRevenue : data ? rankBy(data, 'grossProfit') : []).slice(0, TOP_LIMIT);
  const showPareto = ranking === 'omzet';

  return (
    <ChartSection title="Omzet & laba" status={{ isPending, error, isEmpty: shown.length === 0, onRetry: handleRetry }}>
      <div className="space-y-3">
        <FormField id="analysis-ranking" label="Urutkan berdasarkan" error={undefined}>
          {(control) => (
            <select
              {...control}
              value={ranking}
              onChange={(event) => handleRankingChange(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="omzet">Omzet</option>
              <option value="laba">Laba kotor</option>
            </select>
          )}
        </FormField>
        {showPareto && <p className="font-medium">{formatNumber(pareto.count)} produk menyumbang 80% omzet</p>}
        <ScrollTable caption={`10 produk teratas menurut ${ranking === 'omzet' ? 'omzet' : 'laba kotor'}`}>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-2 font-medium">Produk</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Terjual</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Omzet</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Laba kotor</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.productId} className="border-b border-border last:border-b-0">
                <td className="px-3 py-1">
                  <ProductNameLink productId={row.productId} name={row.name} isArchived={row.isArchived} />
                  {showPareto && pareto.contributorIds.has(row.productId) && (
                    <p className="text-xs text-muted-foreground">Penyumbang 80% omzet</p>
                  )}
                </td>
                <td className="px-3 py-1 text-right">{formatNumber(row.quantity)}</td>
                <td className="px-3 py-1 text-right">{formatRupiah(row.revenue)}</td>
                <td className="px-3 py-1 text-right">{formatRupiah(row.grossProfit)}</td>
                <td className="px-3 py-1 text-right">{row.margin === null ? '-' : `${percentFormat.format(row.margin)}%`}</td>
              </tr>
            ))}
          </tbody>
        </ScrollTable>
      </div>
    </ChartSection>
  );
}
