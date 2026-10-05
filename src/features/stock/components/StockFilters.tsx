import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import type { StockSort } from '../sort-products';
import type { StockStatus } from '../stock-status';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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

const SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: 'nama', label: 'Nama A–Z' },
  { value: 'stok-sedikit', label: 'Stok paling sedikit' },
  { value: 'stok-banyak', label: 'Stok paling banyak' },
  { value: 'terbaru', label: 'Terakhir diperbarui' },
];

function parseSort(value: string): StockSort {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? 'nama';
}

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
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <Label htmlFor="stock-search">
          Cari barang
        </Label>
        <Input
          id="stock-search"
          type="search"
          placeholder="Nama atau SKU"
          value={filters.query ?? ''}
          onChange={(event) => onChange({ query: event.target.value || null })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="stock-category">
          Kategori
        </Label>
        <select
          id="stock-category"
          value={filters.category ?? ''}
          onChange={(event) => onChange({ category: event.target.value || null })}
          className={FIELD_CLASS}
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
        <Label htmlFor="stock-status">
          Status
        </Label>
        <select
          id="stock-status"
          value={filters.status ?? ''}
          onChange={(event) => onChange({ status: parseStatus(event.target.value) })}
          className={FIELD_CLASS}
        >
          <option value="">Semua status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="stock-sort">
          Urutkan
        </Label>
        <select
          id="stock-sort"
          value={filters.sort}
          onChange={(event) => onChange({ sort: parseSort(event.target.value) })}
          className={FIELD_CLASS}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-3">
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={filters.archived}
            onChange={(event) => onChange({ archived: event.target.checked })}
          />
          Tampilkan barang diarsipkan
        </label>
      </div>
      {hasActiveFilters && (
        <div className="sm:col-span-3">
          <Button variant="outline" type="button" onClick={onClear}>
            Hapus filter
          </Button>
        </div>
      )}
    </div>
  );
}
