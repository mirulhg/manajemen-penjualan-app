import { Package } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '@/components/ui/button';

export function CashierEmptyState() {
  return (
    <EmptyState
      icon={Package}
      title="Belum ada barang yang bisa dijual"
      description="Tambahkan barang dulu, lalu kembali ke halaman kasir."
    >
      <Button asChild>
        <Link to="/stok/baru">Tambah barang</Link>
      </Button>
    </EmptyState>
  );
}
