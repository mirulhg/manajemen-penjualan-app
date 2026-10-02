import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { NewProductInput } from '../schema';

type StockPriceFieldsProps = {
  register: UseFormRegister<NewProductInput>;
  errors: FieldErrors<NewProductInput>;
};

export function StockPriceFields({ register, errors }: StockPriceFieldsProps) {
  return (
    <>
      <FormField id="product-initial-stock" label="Stok awal" error={errors.initialStock?.message}>
        {(control) => (
          <input type="text" inputMode="numeric" autoComplete="off" className={FIELD_CLASS} {...control} {...register('initialStock')} />
        )}
      </FormField>
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
