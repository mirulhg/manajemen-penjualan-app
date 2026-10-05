import { ScrollTable } from '../../../components/ui/ScrollTable';
import { formatNumber } from '../../../utils/format-number';
import { useRestockList } from '../api/use-alerts';
import { ShareRestockButton } from './ShareRestockButton';
import { AlertsSkeleton } from './AlertsSkeleton';

// Khusus pemilik: isinya informasi belanja. Pemanggil tidak merender komponen ini di Mode Kasir.
export function RestockSection() {
  const { data, isPending, error, refetch } = useRestockList();

  function handleRetry() {
    void refetch();
  }

  return (
    <section aria-labelledby="restock-heading" className="space-y-3">
      <h2 id="restock-heading" className="text-lg font-semibold">
        Daftar perlu restock
      </h2>
      {isPending && <AlertsSkeleton />}
      {error && (
        <div role="alert">
          <p className="text-muted-foreground">Daftar belanja gagal dibaca dari penyimpanan di perangkat ini.</p>
          <button type="button" onClick={handleRetry} className="mt-2 min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
            Coba lagi
          </button>
        </div>
      )}
      {data && data.length === 0 && <p className="text-muted-foreground">Tidak ada barang yang perlu dibeli.</p>}
      {data && data.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            Saran jumlah cukup untuk 14 hari ke depan dan mengangkat stok di atas batas menipis.
          </p>
          <ScrollTable caption="Barang yang perlu dibeli beserta saran jumlahnya">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-3 py-2 font-medium">Produk</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Stok</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Saran jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.productId} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.stockQuantity)}</td>
                  <td className="px-3 py-2 text-right">
                    {formatNumber(row.quantity)} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
          <ShareRestockButton items={data.map((row) => ({ name: row.name, quantity: row.quantity, unit: row.unit }))} />
        </>
      )}
    </section>
  );
}
