import { X } from 'lucide-react';

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

  if (chips.length === 0) return null;

  return (
    <ul aria-label="Filter aktif" className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            aria-label={chip.removeLabel}
            onClick={() => onChange(chip.patch)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-secondary pl-4 pr-3 text-sm font-medium hover:bg-muted"
          >
            {chip.text}
            <X aria-hidden="true" className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
