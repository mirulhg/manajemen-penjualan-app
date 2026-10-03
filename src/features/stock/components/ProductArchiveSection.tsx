import { formatNumber } from '../../../utils/format-number';
import { useArchiveProduct, useUnarchiveProduct } from '../api/use-archive-product';
import type { Product } from '../schema';

type ProductArchiveSectionProps = {
  product: Product;
};

const SUMMARY_CLASS = 'inline-flex min-h-11 cursor-pointer items-center font-medium text-primary';
const BUTTON_CLASS = 'min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary';

// Arsip dan pulihkan dibuka lewat <details> bawaan browser (tanpa state), dengan konfirmasi di halaman.
export function ProductArchiveSection({ product }: ProductArchiveSectionProps) {
  const archive = useArchiveProduct(product.id);
  const unarchive = useUnarchiveProduct(product.id);
  const isArchived = product.archivedAt !== null;
  const mutation = isArchived ? unarchive : archive;

  function handleConfirm() {
    mutation.mutate();
  }

  return (
    <details className="mt-4 rounded-md border border-border bg-surface px-4">
      <summary className={SUMMARY_CLASS}>{isArchived ? 'Pulihkan barang' : 'Arsipkan barang'}</summary>
      <div className="space-y-3 pb-4">
        {isArchived ? (
          <p>Barang ini akan muncul kembali di daftar stok dan bisa dijual lagi di kasir.</p>
        ) : (
          <>
            <p>
              Barang ini akan disembunyikan dari daftar stok dan tidak bisa dijual. Riwayat stok dan
              penjualannya tetap tersimpan.
            </p>
            {product.stockQuantity > 0 && (
              <p className="font-medium">
                Barang ini masih punya stok {formatNumber(product.stockQuantity)} {product.unit}.
              </p>
            )}
          </>
        )}
        {mutation.isError && (
          <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
            {mutation.error.message}
          </p>
        )}
        <button type="button" onClick={handleConfirm} disabled={mutation.isPending} className={BUTTON_CLASS}>
          {mutation.isPending
            ? 'Menyimpan…'
            : isArchived
              ? 'Ya, pulihkan'
              : 'Ya, arsipkan'}
        </button>
      </div>
    </details>
  );
}
