import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';

import { formatNumber } from '../../../utils/format-number';
import { CreateProductError } from '../api/create-product';
import { useCreateProduct } from '../api/use-create-product';
import { UNCHANGED_PHOTO } from '../photo/photo-draft';
import type { PhotoDraft } from '../photo/photo-draft';
import { useApplyPhotoDraft } from '../photo/use-apply-photo-draft';
import { newProductSchema } from '../schema';
import type { NewProduct, NewProductInput } from '../schema';
import { IdentityFields } from './IdentityFields';
import { InitialStockField } from './InitialStockField';
import { PriceAndLimitFields } from './PriceAndLimitFields';
import { ProductPhotoField } from './ProductPhotoField';
import { SoldAtLossWarning } from './SoldAtLossWarning';
import { Alert } from '@/components/ui/alert';

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
  const { applyPhotoDraft, hasFailed: hasPhotoFailed } = useApplyPhotoDraft();
  // Foto bukan teks yang divalidasi skema, jadi pilihannya disimpan terpisah dari RHF.
  const [photoDraft, setPhotoDraft] = useState<PhotoDraft>(UNCHANGED_PHOTO);

  const purchasePriceText = useWatch({ control, name: 'purchasePrice' });
  const sellingPriceText = useWatch({ control, name: 'sellingPrice' });
  const nameText = useWatch({ control, name: 'name' });
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty && photoDraft.kind === 'unchanged';
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof CreateProductError);
  const buttonLabel = isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan barang';

  // Dipanggil hanya bila skema lolos; nilai mentah (teks) dikirim ke API, yang memvalidasi ulang dengan skema yang sama.
  async function onSubmit() {
    try {
      const created = await mutation.mutateAsync(getValues());
      const draft = photoDraft;
      reset(EMPTY_FORM);
      setPhotoDraft(UNCHANGED_PHOTO);
      setFocus('name');
      try {
        await applyPhotoDraft(created.id, draft);
      } catch {
        // Barang sudah tersimpan; kegagalan foto ditampilkan lewat hasPhotoFailed di bawah.
      }
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
      <ProductPhotoField productId={null} productName={nameText} draft={photoDraft} onChange={setPhotoDraft} />
      {hasSaved && (
        <Alert variant="success" role="status" className="p-3">
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
        </Alert>
      )}
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Isian Anda masih ada; coba simpan lagi.
        </Alert>
      )}
      {hasPhotoFailed && (
        <Alert variant="destructive" className="p-3">
          Barang tersimpan, tetapi foto gagal disimpan. Buka Ubah barang untuk mencoba lagi.
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
