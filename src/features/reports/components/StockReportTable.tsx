import { ResponsiveTable } from '../../../components/ui/ResponsiveTable';
import type { TableColumn } from '../../../components/ui/ResponsiveTable';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { StockRow } from '../report-columns';

type StockReportTableProps = {
  rows: StockRow[];
};

const COLUMNS: TableColumn<StockRow>[] = [
  {
    header: 'Produk',
    cell: (row) => (
      <>
        {row.name}
        <span className="block text-xs text-muted-foreground">
          {row.sku} · {row.category}
          {row.status === 'Diarsipkan' && ' · Diarsipkan'}
        </span>
      </>
    ),
  },
  { header: 'Stok', cell: (row) => `${formatNumber(row.quantity)} ${row.unit}` },
  { header: 'Harga beli', cell: (row) => formatRupiah(row.purchasePrice) },
  { header: 'Nilai', cell: (row) => formatRupiah(row.value) },
];

export function StockReportTable({ rows }: StockReportTableProps) {
  return (
    <section aria-labelledby="stock-report-heading" className="space-y-3">
      <h2 id="stock-report-heading" className="text-lg font-semibold">
        Per produk
      </h2>
      <ResponsiveTable
        caption="Posisi stok per produk"
        columns={COLUMNS}
        rows={rows}
        getKey={(row) => row.sku}
        summary={{
          title: (row) => row.name,
          value: (row) => formatRupiah(row.value),
          detail: (row) =>
            `${formatNumber(row.quantity)} ${row.unit} · Harga beli ${formatRupiah(row.purchasePrice)}${row.status === 'Diarsipkan' ? ' · Diarsipkan' : ''}`,
        }}
      />
    </section>
  );
}
