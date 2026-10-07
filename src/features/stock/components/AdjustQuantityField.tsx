import type { UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import type { StockAdjustmentInput } from '../schema';
import { Input } from '@/components/ui/input';

type AdjustQuantityFieldProps = {
  register: UseFormRegister<StockAdjustmentInput>;
  label: string;
  unit: string;
  error: string | undefined;
};

export function AdjustQuantityField({ register, label, unit, error }: AdjustQuantityFieldProps) {
  return (
    <FormField id="adjust-quantity" label={label} error={error}>
      {(control) => (
        <div className="flex items-center gap-2">
          <Input
            {...control}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="mt-1"
            {...register('quantity')}
          />
          <span className="mt-1 shrink-0 text-muted-foreground">{unit}</span>
        </div>
      )}
    </FormField>
  );
}
