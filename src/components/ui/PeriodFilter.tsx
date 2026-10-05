import { PERIOD_LABELS, toLocalDateText } from '../../utils/date-period';
import type { Period, PeriodSelection } from '../../utils/date-period';
import { FormField } from './FormField';
import { FIELD_CLASS } from './field-styles';
import { Input } from '@/components/ui/input';

type PeriodFilterProps = {
  selection: PeriodSelection;
  // Pilihan periode yang tersedia di halaman pemakai; berbeda antara dasbor dan laporan.
  periods: readonly Period[];
  onChange: (patch: Partial<PeriodSelection>) => void;
};

export function PeriodFilter({ selection, periods, onChange }: PeriodFilterProps) {
  function handlePeriodChange(value: string) {
    const period = periods.find((option) => option === value) ?? selection.period;
    // Rentang butuh dua tanggal yang valid; mulai dari hari ini supaya pilihan langsung berlaku.
    if (period === 'rentang') {
      const today = toLocalDateText(new Date());
      onChange({ period, from: selection.from ?? today, to: selection.to ?? today });
    } else {
      onChange({ period });
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField id="period-filter" label="Periode" error={undefined}>
        {(control) => (
          <select
            {...control}
            value={selection.period}
            onChange={(event) => handlePeriodChange(event.target.value)}
            className={FIELD_CLASS}
          >
            {periods.map((period) => (
              <option key={period} value={period}>
                {PERIOD_LABELS[period]}
              </option>
            ))}
          </select>
        )}
      </FormField>
      {selection.period === 'rentang' && (
        <>
          <FormField id="period-filter-from" label="Dari tanggal" error={undefined}>
            {(control) => (
              <Input
                {...control}
                type="date"
                value={selection.from ?? ''}
                onChange={(event) => onChange({ from: event.target.value || null })}
                className="mt-1"
              />
            )}
          </FormField>
          <FormField id="period-filter-to" label="Sampai tanggal" error={undefined}>
            {(control) => (
              <Input
                {...control}
                type="date"
                value={selection.to ?? ''}
                onChange={(event) => onChange({ to: event.target.value || null })}
                className="mt-1"
              />
            )}
          </FormField>
        </>
      )}
    </div>
  );
}
