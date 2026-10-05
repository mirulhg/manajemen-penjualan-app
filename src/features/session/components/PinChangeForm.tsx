import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { describeSessionError } from '../describe-session-error';
import { SessionError } from '../api/session-error';
import { useChangePin } from '../api/use-session-mutations';
import { newPinSchema } from '../schema';
import { PinField } from './PinField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const changePinSchema = z
  .object({ oldPin: z.string().min(1, 'Isi PIN lama.') })
  .and(newPinSchema);
type ChangePinInput = z.input<typeof changePinSchema>;

const EMPTY_FORM: ChangePinInput = { oldPin: '', newPin: '', confirmPin: '' };

export function PinChangeForm() {
  const { register, handleSubmit, reset, setError, getValues, formState } = useForm<
    ChangePinInput,
    unknown,
    z.output<typeof changePinSchema>
  >({ resolver: zodResolver(changePinSchema), defaultValues: EMPTY_FORM });
  const mutation = useChangePin();
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof SessionError);

  // Dipanggil hanya bila skema lolos; teks mentah dikirim ke API, yang memvalidasi ulang.
  async function onSubmit() {
    const { oldPin, newPin } = getValues();
    try {
      await mutation.mutateAsync({ oldPin, newPin });
      reset(EMPTY_FORM);
    } catch (error) {
      const message = describeSessionError(error);
      if (message) setError(error instanceof SessionError && error.code === 'INVALID_PIN_FORMAT' ? 'newPin' : 'oldPin', { message });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <PinField id="old-pin" label="PIN lama" error={formState.errors.oldPin?.message} registration={register('oldPin')} />
      <PinField
        id="new-pin"
        label="PIN baru"
        hint="4–6 angka."
        error={formState.errors.newPin?.message}
        registration={register('newPin')}
      />
      <PinField
        id="confirm-pin"
        label="Isi ulang PIN baru"
        error={formState.errors.confirmPin?.message}
        registration={register('confirmPin')}
      />
      {hasSaved && (
        <Alert variant="success" role="status" className="p-3">
          PIN diubah.
        </Alert>
      )}
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Coba simpan lagi.
        </Alert>
      )}
      <Button size="lg" type="submit" disabled={isSaving}>
        {isSaving ? 'Menyimpan…' : 'Ubah PIN'}
      </Button>
    </form>
  );
}
