import { getEnv } from '../../../lib/env';
import { useDemoState } from '../api/use-demo-state';
import { useLoadDemoData } from '../api/use-demo-mutations';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function LoadDemoDataButton() {
  const { data: state } = useDemoState();
  const load = useLoadDemoData();
  const isAvailable = state?.isEmpty === true;
  // Mode demo (VITE_DEMO): tombol disorot supaya penonton langsung melihat cara mengisi aplikasi.
  const variant = getEnv().VITE_DEMO ? 'accent' : 'outline';

  function handleLoad() {
    load.mutate();
  }

  return (
    <div className="space-y-2">
      <Button size="lg" type="button" variant={variant} onClick={handleLoad} disabled={!isAvailable || load.isPending} aria-describedby="demo-load-hint">
        {load.isPending ? 'Memuat…' : 'Muat data contoh'}
      </Button>
      {!isAvailable && state !== undefined && (
        <p id="demo-load-hint" className="text-sm text-muted-foreground">
          Hanya bisa dimuat saat belum ada barang dan transaksi.
        </p>
      )}
      {load.isError && (
        <Alert variant="destructive" className="p-3">
          Data contoh gagal dimuat: {load.error.message}. Coba lagi; jika masih gagal, muat ulang halaman.
        </Alert>
      )}
    </div>
  );
}
