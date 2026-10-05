import type { UseFormRegister } from 'react-hook-form';

import { FIELD_CLASS, LABEL_CLASS } from '../../../components/ui/field-styles';
import type { StockAdjustmentInput } from '../schema';

type AdjustQuantityFieldProps = {
  register: UseFormRegister<StockAdjustmentInput>;
  label: string;
  unit: string;
  error: string | undefined;
};

export function AdjustQuantityField({ register, label, unit, error }: AdjustQuantityFieldProps) {
  return (
    <div>
      <label htmlFor="adjust-quantity" className={LABEL_CLASS}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id="adjust-quantity"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'adjust-quantity-error' : undefined}
          className={FIELD_CLASS}
          {...register('quantity')}
        />
        <span className="mt-1 shrink-0 text-muted-foreground">{unit}</span>
      </div>
      {error && (
        <p id="adjust-quantity-error" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
