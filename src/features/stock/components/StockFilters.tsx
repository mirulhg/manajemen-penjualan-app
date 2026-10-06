import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { useMediaQuery } from '../../../hooks/use-media-query';
import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import { StockFilterChips } from './StockFilterChips';
import { StockFilterDrawer } from './StockFilterDrawer';
import { StockFilterFields } from './StockFilterFields';
import { StockSearchField } from './StockSearchField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type StockFiltersProps = {
  filters: StockFiltersValue;
  categories: string[];
  hasActiveFilters: boolean;
  onChange: (patch: Partial<StockFiltersValue>) => void;
  onClear: () => void;
};

// Sama dengan breakpoint `md` Tailwind: di atasnya filter sebaris, di bawahnya lewat Drawer.
const INLINE_QUERY = '(min-width: 48rem)';

export function StockFilters({ filters, categories, hasActiveFilters, onChange, onClear }: StockFiltersProps) {
  const isInline = useMediaQuery(INLINE_QUERY);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Kata kunci tampil di kolom cari dan urutan bukan filter, jadi keduanya tidak dihitung.
  const activeCount = [filters.category !== null, filters.status !== null, filters.archived].filter(Boolean).length;

  function handleSearchChange(value: string) {
    onChange({ query: value || null });
  }

  function handleOpenDrawer() {
    setIsDrawerOpen(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <StockSearchField value={filters.query ?? ''} onChange={handleSearchChange} />
        </div>
        {!isInline && (
          <Button type="button" variant="outline" onClick={handleOpenDrawer}>
            <SlidersHorizontal aria-hidden="true" />
            Filter
            {activeCount > 0 && <Badge variant="accent">{activeCount}</Badge>}
          </Button>
        )}
      </div>
      {isInline ? (
        <>
          <StockFilterFields filters={filters} categories={categories} onChange={onChange} />
          {hasActiveFilters && (
            <Button variant="outline" type="button" onClick={onClear}>
              Hapus filter
            </Button>
          )}
        </>
      ) : (
        <>
          <StockFilterChips filters={filters} onChange={onChange} />
          <StockFilterDrawer
            isOpen={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            filters={filters}
            categories={categories}
            onChange={onChange}
            onClear={hasActiveFilters ? onClear : null}
          />
        </>
      )}
    </div>
  );
}
