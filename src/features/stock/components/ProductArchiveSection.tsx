import { formatNumber } from '../../../utils/format-number';
import { useArchiveProduct, useUnarchiveProduct } from '../api/use-archive-product';
import type { Product } from '../schema';
import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';

type ProductArchiveSectionProps = {
  product: Product;
};

const SUMMARY_CLASS = buttonVariants({ variant: 'outline', className: 'cursor-pointer' });

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
    <details className="mt-4 rounded-md border border-border bg-card px-4">
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
          <Alert variant="destructive" className="p-3">
            {mutation.error.message}
          </Alert>
        )}
        <Button type="button" size="lg" onClick={handleConfirm} disabled={mutation.isPending}>
          {mutation.isPending
            ? 'Menyimpan…'
            : isArchived
              ? 'Ya, pulihkan'
              : 'Ya, arsipkan'}
        </Button>
      </div>
    </details>
  );
}
