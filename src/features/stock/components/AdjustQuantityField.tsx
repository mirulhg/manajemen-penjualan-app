import type { UseFormRegister } from 'react-hook-form';

import type { StockAdjustmentInput } from '../schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AdjustQuantityFieldProps = {
  register: UseFormRegister<StockAdjustmentInput>;
  label: string;
  unit: string;
  error: string | undefined;
};

export function AdjustQuantityField({ register, label, unit, error }: AdjustQuantityFieldProps) {
  return (
    <div>
      <Label htmlFor="adjust-quantity">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="adjust-quantity"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'adjust-quantity-error' : undefined}
          className="mt-1"
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
