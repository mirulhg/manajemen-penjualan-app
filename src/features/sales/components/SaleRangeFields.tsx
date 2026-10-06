import { FormField } from '../../../components/ui/FormField';
import type { SaleFilters } from '../sale-filters';
import { Input } from '@/components/ui/input';

type SaleRangeFieldsProps = {
  filters: SaleFilters;
  onChange: (patch: Partial<SaleFilters>) => void;
};

export function SaleRangeFields({ filters, onChange }: SaleRangeFieldsProps) {
  return (
    <>
      <FormField id="sale-from" label="Dari tanggal" error={undefined}>
        {(control) => (
          <Input
            {...control}
            type="date"
            value={filters.from ?? ''}
            onChange={(event) => onChange({ from: event.target.value || null })}
            className="mt-1"
          />
        )}
      </FormField>
      <FormField id="sale-to" label="Sampai tanggal" error={undefined}>
        {(control) => (
          <Input
            {...control}
            type="date"
            value={filters.to ?? ''}
            onChange={(event) => onChange({ to: event.target.value || null })}
            className="mt-1"
          />
        )}
      </FormField>
    </>
  );
}
