import { ResponsiveTable } from '../../../components/ui/ResponsiveTable';
import type { TableColumn } from '../../../components/ui/ResponsiveTable';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { ProfitReport } from '../profit-report';

type ProfitReportTablesProps = {
  byCategory: ProfitReport['byCategory'];
  byProduct: ProfitReport['byProduct'];
};

type CategoryRow = ProfitReport['byCategory'][number];
type ProductRow = ProfitReport['byProduct'][number];

const percentFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatMargin(margin: number): string {
  return `${percentFormat.format(margin)}%`;
}

function ProductName({ row }: { row: ProductRow }) {
  return (
    <>
      {row.name}
      <span className="block text-xs text-muted-foreground">
        {row.sku} · {row.category}
        {row.status === 'Diarsipkan' && ' · Diarsipkan'}
      </span>
    </>
  );
}

const CATEGORY_COLUMNS: TableColumn<CategoryRow>[] = [
  { header: 'Kategori', cell: (row) => row.category },
  { header: 'Omzet', cell: (row) => formatRupiah(row.revenue) },
  { header: 'HPP', cell: (row) => formatRupiah(row.cogs) },
  { header: 'Laba kotor', cell: (row) => formatRupiah(row.grossProfit) },
  { header: 'Margin', cell: (row) => formatMargin(row.margin) },
];

const PRODUCT_COLUMNS: TableColumn<ProductRow>[] = [
  { header: 'Produk', cell: (row) => <ProductName row={row} /> },
  { header: 'Terjual', cell: (row) => formatNumber(row.quantity) },
  { header: 'Omzet', cell: (row) => formatRupiah(row.revenue) },
  { header: 'HPP', cell: (row) => formatRupiah(row.cogs) },
  { header: 'Laba kotor', cell: (row) => formatRupiah(row.grossProfit) },
  { header: 'Margin', cell: (row) => formatMargin(row.margin) },
];

export function ProfitReportTables({ byCategory, byProduct }: ProfitReportTablesProps) {
  return (
    <>
      <section aria-labelledby="profit-category-heading" className="space-y-3">
        <h2 id="profit-category-heading" className="text-lg font-semibold">
          Per kategori
        </h2>
        <ResponsiveTable
          caption="Laba kotor per kategori"
          columns={CATEGORY_COLUMNS}
          rows={byCategory}
          getKey={(row) => row.category}
          summary={{
            title: (row) => row.category,
            value: (row) => formatRupiah(row.grossProfit),
            detail: (row) =>
              `Omzet ${formatRupiah(row.revenue)} · HPP ${formatRupiah(row.cogs)} · Margin ${formatMargin(row.margin)}`,
          }}
        />
      </section>
      <section aria-labelledby="profit-product-heading" className="space-y-3">
        <h2 id="profit-product-heading" className="text-lg font-semibold">
          Per produk
        </h2>
        <ResponsiveTable
          caption="Laba kotor per produk"
          columns={PRODUCT_COLUMNS}
          rows={byProduct}
          getKey={(row) => `${row.sku}-${row.name}`}
          summary={{
            title: (row) => row.name,
            value: (row) => formatRupiah(row.grossProfit),
            detail: (row) =>
              `Omzet ${formatRupiah(row.revenue)} · HPP ${formatRupiah(row.cogs)} · ${formatNumber(row.quantity)} terjual${row.status === 'Diarsipkan' ? ' · Diarsipkan' : ''}`,
          }}
        />
      </section>
    </>
  );
}
