import { formatLocalDate } from '../../../utils/format-date-time';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { METHOD_LABELS } from '../sales-report';
import type { SalesReport } from '../sales-report';
import { CELL, HEAD_CELL, NUMBER_CELL, NUMBER_HEAD_CELL, ROW } from './report-table-styles';

type SalesReportTablesProps = {
  byPaymentMethod: SalesReport['byPaymentMethod'];
  byDay: SalesReport['byDay'];
};


export function SalesReportTables({ byPaymentMethod, byDay }: SalesReportTablesProps) {
  return (
    <>
      <section aria-labelledby="report-method-heading" className="space-y-3">
        <h2 id="report-method-heading" className="text-lg font-semibold">
          Per metode bayar
        </h2>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-card">
              <tr>
                <th scope="col" className={HEAD_CELL}>Metode</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Transaksi</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Total</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Retur</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Bersih</th>
              </tr>
            </thead>
            <tbody>
              {byPaymentMethod.map((row) => (
                <tr key={row.method} className={ROW}>
                  <th scope="row" className={`${CELL} text-left font-normal`}>{METHOD_LABELS[row.method]}</th>
                  <td className={NUMBER_CELL}>{formatNumber(row.count)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.total)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.refunds)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="report-day-heading" className="space-y-3">
        <h2 id="report-day-heading" className="text-lg font-semibold">
          Per hari
        </h2>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-card">
              <tr>
                <th scope="col" className={HEAD_CELL}>Tanggal</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Transaksi</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Omzet bersih</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((row) => (
                <tr key={row.date} className={ROW}>
                  <th scope="row" className={`${CELL} text-left font-normal`}>{formatLocalDate(row.date)}</th>
                  <td className={NUMBER_CELL}>{formatNumber(row.transactionCount)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.netRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
