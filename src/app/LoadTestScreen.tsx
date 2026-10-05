import { formatNumber } from '../utils/format-number';

export type LoadTestState =
  | { phase: 'running'; done: number; total: number }
  | { phase: 'done'; productCount: number; saleCount: number; seconds: number }
  | { phase: 'skipped' }
  | { phase: 'failed'; message: string };

type LoadTestScreenProps = {
  state: LoadTestState;
  // Menjelaskan flag lain yang diabaikan selama uji beban.
  notice: string | null;
  onContinue: () => void;
};

// Khusus development: progres uji beban tampil di layar (bukan console) dan hasilnya tetap terlihat sampai dilanjutkan.
export function LoadTestScreen({ state, notice, onContinue }: LoadTestScreenProps) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <title>Uji Beban · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Uji beban (database manajemen-stok-uji-beban)</h1>
      {notice && <p className="rounded-md border border-border bg-card p-3">{notice}</p>}
      {state.phase === 'running' && (
        <p role="status">
          Membuat data uji: {formatNumber(state.done)} dari {formatNumber(state.total)} transaksi. Jangan tutup tab ini.
        </p>
      )}
      {state.phase === 'skipped' && <p role="status">Database uji beban sudah berisi data, jadi seed dilewati.</p>}
      {state.phase === 'done' && (
        <p role="status">
          Selesai: {formatNumber(state.productCount)} barang dan {formatNumber(state.saleCount)} transaksi dibuat dalam{' '}
          {state.seconds.toFixed(1)} detik.
        </p>
      )}
      {state.phase === 'failed' && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Seed uji beban gagal: {state.message}. Hapus database "manajemen-stok-uji-beban" di DevTools (Application,
          IndexedDB), lalu muat ulang halaman.
        </p>
      )}
      {state.phase !== 'running' && (
        <button type="button" onClick={onContinue} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
          Buka aplikasi
        </button>
      )}
    </main>
  );
}
