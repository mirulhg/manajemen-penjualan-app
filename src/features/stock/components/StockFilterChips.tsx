import { X } from 'lucide-react';

import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import { STATUS_OPTIONS } from './filter-options';

type StockFilterChipsProps = {
  filters: StockFiltersValue;
  onChange: (patch: Partial<StockFiltersValue>) => void;
};

type Chip = { key: string; text: string; removeLabel: string; patch: Partial<StockFiltersValue> };

function buildChips(filters: StockFiltersValue): Chip[] {
  const chips: Chip[] = [];
  if (filters.category !== null) {
    chips.push({
      key: 'kategori',
      text: filters.category,
      removeLabel: `Hapus filter Kategori: ${filters.category}`,
      patch: { category: null },
    });
  }
  if (filters.status !== null) {
    const label = STATUS_OPTIONS.find((option) => option.value === filters.status)?.label ?? filters.status;
    chips.push({ key: 'status', text: label, removeLabel: `Hapus filter Status: ${label}`, patch: { status: null } });
  }
  if (filters.archived) {
    chips.push({
      key: 'arsip',
      text: 'Termasuk diarsipkan',
      removeLabel: 'Hapus filter Barang diarsipkan',
      patch: { archived: false },
    });
  }
  return chips;
}

export function StockFilterChips({ filters, onChange }: StockFilterChipsProps) {
  const chips = buildChips(filters);
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
