import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { ProductFieldsInput } from '../schema';

type IdentityFieldsProps = {
  register: UseFormRegister<ProductFieldsInput>;
  errors: FieldErrors<ProductFieldsInput>;
  categories: string[];
  units: string[];
};

export function IdentityFields({ register, errors, categories, units }: IdentityFieldsProps) {
  return (
    <>
      <FormField id="product-name" label="Nama barang" error={errors.name?.message}>
        {(control) => (
          <input type="text" autoComplete="off" className={FIELD_CLASS} {...control} {...register('name')} />
        )}
      </FormField>
      <FormField id="product-sku" label="SKU" error={errors.sku?.message}>
        {(control) => (
          <input
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            className={FIELD_CLASS}
            {...control}
            {...register('sku')}
          />
        )}
      </FormField>
      <FormField id="product-category" label="Kategori" error={errors.category?.message}>
        {(control) => (
          <input
            type="text"
            list="category-options"
            autoComplete="off"
            className={FIELD_CLASS}
            {...control}
            {...register('category')}
          />
        )}
      </FormField>
      <FormField id="product-unit" label="Satuan" error={errors.unit?.message}>
        {(control) => (
          <input
            type="text"
            list="unit-options"
            autoComplete="off"
            className={FIELD_CLASS}
            {...control}
            {...register('unit')}
          />
        )}
      </FormField>
      <datalist id="category-options">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <datalist id="unit-options">
        {units.map((unit) => (
          <option key={unit} value={unit} />
        ))}
      </datalist>
    </>
  );
}
