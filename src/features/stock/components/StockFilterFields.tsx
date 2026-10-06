import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import { parseSort, parseStatus, SORT_OPTIONS, STATUS_OPTIONS } from './filter-options';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type StockFilterFieldsProps = {
  filters: StockFiltersValue;
  categories: string[];
  onChange: (patch: Partial<StockFiltersValue>) => void;
};

// Dipakai satu kali per layar: sebaris di desktop, di dalam Drawer di HP. Satu set id, jadi tidak bentrok.
export function StockFilterFields({ filters, categories, onChange }: StockFilterFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Label htmlFor="stock-category">Kategori</Label>
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
        <Label htmlFor="stock-status">Status</Label>
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
        <Label htmlFor="stock-sort">Urutkan</Label>
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
      <div className="flex min-h-11 items-center justify-between gap-3 md:col-span-3">
        <Label htmlFor="stock-archived">Tampilkan barang diarsipkan</Label>
        <Switch
          id="stock-archived"
          checked={filters.archived}
          onCheckedChange={(checked) => onChange({ archived: checked })}
        />
      </div>
    </div>
  );
}
