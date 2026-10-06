import { useNavigate } from 'react-router';

import { SectionCard } from '../../../components/ui/SectionCard';
import { useEnterCashierMode } from '../api/use-session-mutations';
import { useSession } from '../session-context';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    <SectionCard
      id="cashier-mode-heading"
      title="Mode Kasir"
      description="Kasir hanya bisa memakai kasir dan melihat daftar stok, tanpa harga beli atau laporan. Keluar dari mode ini butuh PIN."
    >
      {!hasPin && <p id="cashier-mode-hint">Buat PIN pemilik dulu sebelum masuk Mode Kasir.</p>}
      {mutation.isError && (
        <Alert variant="destructive" className="p-3">
          {mutation.error.message}
        </Alert>
      )}
      <Button size="lg" type="button" onClick={handleEnter} disabled={!hasPin || mutation.isPending} aria-describedby={hasPin ? undefined : 'cashier-mode-hint'}>
        Masuk Mode Kasir
      </Button>
    </SectionCard>
  );
}
