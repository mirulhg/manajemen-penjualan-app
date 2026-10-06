import { ResponsiveTable } from '../../../components/ui/ResponsiveTable';
import type { TableColumn } from '../../../components/ui/ResponsiveTable';
import { formatLocalDate } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { METHOD_LABELS } from '../sales-report';
import type { SalesReport } from '../sales-report';

type SalesReportTablesProps = {
  byPaymentMethod: SalesReport['byPaymentMethod'];
  byDay: SalesReport['byDay'];
};

type MethodRow = SalesReport['byPaymentMethod'][number];
type DayRow = SalesReport['byDay'][number];

const METHOD_COLUMNS: TableColumn<MethodRow>[] = [
  { header: 'Metode', cell: (row) => METHOD_LABELS[row.method] },
  { header: 'Transaksi', cell: (row) => formatNumber(row.count) },
  { header: 'Total', cell: (row) => formatRupiah(row.total) },
  { header: 'Retur', cell: (row) => formatRupiah(row.refunds) },
  { header: 'Bersih', cell: (row) => formatRupiah(row.net) },
];

const DAY_COLUMNS: TableColumn<DayRow>[] = [
  { header: 'Tanggal', cell: (row) => formatLocalDate(row.date) },
  { header: 'Transaksi', cell: (row) => formatNumber(row.transactionCount) },
  { header: 'Omzet bersih', cell: (row) => formatRupiah(row.netRevenue) },
];

export function SalesReportTables({ byPaymentMethod, byDay }: SalesReportTablesProps) {
  return (
    <>
      <section aria-labelledby="report-method-heading" className="space-y-3">
        <h2 id="report-method-heading" className="text-lg font-semibold">
          Per metode bayar
        </h2>
        <ResponsiveTable
          caption="Penjualan per metode bayar"
          columns={METHOD_COLUMNS}
          rows={byPaymentMethod}
          getKey={(row) => row.method}
          summary={{
            title: (row) => METHOD_LABELS[row.method],
            value: (row) => formatRupiah(row.net),
            detail: (row) =>
              `${formatNumber(row.count)} transaksi · Total ${formatRupiah(row.total)} · Retur ${formatRupiah(row.refunds)}`,
          }}
        />
      </section>
      <section aria-labelledby="report-day-heading" className="space-y-3">
        <h2 id="report-day-heading" className="text-lg font-semibold">
          Per hari
        </h2>
        <ResponsiveTable
          caption="Penjualan per hari"
          columns={DAY_COLUMNS}
          rows={byDay}
          getKey={(row) => row.date}
          summary={{
            title: (row) => formatLocalDate(row.date),
            value: (row) => formatRupiah(row.netRevenue),
            detail: (row) => `${formatNumber(row.transactionCount)} transaksi`,
          }}
        />
      </section>
    </>
  );
}
