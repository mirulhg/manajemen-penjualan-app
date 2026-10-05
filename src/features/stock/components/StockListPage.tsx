import { Link } from 'react-router';

import { useSession } from '../../session';
import { StockListContent } from './StockListContent';
import { Button } from '@/components/ui/button';

export function StockListPage() {
  const { isCashierMode } = useSession();

  return (
    <section>
      <title>Stok Barang · Manajemen Stok</title>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4">
        <h1 className="text-xl font-semibold">Stok Barang</h1>
        {!isCashierMode && (
          <div className="flex gap-4">
            <Button asChild variant="outline"><Link to="/stok/impor">
              Impor dari file
            </Link></Button>
            <Button asChild variant="outline"><Link to="/kategori">
              Kelola kategori
            </Link></Button>
          </div>
        )}
      </div>
      <StockListContent />
    </section>
  );
}
