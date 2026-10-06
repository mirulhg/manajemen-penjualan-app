import { ResponsiveTable } from '../../../components/ui/ResponsiveTable';
import type { TableColumn } from '../../../components/ui/ResponsiveTable';
import { formatNumber, formatSignedNumber } from '../../../utils/format-number';
import type { MovementRow } from '../report-columns';

type StockMovementTableProps = {
  rows: MovementRow[];
};

const COLUMNS: TableColumn<MovementRow>[] = [
  {
    header: 'Produk',
    cell: (row) => (
      <>
        {row.name}
        <span className="block text-xs text-muted-foreground">
          {row.sku} · {row.category} · {row.unit}
          {row.status === 'Diarsipkan' && ' · Diarsipkan'}
        </span>
      </>
    ),
  },
  { header: 'Stok awal', cell: (row) => formatNumber(row.opening) },
  { header: 'Masuk', cell: (row) => formatNumber(row.incoming) },
  { header: 'Terjual', cell: (row) => formatNumber(row.sold) },
  { header: 'Retur/batal', cell: (row) => formatNumber(row.returned) },
  { header: 'Koreksi', cell: (row) => formatSignedNumber(row.correction) },
  { header: 'Stok akhir', cell: (row) => formatNumber(row.closing) },
];

export function StockMovementTable({ rows }: StockMovementTableProps) {
  return (
    <section aria-labelledby="movement-table-heading" className="space-y-3">
      <h2 id="movement-table-heading" className="text-lg font-semibold">
        Per produk
      </h2>
      <ResponsiveTable
        caption="Pergerakan stok per produk"
        columns={COLUMNS}
        rows={rows}
        getKey={(row) => row.sku}
        summary={{
          title: (row) => row.name,
          value: (row) => `${formatNumber(row.closing)} ${row.unit}`,
          detail: (row) =>
            `Awal ${formatNumber(row.opening)} · Masuk ${formatNumber(row.incoming)} · Terjual ${formatNumber(row.sold)} · Retur/batal ${formatNumber(row.returned)} · Koreksi ${formatSignedNumber(row.correction)}${row.status === 'Diarsipkan' ? ' · Diarsipkan' : ''}`,
        }}
      />
    </section>
  );
}
