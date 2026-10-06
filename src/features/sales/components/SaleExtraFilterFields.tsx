import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { findPaymentMethod, PAYMENT_METHOD_OPTIONS } from '../payment-method-options';
import type { SaleFilters } from '../sale-filters';

type SaleExtraFilterFieldsProps = {
  filters: SaleFilters;
  actors: string[];
  onChange: (patch: Partial<SaleFilters>) => void;
};

// Metode bayar dan kasir: sebaris di desktop, di dalam Drawer di HP. Dirender satu kali per layar, jadi id tidak bentrok.
export function SaleExtraFilterFields({ filters, actors, onChange }: SaleExtraFilterFieldsProps) {
  return (
    <>
      <FormField id="sale-method" label="Metode bayar" error={undefined}>
        {(control) => (
          <select
            {...control}
            value={filters.method ?? ''}
            onChange={(event) => onChange({ method: findPaymentMethod(event.target.value) })}
            className={FIELD_CLASS}
          >
            <option value="">Semua metode</option>
            {PAYMENT_METHOD_OPTIONS.map((method) => (
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
    </>
  );
}
