import { ReceiptText } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '../../../components/ui/EmptyState';
import { PAYMENT_METHOD_OPTIONS } from '../payment-method-options';
import type { SaleFilters } from '../sale-filters';
import { Button } from '@/components/ui/button';

type SaleHistoryEmptyProps = {
  filters: SaleFilters;
  onClearFilters: () => void;
};

// Periode bukan "filter yang bisa dihapus"; hanya metode bayar dan kasir. Bila salah satunya aktif, pesan menyebutnya.
export function SaleHistoryEmpty({ filters, onClearFilters }: SaleHistoryEmptyProps) {
  const methodLabel = PAYMENT_METHOD_OPTIONS.find((method) => method.value === filters.method)?.label;
  const qualifiers = [methodLabel, filters.actor !== null ? `oleh ${filters.actor}` : undefined].filter(
    (text) => text !== undefined,
  );

  if (qualifiers.length > 0) {
    return (
      <EmptyState icon={ReceiptText} title={`Tidak ada transaksi ${qualifiers.join(' ')} di periode ini`}>
        <Button variant="outline" type="button" onClick={onClearFilters}>
          Hapus filter
        </Button>
      </EmptyState>
    );
  }

  return (
    <EmptyState icon={ReceiptText} title="Belum ada transaksi di periode ini">
      <Button asChild>
        <Link to="/kasir">Buka kasir</Link>
      </Button>
    </EmptyState>
  );
}
