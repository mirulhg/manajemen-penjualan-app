import { FilterChips } from '@/components/ui/FilterChips';
import { PAYMENT_METHOD_OPTIONS } from '../payment-method-options';
import type { SaleFilters } from '../sale-filters';

type SaleFilterChipsProps = {
  filters: SaleFilters;
  onChange: (patch: Partial<SaleFilters>) => void;
};

export function SaleFilterChips({ filters, onChange }: SaleFilterChipsProps) {
  const methodLabel = PAYMENT_METHOD_OPTIONS.find((method) => method.value === filters.method)?.label;
  const chips = [
    methodLabel !== undefined && {
      key: 'metode',
      text: methodLabel,
      removeLabel: `Hapus filter Metode bayar: ${methodLabel}`,
      patch: { method: null },
    },
    filters.actor !== null && {
      key: 'kasir',
      text: filters.actor,
      removeLabel: `Hapus filter Kasir: ${filters.actor}`,
      patch: { actor: null },
    },
  ].filter((chip) => chip !== false);

  return <FilterChips chips={chips} onRemove={onChange} />;
}
