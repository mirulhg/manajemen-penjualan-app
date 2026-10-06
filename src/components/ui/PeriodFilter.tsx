import { PERIOD_LABELS, periodPatch } from '../../utils/date-period';
import type { Period, PeriodSelection } from '../../utils/date-period';
import { DateRangeFields } from './DateRangeFields';
import { FormField } from './FormField';
import { FIELD_CLASS } from './field-styles';

type PeriodFilterProps = {
  selection: PeriodSelection;
  // Pilihan periode yang tersedia di halaman pemakai; berbeda antara dasbor dan laporan.
  periods: readonly Period[];
  onChange: (patch: Partial<PeriodSelection>) => void;
};

export function PeriodFilter({ selection, periods, onChange }: PeriodFilterProps) {
  function handlePeriodChange(value: string) {
    const period = periods.find((option) => option === value) ?? selection.period;
    onChange(periodPatch(selection, period));
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
      {selection.period === 'rentang' && <DateRangeFields selection={selection} onChange={onChange} />}
    </div>
  );
}
