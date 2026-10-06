import { SearchX } from 'lucide-react';

import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '@/components/ui/button';

type StockNoResultsProps = {
  query: string | null;
  onClear: () => void;
};

export function StockNoResults({ query, onClear }: StockNoResultsProps) {
  return (
    <EmptyState
      icon={SearchX}
      title="Tidak ada barang yang cocok dengan filter"
      description={
        query
          ? `Tidak ada barang untuk kata kunci “${query.trim()}” dengan filter yang dipilih.`
          : 'Ubah atau hapus filter untuk melihat barang lain.'
      }
    >
      <Button variant="outline" type="button" onClick={onClear}>
        Hapus filter
      </Button>
    </EmptyState>
  );
}
