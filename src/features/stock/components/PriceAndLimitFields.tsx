import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { ProductFieldsInput } from '../schema';

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
          <input type="text" inputMode="numeric" autoComplete="off" className={FIELD_CLASS} {...control} {...register('minStock')} />
        )}
      </FormField>
      <FormField id="product-purchase-price" label="Harga beli (Rp)" error={errors.purchasePrice?.message}>
        {(control) => (
          <input type="text" inputMode="numeric" autoComplete="off" className={FIELD_CLASS} {...control} {...register('purchasePrice')} />
        )}
      </FormField>
      <FormField id="product-selling-price" label="Harga jual (Rp)" error={errors.sellingPrice?.message}>
        {(control) => (
          <input type="text" inputMode="numeric" autoComplete="off" className={FIELD_CLASS} {...control} {...register('sellingPrice')} />
        )}
      </FormField>
    </>
  );
}
