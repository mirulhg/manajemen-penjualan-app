import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { PERIOD_LABELS, toLocalDateText } from '../../../utils/date-period';
import type { Period } from '../../../utils/date-period';
import { SALE_PERIODS } from '../sale-filters';
import type { SaleFilters } from '../sale-filters';

type SalePeriodSelectProps = {
  filters: SaleFilters;
  onChange: (patch: Partial<SaleFilters>) => void;
};

function findPeriod(value: string): Period {
  return SALE_PERIODS.find((period) => period === value) ?? 'hari-ini';
}

export function SalePeriodSelect({ filters, onChange }: SalePeriodSelectProps) {
  function handlePeriodChange(value: string) {
    const period = findPeriod(value);
    // Rentang butuh dua tanggal yang valid; mulai dari hari ini supaya pilihan langsung berlaku.
    if (period === 'rentang') {
      const today = toLocalDateText(new Date());
      onChange({ period, from: filters.from ?? today, to: filters.to ?? today });
    } else {
      onChange({ period });
    }
  }

  return (
    <FormField id="sale-period" label="Periode" error={undefined}>
      {(control) => (
        <select
          {...control}
          value={filters.period}
          onChange={(event) => handlePeriodChange(event.target.value)}
          className={FIELD_CLASS}
        >
          {SALE_PERIODS.map((period) => (
            <option key={period} value={period}>
              {PERIOD_LABELS[period]}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
