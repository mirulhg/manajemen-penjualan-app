import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { NewProductInput } from '../schema';

type InitialStockFieldProps = {
  register: UseFormRegister<NewProductInput>;
  errors: FieldErrors<NewProductInput>;
};

export function InitialStockField({ register, errors }: InitialStockFieldProps) {
  return (
    <FormField id="product-initial-stock" label="Stok awal" error={errors.initialStock?.message}>
      {(control) => (
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={FIELD_CLASS}
          {...control}
          {...register('initialStock')}
        />
      )}
    </FormField>
  );
}
