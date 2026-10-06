import { FilterChips } from '@/components/ui/FilterChips';
import type { FilterChip } from '@/components/ui/FilterChips';
import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import { STATUS_OPTIONS } from './filter-options';

type StockFilterChipsProps = {
  filters: StockFiltersValue;
  onChange: (patch: Partial<StockFiltersValue>) => void;
};

type Chip = FilterChip<Partial<StockFiltersValue>>;

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
  return <FilterChips chips={buildChips(filters)} onRemove={onChange} />;
}
