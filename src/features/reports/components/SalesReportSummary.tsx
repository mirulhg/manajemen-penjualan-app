import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { SalesReport } from '../sales-report';

type SalesReportSummaryProps = {
  summary: SalesReport['summary'];
};

export function SalesReportSummary({ summary }: SalesReportSummaryProps) {
  const items = [
    { label: 'Transaksi', value: formatNumber(summary.transactionCount) },
    { label: 'Penjualan kotor', value: formatRupiah(summary.grossSales) },
    { label: 'Diskon', value: formatRupiah(summary.discounts) },
    { label: 'Retur', value: formatRupiah(summary.refunds) },
    { label: 'Omzet bersih', value: formatRupiah(summary.netRevenue) },
    { label: 'Transaksi dibatalkan', value: formatNumber(summary.cancelledCount) },
  ];

  return (
    <section aria-labelledby="report-summary-heading" className="space-y-3">
      <h2 id="report-summary-heading" className="text-lg font-semibold">
        Ringkasan
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-border p-3">
            <dt className="text-sm text-text-muted">{item.label}</dt>
            <dd className="mt-1 font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-text-muted">Transaksi dibatalkan dicatat terpisah dan tidak masuk omzet.</p>
    </section>
  );
}
