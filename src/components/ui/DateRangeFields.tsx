import type { PeriodSelection } from '../../utils/date-period';
import { FormField } from './FormField';
import { Input } from '@/components/ui/input';

type DateRangeFieldsProps = {
  selection: PeriodSelection;
  onChange: (patch: Partial<PeriodSelection>) => void;
};

export function DateRangeFields({ selection, onChange }: DateRangeFieldsProps) {
  return (
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
  );
}
