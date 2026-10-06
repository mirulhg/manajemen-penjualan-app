import { CreateSaleError } from '../api/create-sale';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type SubmitSectionProps = {
  blockReason: string | null;
  // Uang kurang sudah dijelaskan di bawah kolom Uang diterima; di sini tidak diulang.
  isBlockedByCash: boolean;
  isPending: boolean;
  error: Error | null;
};

function SaleErrorMessage({ error }: { error: Error }) {
  if (error instanceof CreateSaleError && error.code === 'INSUFFICIENT_STOCK') {
    return (
      <Alert variant="destructive" className="p-3">
        <p>Stok tidak cukup untuk:</p>
        <ul className="list-disc pl-5">
          {error.shortages.map((shortage) => (
            <li key={shortage.productName}>
              {shortage.productName}: diminta {shortage.requested}, tersedia {shortage.available}
            </li>
          ))}
        </ul>
      </Alert>
    );
  }
  if (error instanceof CreateSaleError && error.code === 'TOTAL_CHANGED') {
    return (
      <Alert variant="destructive" className="p-3">
        Harga barang berubah. Periksa total lalu simpan lagi.
      </Alert>
    );
  }
  if (error instanceof CreateSaleError && error.code === 'PRODUCT_ARCHIVED') {
    return (
      <Alert variant="destructive" className="p-3">
        {error.message}
      </Alert>
    );
  }
  return (
    <Alert variant="destructive" className="p-3">
      Transaksi tidak tersimpan. Isian dan keranjang Anda masih ada; periksa lalu coba simpan lagi.
    </Alert>
  );
}

export function SubmitSection({ blockReason, isBlockedByCash, isPending, error }: SubmitSectionProps) {
  return (
    <div className="space-y-3">
      {error && (
        <div className="enter-fade">
          <SaleErrorMessage error={error} />
        </div>
      )}
      {blockReason && !isBlockedByCash && !isPending && <p className="text-muted-foreground">{blockReason}</p>}
      {/* data-autofocus: tujuan fokus saat Drawer dibuka untuk metode non-tunai (kolom uang tidak ada). */}
      <Button
        size="lg"
        className="w-full text-lg"
        type="submit"
        data-autofocus
        disabled={blockReason !== null || isPending}
      >
        {isPending ? 'Menyimpan…' : 'Simpan transaksi'}
      </Button>
    </div>
  );
}
