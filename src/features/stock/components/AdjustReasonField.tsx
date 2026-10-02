import type { UseFormRegister } from 'react-hook-form';

import { FIELD_CLASS, LABEL_CLASS } from '../../../components/ui/field-styles';
import type { StockAdjustmentInput } from '../schema';

type AdjustReasonFieldProps = {
  register: UseFormRegister<StockAdjustmentInput>;
  error: string | undefined;
};

export function AdjustReasonField({ register, error }: AdjustReasonFieldProps) {
  const describedBy = error ? 'adjust-reason-hint adjust-reason-error' : 'adjust-reason-hint';

  return (
    <div>
      <label htmlFor="adjust-reason" className={LABEL_CLASS}>
        Alasan
      </label>
      <textarea
        id="adjust-reason"
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={FIELD_CLASS}
        {...register('reason')}
      />
      <p id="adjust-reason-hint" className="mt-1 text-sm text-text-muted">
        Contoh: “Kiriman supplier”, “Hasil stock opname”.
      </p>
      {error && (
        <p id="adjust-reason-error" className="mt-1 text-sm text-status-habis-text">
          {error}
        </p>
      )}
    </div>
  );
}
