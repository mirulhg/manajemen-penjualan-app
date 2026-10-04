import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { PERIOD_LABELS, toLocalDateText } from '../../../utils/date-period';
import type { Period, PeriodSelection } from '../../../utils/date-period';
import { DASHBOARD_PERIODS } from '../hooks/use-dashboard-period';

type PeriodFilterProps = {
  selection: PeriodSelection;
  onChange: (patch: Partial<PeriodSelection>) => void;
};

function findPeriod(value: string): Period {
  return DASHBOARD_PERIODS.find((period) => period === value) ?? 'hari-ini';
}

export function PeriodFilter({ selection, onChange }: PeriodFilterProps) {
  function handlePeriodChange(value: string) {
    const period = findPeriod(value);
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
      <FormField id="dashboard-period" label="Periode" error={undefined}>
        {(control) => (
          <select
            {...control}
            value={selection.period}
            onChange={(event) => handlePeriodChange(event.target.value)}
            className={FIELD_CLASS}
          >
            {DASHBOARD_PERIODS.map((period) => (
              <option key={period} value={period}>
                {PERIOD_LABELS[period]}
              </option>
            ))}
          </select>
        )}
      </FormField>
      {selection.period === 'rentang' && (
        <>
          <FormField id="dashboard-from" label="Dari tanggal" error={undefined}>
            {(control) => (
              <input
                {...control}
                type="date"
                value={selection.from ?? ''}
                onChange={(event) => onChange({ from: event.target.value || null })}
                className={FIELD_CLASS}
              />
            )}
          </FormField>
          <FormField id="dashboard-to" label="Sampai tanggal" error={undefined}>
            {(control) => (
              <input
                {...control}
                type="date"
                value={selection.to ?? ''}
                onChange={(event) => onChange({ to: event.target.value || null })}
                className={FIELD_CLASS}
              />
            )}
          </FormField>
        </>
      )}
    </div>
  );
}
