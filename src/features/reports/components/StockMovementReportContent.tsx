import type { PeriodSelection } from '../../../utils/date-period';
import { formatNumber, formatSignedNumber } from '../../../utils/format-number';
import { getReportRange } from '../api/read-report-sales';
import { useStockMovementReport } from '../api/use-stock-movement-report';
import { useShowAll } from '../hooks/use-show-all';
import { describeReportPeriod } from '../report-period-text';
import { ReportBody } from './ReportBody';
import { ReportError } from './ReportError';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportSummary } from './ReportSummary';
import { StockMovementTable } from './StockMovementTable';

type StockMovementReportContentProps = {
  selection: PeriodSelection;
};

export function StockMovementReportContent({ selection }: StockMovementReportContentProps) {
  const { data, isPending, error, refetch } = useStockMovementReport(selection);
  const { showAll, setShowAll } = useShowAll();

  function handleRetry() {
    void refetch();
  }

  function handleToggleAll() {
    setShowAll(!showAll);
  }

  if (isPending) return <ReportSkeleton />;
  if (error) return <ReportError error={error} onRetry={handleRetry} />;

  const { summary } = data;
  // Tabel hanya memuat barang yang bergerak; ringkasan dan ekspor tetap menghitung semua barang.
  const shownRows = showAll ? data.rows : data.rows.filter((row) => data.movedSkus.has(row.sku));
  const hiddenCount = data.rows.length - shownRows.length;

  return (
    <ReportBody intro={describeReportPeriod(getReportRange(selection, new Date()))}>
      {data.rows.length === 0 && <p role="status">Belum ada barang pada periode ini.</p>}
      <ReportSummary
        items={[
          { label: 'Stok awal', value: formatNumber(summary.opening) },
          { label: 'Masuk', value: formatNumber(summary.incoming) },
          { label: 'Terjual', value: formatNumber(summary.sold) },
          { label: 'Retur/batal', value: formatNumber(summary.returned) },
          { label: 'Koreksi', value: formatSignedNumber(summary.correction) },
          { label: 'Stok akhir', value: formatNumber(summary.closing) },
          { label: 'Barang bergerak', value: `${formatNumber(summary.movedCount)} dari ${formatNumber(summary.productCount)}` },
        ]}
        note="Terjual dihitung pada tanggal barang keluar. Retur dan pembatalan dihitung pada tanggal barang kembali, jadi bisa berbeda dengan jumlah terjual di laporan laba kotor."
      />
      {shownRows.length === 0 && data.rows.length > 0 && <p role="status">Tidak ada barang yang bergerak di periode ini.</p>}
      {shownRows.length > 0 && <StockMovementTable rows={shownRows} />}
      {(hiddenCount > 0 || showAll) && (
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          {hiddenCount > 0 && <p className="text-sm text-muted-foreground">{formatNumber(hiddenCount)} barang tanpa pergerakan disembunyikan.</p>}
          <button type="button" onClick={handleToggleAll} className="min-h-11 rounded-md border border-border bg-card px-4 font-medium">
            {showAll ? 'Hanya yang bergerak' : 'Tampilkan semua'}
          </button>
        </div>
      )}
      {hiddenCount > 0 && (
        <p className="hidden text-sm print:block">{formatNumber(hiddenCount)} barang tanpa pergerakan tidak dicetak.</p>
      )}
    </ReportBody>
  );
}
