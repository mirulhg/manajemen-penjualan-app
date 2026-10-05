import type { UseFormRegister } from 'react-hook-form';

import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { StockAdjustmentInput } from '../schema';
import { Label } from '@/components/ui/label';

type AdjustReasonFieldProps = {
  register: UseFormRegister<StockAdjustmentInput>;
  error: string | undefined;
};

export function AdjustReasonField({ register, error }: AdjustReasonFieldProps) {
  const describedBy = error ? 'adjust-reason-hint adjust-reason-error' : 'adjust-reason-hint';

  return (
    <div>
      <Label htmlFor="adjust-reason">
        Alasan
      </Label>
      <textarea
        id="adjust-reason"
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={FIELD_CLASS}
        {...register('reason')}
      />
      <p id="adjust-reason-hint" className="mt-1 text-sm text-muted-foreground">
        Contoh: “Kiriman supplier”, “Hasil stock opname”.
      </p>
      {error && (
        <p id="adjust-reason-error" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
