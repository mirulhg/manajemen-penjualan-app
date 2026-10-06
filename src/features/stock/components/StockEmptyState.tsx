import { Package } from 'lucide-react';

import { EmptyState } from '../../../components/ui/EmptyState';
import { useSession } from '../../session';
import { AddProductLink } from './AddProductLink';

export function StockEmptyState() {
  const { isCashierMode } = useSession();

  return (
    <EmptyState icon={Package} title="Belum ada barang di toko ini" description="Barang yang ditambahkan akan muncul di daftar ini.">
      {!isCashierMode && <AddProductLink />}
    </EmptyState>
  );
}
