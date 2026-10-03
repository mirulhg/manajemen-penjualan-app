import { useSession } from '../../session';
import { AddProductLink } from './AddProductLink';

export function StockEmptyState() {
  const { isCashierMode } = useSession();

  return (
    <div>
      <h2 className="text-lg font-semibold">Belum ada barang di toko ini</h2>
      <p className="mt-2 text-text-muted">Barang yang ditambahkan akan muncul di daftar ini.</p>
      {!isCashierMode && (
        <div className="mt-4">
          <AddProductLink />
        </div>
      )}
    </div>
  );
}
