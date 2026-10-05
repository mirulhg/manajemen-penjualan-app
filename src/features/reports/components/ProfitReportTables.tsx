import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { ProfitReport } from '../profit-report';
import { CELL, HEAD_CELL, NUMBER_CELL, NUMBER_HEAD_CELL, ROW, TABLE, TABLE_WRAPPER } from './report-table-styles';

type ProfitReportTablesProps = {
  byCategory: ProfitReport['byCategory'];
  byProduct: ProfitReport['byProduct'];
};

const percentFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatMargin(margin: number): string {
  return `${percentFormat.format(margin)}%`;
}

export function ProfitReportTables({ byCategory, byProduct }: ProfitReportTablesProps) {
  return (
    <>
      <section aria-labelledby="profit-category-heading" className="space-y-3">
        <h2 id="profit-category-heading" className="text-lg font-semibold">
          Per kategori
        </h2>
        <div className={TABLE_WRAPPER}>
          <table className={TABLE}>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className={HEAD_CELL}>Kategori</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Omzet</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>HPP</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Laba kotor</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((row) => (
                <tr key={row.category} className={ROW}>
                  <th scope="row" className={`${CELL} text-left font-normal`}>{row.category}</th>
                  <td className={NUMBER_CELL}>{formatRupiah(row.revenue)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.cogs)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.grossProfit)}</td>
                  <td className={NUMBER_CELL}>{formatMargin(row.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="profit-product-heading" className="space-y-3">
        <h2 id="profit-product-heading" className="text-lg font-semibold">
          Per produk
        </h2>
        <div className={TABLE_WRAPPER}>
          <table className={TABLE}>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className={HEAD_CELL}>Produk</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Terjual</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Omzet</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>HPP</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Laba kotor</th>
                <th scope="col" className={NUMBER_HEAD_CELL}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map((row) => (
                <tr key={`${row.sku}-${row.name}`} className={ROW}>
                  <th scope="row" className={`${CELL} text-left font-normal`}>
                    {row.name}
                    <span className="block text-xs text-text-muted">
                      {row.sku} · {row.category}
                      {row.status === 'Diarsipkan' && ' · Diarsipkan'}
                    </span>
                  </th>
                  <td className={NUMBER_CELL}>{formatNumber(row.quantity)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.revenue)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.cogs)}</td>
                  <td className={NUMBER_CELL}>{formatRupiah(row.grossProfit)}</td>
                  <td className={NUMBER_CELL}>{formatMargin(row.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
