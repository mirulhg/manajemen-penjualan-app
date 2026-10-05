import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import type { NewProductInput } from '../schema';
import { Input } from '@/components/ui/input';

type InitialStockFieldProps = {
  register: UseFormRegister<NewProductInput>;
  errors: FieldErrors<NewProductInput>;
};

export function InitialStockField({ register, errors }: InitialStockFieldProps) {
  return (
    <FormField id="product-initial-stock" label="Stok awal" error={errors.initialStock?.message}>
      {(control) => (
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="mt-1"
          {...control}
          {...register('initialStock')}
        />
      )}
    </FormField>
  );
}
