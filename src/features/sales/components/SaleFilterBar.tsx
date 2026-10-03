import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { PaymentMethod } from '../../../lib/db/records';
import { SALE_PERIODS, toLocalDateText } from '../sale-filters';
import type { SaleFilters, SalePeriod } from '../sale-filters';

type SaleFilterBarProps = {
  filters: SaleFilters;
  actors: string[];
  onChange: (patch: Partial<SaleFilters>) => void;
};

const PERIOD_LABELS: Record<SalePeriod, string> = {
  'hari-ini': 'Hari ini',
  kemarin: 'Kemarin',
  '7-hari': '7 hari terakhir',
  'bulan-ini': 'Bulan ini',
  rentang: 'Rentang tanggal',
};

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'tunai', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris', label: 'QRIS' },
];

function findPeriod(value: string): SalePeriod {
  return SALE_PERIODS.find((period) => period === value) ?? 'hari-ini';
}

function findMethod(value: string): PaymentMethod | null {
  return METHODS.find((method) => method.value === value)?.value ?? null;
}

export function SaleFilterBar({ filters, actors, onChange }: SaleFilterBarProps) {
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
    <div className="grid gap-4 sm:grid-cols-3">
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
      <FormField id="sale-method" label="Metode bayar" error={undefined}>
        {(control) => (
          <select
            {...control}
            value={filters.method ?? ''}
            onChange={(event) => onChange({ method: findMethod(event.target.value) })}
            className={FIELD_CLASS}
          >
            <option value="">Semua metode</option>
            {METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <FormField id="sale-actor" label="Kasir" error={undefined}>
        {(control) => (
          <select
            {...control}
            value={filters.actor ?? ''}
            onChange={(event) => onChange({ actor: event.target.value || null })}
            className={FIELD_CLASS}
          >
            <option value="">Semua kasir</option>
            {actors.map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>
        )}
      </FormField>
      {filters.period === 'rentang' && (
        <>
          <FormField id="sale-from" label="Dari tanggal" error={undefined}>
            {(control) => (
              <input
                {...control}
                type="date"
                value={filters.from ?? ''}
                onChange={(event) => onChange({ from: event.target.value || null })}
                className={FIELD_CLASS}
              />
            )}
          </FormField>
          <FormField id="sale-to" label="Sampai tanggal" error={undefined}>
            {(control) => (
              <input
                {...control}
                type="date"
                value={filters.to ?? ''}
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
