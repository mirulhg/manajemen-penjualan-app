import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function DashboardEmpty() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Belum ada penjualan</h2>
      <p className="mt-2 text-muted-foreground">Dasbor terisi setelah ada transaksi pertama. Catat penjualan di Kasir.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/kasir">
        Buka Kasir
      </Link></Button>
    </div>
  );
}
