import { formatLocalDate } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { StockReportError } from '../api/get-stock-report';
import { useStockReport } from '../api/use-stock-report';
import { ReportBody } from './ReportBody';
import { ReportError } from './ReportError';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportSummary } from './ReportSummary';
import { StockReportTable } from './StockReportTable';

type StockReportContentProps = {
  date: string;
};

export function StockReportContent({ date }: StockReportContentProps) {
  const { data, isPending, error, refetch } = useStockReport(date);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <ReportSkeleton />;
  if (error instanceof StockReportError) {
    return (
      <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text print:hidden">
        {error.message}
      </p>
    );
  }
  if (error) return <ReportError error={error} onRetry={handleRetry} />;

  const { summary } = data;

  return (
    <ReportBody intro={`Posisi stok pada akhir hari ${formatLocalDate(date)}.`}>
      {data.rows.length === 0 && <p role="status">Belum ada barang pada tanggal ini.</p>}
      <ReportSummary
        items={[
          { label: 'Jenis barang', value: formatNumber(summary.productCount) },
          { label: 'Total unit', value: formatNumber(summary.totalUnits) },
          { label: 'Nilai persediaan', value: formatRupiah(summary.totalValue) },
          {
            label: 'Barang aktif',
            value: `${formatNumber(summary.active.productCount)} jenis · ${formatNumber(summary.active.totalUnits)} unit · ${formatRupiah(summary.active.totalValue)}`,
          },
        ]}
        note="Nilai persediaan = stok × harga beli pada tanggal itu. Stok minus tidak dihitung nilainya."
      />
      <StockReportTable rows={data.rows} />
    </ReportBody>
  );
}
