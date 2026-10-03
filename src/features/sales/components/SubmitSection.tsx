import { CreateSaleError } from '../api/create-sale';

type SubmitSectionProps = {
  blockReason: string | null;
  isPending: boolean;
  error: Error | null;
};

function SaleErrorMessage({ error }: { error: Error }) {
  if (error instanceof CreateSaleError && error.code === 'INSUFFICIENT_STOCK') {
    return (
      <div role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
        <p>Stok tidak cukup untuk:</p>
        <ul className="list-disc pl-5">
          {error.shortages.map((shortage) => (
            <li key={shortage.productName}>
              {shortage.productName}: diminta {shortage.requested}, tersedia {shortage.available}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (error instanceof CreateSaleError && error.code === 'TOTAL_CHANGED') {
    return (
      <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
        Harga barang berubah. Periksa total lalu simpan lagi.
      </p>
    );
  }
  return (
    <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
      Transaksi tidak tersimpan. Isian dan keranjang Anda masih ada; periksa lalu coba simpan lagi.
    </p>
  );
}

export function SubmitSection({ blockReason, isPending, error }: SubmitSectionProps) {
  return (
    <div className="space-y-3">
      {error && <SaleErrorMessage error={error} />}
      {blockReason && !isPending && <p className="text-text-muted">{blockReason}</p>}
      <button
        type="submit"
        disabled={blockReason !== null || isPending}
        className="min-h-12 w-full rounded-md bg-primary px-4 text-lg font-medium text-on-primary"
      >
        {isPending ? 'Menyimpan…' : 'Simpan transaksi'}
      </button>
    </div>
  );
}
