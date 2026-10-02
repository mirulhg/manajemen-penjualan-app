import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import type { StockStatus } from '../stock-status';

type StockFiltersProps = {
  filters: StockFiltersValue;
  categories: string[];
  hasActiveFilters: boolean;
  onChange: (patch: Partial<StockFiltersValue>) => void;
  onClear: () => void;
};

const STATUS_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'aman', label: 'Aman' },
  { value: 'menipis', label: 'Menipis' },
  { value: 'habis', label: 'Habis' },
];

const CONTROL_CLASS = 'mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-3';
const LABEL_CLASS = 'text-sm font-medium';

function parseStatus(value: string): StockStatus | null {
  return STATUS_OPTIONS.find((option) => option.value === value)?.value ?? null;
}

export function StockFilters({
  filters,
  categories,
  hasActiveFilters,
  onChange,
  onClear,
}: StockFiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="stock-search" className={LABEL_CLASS}>
          Cari barang
        </label>
        <input
          id="stock-search"
          type="search"
          placeholder="Nama atau SKU"
          value={filters.query ?? ''}
          onChange={(event) => onChange({ query: event.target.value || null })}
          className={CONTROL_CLASS}
        />
      </div>
      <div>
        <label htmlFor="stock-category" className={LABEL_CLASS}>
          Kategori
        </label>
        <select
          id="stock-category"
          value={filters.category ?? ''}
          onChange={(event) => onChange({ category: event.target.value || null })}
          className={CONTROL_CLASS}
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="stock-status" className={LABEL_CLASS}>
          Status
        </label>
        <select
          id="stock-status"
          value={filters.status ?? ''}
          onChange={(event) => onChange({ status: parseStatus(event.target.value) })}
          className={CONTROL_CLASS}
        >
          <option value="">Semua status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 rounded-md border border-border bg-surface px-4 font-medium"
          >
            Hapus filter
          </button>
        </div>
      )}
    </div>
  );
}
