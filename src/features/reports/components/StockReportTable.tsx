import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { StockRow } from '../report-columns';
import { CELL, HEAD_CELL, NUMBER_CELL, NUMBER_HEAD_CELL, ROW, TABLE, TABLE_WRAPPER } from './report-table-styles';

type StockReportTableProps = {
  rows: StockRow[];
};

export function StockReportTable({ rows }: StockReportTableProps) {
  return (
    <section aria-labelledby="stock-report-heading" className="space-y-3">
      <h2 id="stock-report-heading" className="text-lg font-semibold">
        Per produk
      </h2>
      <div className={TABLE_WRAPPER}>
        <table className={TABLE}>
          <thead className="bg-surface">
            <tr>
              <th scope="col" className={HEAD_CELL}>Produk</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Stok</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Harga beli</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className={ROW}>
                <th scope="row" className={`${CELL} text-left font-normal`}>
                  {row.name}
                  <span className="block text-xs text-text-muted">
                    {row.sku} · {row.category}
                    {row.status === 'Diarsipkan' && ' · Diarsipkan'}
                  </span>
                </th>
                <td className={NUMBER_CELL}>
                  {formatNumber(row.quantity)} {row.unit}
                </td>
                <td className={NUMBER_CELL}>{formatRupiah(row.purchasePrice)}</td>
                <td className={NUMBER_CELL}>{formatRupiah(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
