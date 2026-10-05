import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';

import { formatNumber } from '../../../utils/format-number';
import { UpdateProductError } from '../api/update-product';
import { useUpdateProduct } from '../api/use-update-product';
import { UNCHANGED_PHOTO } from '../photo/photo-draft';
import type { PhotoDraft } from '../photo/photo-draft';
import { useApplyPhotoDraft } from '../photo/use-apply-photo-draft';
import { editProductSchema } from '../schema';
import type { EditProduct, Product, ProductFieldsInput } from '../schema';
import { IdentityFields } from './IdentityFields';
import { PriceAndLimitFields } from './PriceAndLimitFields';
import { ProductPhotoField } from './ProductPhotoField';
import { SoldAtLossWarning } from './SoldAtLossWarning';
import { Alert } from '@/components/ui/alert';

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
  const { applyPhotoDraft, hasFailed: hasPhotoFailed } = useApplyPhotoDraft();
  // Foto bukan teks yang divalidasi skema, jadi pilihannya disimpan terpisah dari RHF.
  const [photoDraft, setPhotoDraft] = useState<PhotoDraft>(UNCHANGED_PHOTO);
  const [savedName, setSavedName] = useState<string | null>(null);

  const purchasePriceText = useWatch({ control, name: 'purchasePrice' });
  const sellingPriceText = useWatch({ control, name: 'sellingPrice' });
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = savedName !== null && !formState.isDirty && photoDraft.kind === 'unchanged';
  const updateError = mutation.error instanceof UpdateProductError ? mutation.error : null;
  // Pesan "tidak ada perubahan" hilang begitu pengguna mengubah isian lagi.
  const hasNoChange =
    updateError?.code === 'NO_CHANGE' && !formState.isDirty && photoDraft.kind === 'unchanged';
  const hasUnexpectedError =
    hasPhotoFailed ||
    (mutation.isError && (updateError === null || updateError.code === 'PRODUCT_NOT_FOUND'));
  const buttonLabel = isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan perubahan';

  // Tanpa perubahan data tetapi dengan foto baru, "tidak ada perubahan" bukan kegagalan: hanya fotonya yang disimpan.
  async function saveFields(): Promise<Product | null> {
    try {
      return await mutation.mutateAsync(getValues());
    } catch (error) {
      const isPhotoOnly =
        error instanceof UpdateProductError && error.code === 'NO_CHANGE' && photoDraft.kind !== 'unchanged';
      if (isPhotoOnly) return null;
      throw error;
    }
  }

  // Dipanggil hanya bila skema lolos; nilai mentah (teks) dikirim ke API, yang memvalidasi ulang.
  async function onSubmit() {
    try {
      const updated = await saveFields();
      await applyPhotoDraft(product.id, photoDraft);
      setPhotoDraft(UNCHANGED_PHOTO);
      setSavedName((updated ?? product).name);
      if (updated) reset(toFormValues(updated));
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
      <ProductPhotoField
        productId={product.id}
        productName={product.name}
        draft={photoDraft}
        onChange={setPhotoDraft}
      />
      {hasSaved && (
        <Alert variant="success" role="status" className="p-3">
          <p>Tersimpan. Perubahan {savedName} dicatat.</p>
          <Link to={`/stok/${product.id}`} className="inline-flex min-h-11 items-center font-medium underline">
            Lihat detail barang
          </Link>
        </Alert>
      )}
      {hasNoChange && (
        <p role="alert" className="rounded-md bg-status-menipis-bg p-3 text-status-menipis-text">
          Tidak ada perubahan untuk disimpan.
        </p>
      )}
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Perubahan tidak tersimpan. Isian Anda masih ada; periksa lalu coba simpan lagi.
        </Alert>
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="min-h-11 w-full rounded-md bg-primary px-4 font-medium text-primary-foreground sm:w-auto"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
