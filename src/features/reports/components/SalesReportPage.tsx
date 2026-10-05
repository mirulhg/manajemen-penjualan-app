import { Link } from 'react-router';

import { PeriodFilter } from '../../../components/ui/PeriodFilter';
import { REPORT_PERIODS, useReportPeriod } from '../hooks/use-report-period';
import { ReportActions } from './ReportActions';
import { SalesReportContent } from './SalesReportContent';
import { StoreLetterhead } from './StoreLetterhead';

export function SalesReportPage() {
  const { selection, setSelection } = useReportPeriod();

  return (
    <section className="space-y-6">
      <title>Laporan Penjualan · Manajemen Stok</title>
      <div className="space-y-4 print:hidden">
        <Link to="/laporan" className="inline-flex min-h-11 items-center font-medium text-primary">
          Kembali ke daftar laporan
        </Link>
        <PeriodFilter selection={selection} periods={REPORT_PERIODS} onChange={setSelection} />
        <ReportActions selection={selection} />
      </div>
      <article className="space-y-6">
        <StoreLetterhead />
        <h1 className="text-xl font-semibold">Laporan Penjualan</h1>
        <SalesReportContent selection={selection} />
      </article>
    </section>
  );
}
