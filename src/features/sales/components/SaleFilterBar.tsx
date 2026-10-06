import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { useMediaQuery } from '../../../hooks/use-media-query';
import type { SaleFilters } from '../sale-filters';
import { SaleExtraFilterFields } from './SaleExtraFilterFields';
import { SaleFilterChips } from './SaleFilterChips';
import { SaleFilterDrawer } from './SaleFilterDrawer';
import { SalePeriodSelect } from './SalePeriodSelect';
import { SaleRangeFields } from './SaleRangeFields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type SaleFilterBarProps = {
  filters: SaleFilters;
  actors: string[];
  onChange: (patch: Partial<SaleFilters>) => void;
};

// Sama dengan breakpoint `md` Tailwind: di atasnya metode bayar dan kasir sebaris, di bawahnya lewat Drawer.
const INLINE_QUERY = '(min-width: 48rem)';

export function SaleFilterBar({ filters, actors, onChange }: SaleFilterBarProps) {
  const isInline = useMediaQuery(INLINE_QUERY);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const activeCount = [filters.method !== null, filters.actor !== null].filter(Boolean).length;

  function handleOpenDrawer() {
    setIsDrawerOpen(true);
  }

  if (isInline) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SalePeriodSelect filters={filters} onChange={onChange} />
        <SaleExtraFilterFields filters={filters} actors={actors} onChange={onChange} />
        {filters.period === 'rentang' && <SaleRangeFields filters={filters} onChange={onChange} />}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <SalePeriodSelect filters={filters} onChange={onChange} />
        </div>
        <Button type="button" variant="outline" onClick={handleOpenDrawer}>
          <SlidersHorizontal aria-hidden="true" />
          Filter
          {activeCount > 0 && <Badge variant="accent">{activeCount}</Badge>}
        </Button>
      </div>
      {filters.period === 'rentang' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SaleRangeFields filters={filters} onChange={onChange} />
        </div>
      )}
      <SaleFilterChips filters={filters} onChange={onChange} />
      <SaleFilterDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        filters={filters}
        actors={actors}
        onChange={onChange}
      />
    </div>
  );
}
