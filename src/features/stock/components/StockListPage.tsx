import { Tags, Upload } from 'lucide-react';
import { Link } from 'react-router';

import { useSession } from '../../session';
import { AddProductLink } from './AddProductLink';
import { StockListContent } from './StockListContent';
import { Button } from '@/components/ui/button';

export function StockListPage() {
  const { isCashierMode } = useSession();

  return (
    <section>
      <title>Stok Barang · Manajemen Stok</title>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Stok Barang</h1>
        {!isCashierMode && (
          <div className="flex flex-wrap items-center gap-1">
            <Button asChild variant="ghost">
              <Link to="/stok/impor">
                <Upload aria-hidden="true" />
                Impor
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/kategori">
                <Tags aria-hidden="true" />
                Kategori
              </Link>
            </Button>
            <AddProductLink />
          </div>
        )}
      </div>
      <StockListContent />
    </section>
  );
}
