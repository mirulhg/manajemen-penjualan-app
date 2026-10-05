import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import type { StoreProfile } from '../../../lib/db/records';
import { useSaveStoreProfile } from '../api/use-store-profile';
import { storeProfileFormSchema } from '../schema';
import type { LogoDraft, StoreProfileFormInput, StoreProfileFormValues } from '../schema';
import { StoreLogoField } from './StoreLogoField';

type StoreProfileFormProps = {
  profile: StoreProfile | null;
};

const UNCHANGED_LOGO: LogoDraft = { kind: 'unchanged' };

export function StoreProfileForm({ profile }: StoreProfileFormProps) {
  const initialValues: StoreProfileFormInput = {
    name: profile?.name ?? '',
    address: profile?.address ?? '',
    phone: profile?.phone ?? '',
  };
  const { register, handleSubmit, reset, formState } = useForm<StoreProfileFormInput, unknown, StoreProfileFormValues>({
    resolver: zodResolver(storeProfileFormSchema),
    defaultValues: initialValues,
  });
  const [logoDraft, setLogoDraft] = useState<LogoDraft>(UNCHANGED_LOGO);
  const mutation = useSaveStoreProfile();
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty && logoDraft.kind === 'unchanged';

  async function onSubmit(values: StoreProfileFormValues) {
    await mutation.mutateAsync({ values, logoDraft });
    // Isian dikosongkan dari "kotor" hanya setelah tersimpan, supaya pesan "Tersimpan" muncul sampai diubah lagi.
    reset(values);
    setLogoDraft(UNCHANGED_LOGO);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    // Kegagalan simpan sudah ditampilkan lewat mutation.isError; catch hanya mencegah rejection tak tertangani.
    void handleSubmit(onSubmit)(event).catch(() => undefined);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <FormField id="store-name" label="Nama toko" error={formState.errors.name?.message}>
        {(control) => <input {...control} {...register('name')} type="text" autoComplete="organization" className={FIELD_CLASS} />}
      </FormField>
      <FormField id="store-address" label="Alamat (opsional)" error={formState.errors.address?.message}>
        {(control) => <textarea {...control} {...register('address')} rows={2} className={FIELD_CLASS} />}
      </FormField>
      <FormField id="store-phone" label="Telepon (opsional)" error={formState.errors.phone?.message}>
        {(control) => <input {...control} {...register('phone')} type="tel" inputMode="tel" className={FIELD_CLASS} />}
      </FormField>
      <StoreLogoField storedLogo={profile?.logo ?? null} draft={logoDraft} onChange={setLogoDraft} />
      {hasSaved && (
        <p role="status" className="rounded-md bg-status-aman-bg p-3 text-status-aman-text">
          Tersimpan. Profil toko dipakai di kop laporan.
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Penyimpanan di perangkat ini gagal. Isian tidak hilang; coba simpan lagi.
        </p>
      )}
      <button type="submit" disabled={isSaving} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
        {isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan profil'}
      </button>
    </form>
  );
}
