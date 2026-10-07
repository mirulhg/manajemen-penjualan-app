import type { UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { StockAdjustmentInput } from '../schema';

type AdjustReasonFieldProps = {
  register: UseFormRegister<StockAdjustmentInput>;
  error: string | undefined;
};

export function AdjustReasonField({ register, error }: AdjustReasonFieldProps) {
  return (
    <FormField id="adjust-reason" label="Alasan" hint="Contoh: “Kiriman supplier”, “Hasil stock opname”." error={error}>
      {(control) => <textarea {...control} rows={3} className={FIELD_CLASS} {...register('reason')} />}
    </FormField>
  );
}
