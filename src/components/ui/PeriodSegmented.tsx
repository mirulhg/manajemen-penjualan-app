import { ChevronDown } from 'lucide-react';
import { m } from 'motion/react';
import { useId } from 'react';

import { PERIOD_LABELS, periodPatch } from '../../utils/date-period';
import type { Period, PeriodSelection } from '../../utils/date-period';
import { DateRangeFields } from './DateRangeFields';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { INDICATOR_TRANSITION } from '@/lib/motion';
import { cn } from '@/lib/utils';

type PeriodSegmentedProps = {
  selection: PeriodSelection;
  onChange: (patch: Partial<PeriodSelection>) => void;
};

const QUICK_PERIODS: readonly Period[] = ['hari-ini', '7-hari', '30-hari'];
const MORE_PERIODS: readonly Period[] = ['bulan-ini', '12-bulan', 'rentang'];

const QUICK_LABELS: Partial<Record<Period, string>> = { 'hari-ini': 'Hari ini', '7-hari': '7 hari', '30-hari': '30 hari' };

// Tiga pilihan satu ketuk + menu "Lainnya"; pilihan aktif dibedakan lewat latar, bukan bobot font (lebar teks tidak bergeser).
export function PeriodSegmented({ selection, onChange }: PeriodSegmentedProps) {
  const indicatorId = useId();
  const isMoreSelected = MORE_PERIODS.includes(selection.period);

  function handleMoreChange(value: string) {
    const period = MORE_PERIODS.find((option) => option === value);
    if (period) onChange(periodPatch(selection, period));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div role="group" aria-label="Periode" className="flex flex-1 gap-1 rounded-md bg-secondary p-1">
          {QUICK_PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={selection.period === period}
              onClick={() => onChange(periodPatch(selection, period))}
              className={cn(
                'relative min-h-11 flex-1 rounded-sm px-2 text-sm font-medium text-muted-foreground transition-colors duration-(--duration-fast) ease-out',
                'aria-pressed:text-foreground',
              )}
            >
              {selection.period === period && (
                <m.span
                  layoutId={indicatorId}
                  transition={INDICATOR_TRANSITION}
                  className="absolute inset-0 rounded-sm border border-border bg-card"
                />
              )}
              <span className="relative">{QUICK_LABELS[period]}</span>
            </button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant={isMoreSelected ? 'secondary' : 'outline'}>
              {isMoreSelected ? PERIOD_LABELS[selection.period] : 'Lainnya'}
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={isMoreSelected ? selection.period : ''} onValueChange={handleMoreChange}>
              {MORE_PERIODS.map((period) => (
                <DropdownMenuRadioItem key={period} value={period}>
                  {PERIOD_LABELS[period]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {selection.period === 'rentang' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DateRangeFields selection={selection} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
