import type { SaleDetail } from '../api/get-sale-detail';
import { CancelForm } from './CancelForm';
import { ReturnForm } from './ReturnForm';

type SaleActionsProps = {
  detail: SaleDetail;
};

const SUMMARY_CLASS = 'inline-flex min-h-11 cursor-pointer items-center font-medium text-primary';

// Retur dan batal dibuka lewat <details> bawaan browser (tanpa state); tidak ada tombol hapus transaksi.
export function SaleActions({ detail }: SaleActionsProps) {
  const { sale, progress } = detail;
  if (sale.status === 'dibatalkan') return null;
  const hasReturnableItems = progress.some((entry) => entry.remaining > 0);

  return (
    <section aria-label="Tindakan transaksi" className="mt-6 space-y-4">
      <details className="rounded-md border border-border bg-card px-4">
        <summary className={SUMMARY_CLASS}>Retur barang</summary>
        <div className="pb-4">
          {hasReturnableItems ? (
            <ReturnForm saleId={sale.id} progress={progress} />
          ) : (
            <p className="text-muted-foreground">Semua barang di transaksi ini sudah diretur.</p>
          )}
        </div>
      </details>
      <details className="rounded-md border border-border bg-card px-4">
        <summary className={SUMMARY_CLASS}>Batalkan transaksi</summary>
        <div className="pb-4">
          <CancelForm saleId={sale.id} saleNumber={sale.number} />
        </div>
      </details>
    </section>
  );
}
