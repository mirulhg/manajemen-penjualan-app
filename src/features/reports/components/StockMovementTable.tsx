import { formatNumber, formatSignedNumber } from '../../../utils/format-number';
import type { MovementRow } from '../report-columns';
import { CELL, HEAD_CELL, NUMBER_CELL, NUMBER_HEAD_CELL, ROW, TABLE, TABLE_WRAPPER } from './report-table-styles';

type StockMovementTableProps = {
  rows: MovementRow[];
};

export function StockMovementTable({ rows }: StockMovementTableProps) {
  return (
    <section aria-labelledby="movement-table-heading" className="space-y-3">
      <h2 id="movement-table-heading" className="text-lg font-semibold">
        Per produk
      </h2>
      <div className={TABLE_WRAPPER}>
        <table className={TABLE}>
          <thead className="bg-card">
            <tr>
              <th scope="col" className={HEAD_CELL}>Produk</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Stok awal</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Masuk</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Terjual</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Retur/batal</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Koreksi</th>
              <th scope="col" className={NUMBER_HEAD_CELL}>Stok akhir</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className={ROW}>
                <th scope="row" className={`${CELL} text-left font-normal`}>
                  {row.name}
                  <span className="block text-xs text-muted-foreground">
                    {row.sku} · {row.category} · {row.unit}
                    {row.status === 'Diarsipkan' && ' · Diarsipkan'}
                  </span>
                </th>
                <td className={NUMBER_CELL}>{formatNumber(row.opening)}</td>
                <td className={NUMBER_CELL}>{formatNumber(row.incoming)}</td>
                <td className={NUMBER_CELL}>{formatNumber(row.sold)}</td>
                <td className={NUMBER_CELL}>{formatNumber(row.returned)}</td>
                <td className={NUMBER_CELL}>{formatSignedNumber(row.correction)}</td>
                <td className={NUMBER_CELL}>{formatNumber(row.closing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
