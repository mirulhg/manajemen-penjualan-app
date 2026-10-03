import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';

import { formatNumber } from '../../../utils/format-number';
import { CreateProductError } from '../api/create-product';
import { useCreateProduct } from '../api/use-create-product';
import { newProductSchema } from '../schema';
import type { NewProduct, NewProductInput } from '../schema';
import { IdentityFields } from './IdentityFields';
import { InitialStockField } from './InitialStockField';
import { PriceAndLimitFields } from './PriceAndLimitFields';
import { SoldAtLossWarning } from './SoldAtLossWarning';

type NewProductFormProps = {
  categories: string[];
  units: string[];
};

const EMPTY_FORM: NewProductInput = {
  name: '',
  sku: '',
  category: '',
  unit: '',
  initialStock: '',
  minStock: '',
  purchasePrice: '',
  sellingPrice: '',
};

export function NewProductForm({ categories, units }: NewProductFormProps) {
  const { register, handleSubmit, control, reset, setError, setFocus, getValues, formState } =
    useForm<NewProductInput, unknown, NewProduct>({
      resolver: zodResolver(newProductSchema),
      defaultValues: EMPTY_FORM,
    });
  const mutation = useCreateProduct();

  const purchasePriceText = useWatch({ control, name: 'purchasePrice' });
  const sellingPriceText = useWatch({ control, name: 'sellingPrice' });
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof CreateProductError);
  const buttonLabel = isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan barang';

  // Dipanggil hanya bila skema lolos; nilai mentah (teks) dikirim ke API, yang memvalidasi ulang dengan skema yang sama.
  async function onSubmit() {
    try {
      await mutation.mutateAsync(getValues());
      reset(EMPTY_FORM);
      setFocus('name');
    } catch (error) {
      if (error instanceof CreateProductError) {
        setError('sku', { message: error.message });
      }
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
      <IdentityFields
        register={register}
        errors={formState.errors}
        categories={categories}
        units={units}
      />
      <InitialStockField register={register} errors={formState.errors} />
      <PriceAndLimitFields register={register} errors={formState.errors} />
      <SoldAtLossWarning purchasePriceText={purchasePriceText} sellingPriceText={sellingPriceText} />
      {hasSaved && (
        <div role="status" className="rounded-md bg-status-aman-bg p-3 text-status-aman-text">
          <p>
            Tersimpan. {mutation.data.name} ditambahkan dengan stok{' '}
            {formatNumber(mutation.data.stockQuantity)} {mutation.data.unit}.
          </p>
          <Link
            to={`/stok?q=${encodeURIComponent(mutation.data.sku)}`}
            className="inline-flex min-h-11 items-center font-medium underline"
          >
            Lihat di daftar stok
          </Link>
        </div>
      )}
      {hasUnexpectedError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Penyimpanan di perangkat ini gagal. Isian Anda masih ada; coba simpan lagi.
        </p>
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="min-h-11 w-full rounded-md bg-primary px-4 font-medium text-on-primary sm:w-auto"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
