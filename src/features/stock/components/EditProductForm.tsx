import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';

import { formatNumber } from '../../../utils/format-number';
import { UpdateProductError } from '../api/update-product';
import { useUpdateProduct } from '../api/use-update-product';
import { editProductSchema } from '../schema';
import type { EditProduct, Product, ProductFieldsInput } from '../schema';
import { IdentityFields } from './IdentityFields';
import { PriceAndLimitFields } from './PriceAndLimitFields';
import { SoldAtLossWarning } from './SoldAtLossWarning';

type EditProductFormProps = {
  product: Product;
  categories: string[];
  units: string[];
};

function toFormValues(product: Product): ProductFieldsInput {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    unit: product.unit,
    minStock: product.minStock === null ? '' : String(product.minStock),
    purchasePrice: formatNumber(product.purchasePrice),
    sellingPrice: formatNumber(product.sellingPrice),
  };
}

export function EditProductForm({ product, categories, units }: EditProductFormProps) {
  const { register, handleSubmit, control, reset, setError, getValues, formState } = useForm<
    ProductFieldsInput,
    unknown,
    EditProduct
  >({ resolver: zodResolver(editProductSchema), defaultValues: toFormValues(product) });
  const mutation = useUpdateProduct(product.id);

  const purchasePriceText = useWatch({ control, name: 'purchasePrice' });
  const sellingPriceText = useWatch({ control, name: 'sellingPrice' });
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;
  const updateError = mutation.error instanceof UpdateProductError ? mutation.error : null;
  // Pesan "tidak ada perubahan" hilang begitu pengguna mengubah isian lagi.
  const hasNoChange = updateError?.code === 'NO_CHANGE' && !formState.isDirty;
  const hasUnexpectedError =
    mutation.isError && (updateError === null || updateError.code === 'PRODUCT_NOT_FOUND');
  const buttonLabel = isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan perubahan';

  // Dipanggil hanya bila skema lolos; nilai mentah (teks) dikirim ke API, yang memvalidasi ulang.
  async function onSubmit() {
    try {
      const updated = await mutation.mutateAsync(getValues());
      reset(toFormValues(updated));
    } catch (error) {
      if (error instanceof UpdateProductError && error.code === 'DUPLICATE_SKU') {
        setError('sku', { message: error.message });
      }
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
      <IdentityFields register={register} errors={formState.errors} categories={categories} units={units} />
      <PriceAndLimitFields register={register} errors={formState.errors} />
      <SoldAtLossWarning purchasePriceText={purchasePriceText} sellingPriceText={sellingPriceText} />
      {hasSaved && (
        <div role="status" className="rounded-md bg-status-aman-bg p-3 text-status-aman-text">
          <p>Tersimpan. Perubahan {mutation.data.name} dicatat.</p>
          <Link to={`/stok/${product.id}`} className="inline-flex min-h-11 items-center font-medium underline">
            Lihat detail barang
          </Link>
        </div>
      )}
      {hasNoChange && (
        <p role="alert" className="rounded-md bg-status-menipis-bg p-3 text-status-menipis-text">
          Tidak ada perubahan untuk disimpan.
        </p>
      )}
      {hasUnexpectedError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Perubahan tidak tersimpan. Isian Anda masih ada; periksa lalu coba simpan lagi.
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
