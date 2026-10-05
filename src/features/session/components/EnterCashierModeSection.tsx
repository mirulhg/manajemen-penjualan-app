import { useNavigate } from 'react-router';

import { useEnterCashierMode } from '../api/use-session-mutations';
import { useSession } from '../session-context';
import { Alert } from '@/components/ui/alert';

export function EnterCashierModeSection() {
  const { hasPin } = useSession();
  const navigate = useNavigate();
  const mutation = useEnterCashierMode();

  async function enter() {
    try {
      await mutation.mutateAsync();
      void navigate('/kasir');
    } catch {
      // Kegagalan ditampilkan lewat mutation.isError di bawah.
    }
  }

  function handleEnter() {
    void enter();
  }

  return (
    <section aria-labelledby="cashier-mode-heading" className="space-y-3">
      <h2 id="cashier-mode-heading" className="text-lg font-semibold">
        Mode Kasir
      </h2>
      <p className="text-sm text-muted-foreground">
        Kasir hanya bisa memakai kasir dan melihat daftar stok, tanpa harga beli atau laporan. Keluar dari mode ini
        butuh PIN.
      </p>
      {!hasPin && <p id="cashier-mode-hint">Buat PIN pemilik dulu sebelum masuk Mode Kasir.</p>}
      {mutation.isError && (
        <Alert variant="destructive" className="p-3">
          {mutation.error.message}
        </Alert>
      )}
      <button
        type="button"
        onClick={handleEnter}
        disabled={!hasPin || mutation.isPending}
        aria-describedby={hasPin ? undefined : 'cashier-mode-hint'}
        className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
      >
        Masuk Mode Kasir
      </button>
    </section>
  );
}
