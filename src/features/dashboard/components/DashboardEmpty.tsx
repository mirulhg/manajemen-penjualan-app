import { ChartColumn } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '@/components/ui/button';

export function DashboardEmpty() {
  return (
    <EmptyState
      icon={ChartColumn}
      title="Belum ada penjualan"
      description="Dasbor terisi setelah ada transaksi pertama. Catat penjualan di Kasir."
    >
      <Button asChild variant="outline">
        <Link to="/kasir">Buka Kasir</Link>
      </Button>
    </EmptyState>
  );
}
