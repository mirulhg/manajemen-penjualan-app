import { Link } from 'react-router';

import { useSession } from '../../session';
import { StockListContent } from './StockListContent';

export function StockListPage() {
  const { isCashierMode } = useSession();

  return (
    <section>
      <title>Stok Barang · Manajemen Stok</title>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4">
        <h1 className="text-xl font-semibold">Stok Barang</h1>
        {!isCashierMode && (
          <div className="flex gap-4">
            <Link to="/stok/impor" className="inline-flex min-h-11 items-center font-medium text-primary">
              Impor dari file
            </Link>
            <Link to="/kategori" className="inline-flex min-h-11 items-center font-medium text-primary">
              Kelola kategori
            </Link>
          </div>
        )}
      </div>
      <StockListContent />
    </section>
  );
}
