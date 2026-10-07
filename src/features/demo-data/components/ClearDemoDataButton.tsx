import { useClearDemoData } from '../api/use-demo-mutations';
import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';

const SUMMARY_CLASS = buttonVariants({ variant: 'outline', className: 'cursor-pointer' });

// Konfirmasi lewat <details> bawaan browser (tanpa state), seperti arsip barang dan hapus kategori.
export function ClearDemoDataButton() {
  const clear = useClearDemoData();

  function handleConfirm() {
    clear.mutate();
  }

  return (
    <details className="rounded-md border border-border bg-card px-4 py-2">
      <summary className={SUMMARY_CLASS}>Hapus data contoh</summary>
      <div className="space-y-3 py-3">
        <p className="text-sm">
          Semua barang, transaksi, dan kategori akan dihapus, termasuk yang Anda tambahkan setelah data contoh dimuat. Tindakan ini tidak bisa dibatalkan.
        </p>
        {clear.isError && (
          <Alert variant="destructive" className="p-3">
            Data contoh gagal dihapus: {clear.error.message}. Coba lagi.
          </Alert>
        )}
        <Button size="lg" type="button" variant="destructive" onClick={handleConfirm} disabled={clear.isPending}>
          {clear.isPending ? 'Menghapus…' : 'Ya, hapus semua'}
        </Button>
      </div>
    </details>
  );
}
