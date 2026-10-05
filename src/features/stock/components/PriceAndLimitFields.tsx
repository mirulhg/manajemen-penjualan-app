import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import type { ProductFieldsInput } from '../schema';
import { Input } from '@/components/ui/input';

type PriceAndLimitFieldsProps = {
  register: UseFormRegister<ProductFieldsInput>;
  errors: FieldErrors<ProductFieldsInput>;
};

export function PriceAndLimitFields({ register, errors }: PriceAndLimitFieldsProps) {
  return (
    <>
      <FormField
        id="product-min-stock"
        label="Batas stok menipis (opsional)"
        hint="Kosongkan untuk memakai batas default 5."
        error={errors.minStock?.message}
      >
        {(control) => (
          <Input type="text" inputMode="numeric" autoComplete="off" className="mt-1" {...control} {...register('minStock')} />
        )}
      </FormField>
      <FormField id="product-purchase-price" label="Harga beli (Rp)" error={errors.purchasePrice?.message}>
        {(control) => (
          <Input type="text" inputMode="numeric" autoComplete="off" className="mt-1" {...control} {...register('purchasePrice')} />
        )}
      </FormField>
      <FormField id="product-selling-price" label="Harga jual (Rp)" error={errors.sellingPrice?.message}>
        {(control) => (
          <Input type="text" inputMode="numeric" autoComplete="off" className="mt-1" {...control} {...register('sellingPrice')} />
        )}
      </FormField>
    </>
  );
}
