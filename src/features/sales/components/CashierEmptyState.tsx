import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function CashierEmptyState() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Belum ada barang yang bisa dijual</h2>
      <p className="mt-2 text-muted-foreground">Tambahkan barang dulu, lalu kembali ke halaman kasir.</p>
      <Button asChild size="lg" className="mt-4"><Link to="/stok/baru">
        Tambah barang
      </Link></Button>
    </div>
  );
}
