import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { SessionError } from '../api/session-error';
import { useResetPin } from '../api/use-session-mutations';
import { describeSessionError } from '../describe-session-error';
import { recoverySchema } from '../schema';
import type { RecoveryInput } from '../schema';
import { RecoveryFormFields } from './RecoveryFormFields';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type PinRecoveryFormProps = {
  onRecovered: (newRecoveryCode: string) => void;
  onCancel: () => void;
};

// "Lupa PIN?" di Pengaturan: memulihkan PIN dengan kode pemulihan tanpa keluar dari mode yang sedang aktif.
export function PinRecoveryForm({ onRecovered, onCancel }: PinRecoveryFormProps) {
  const { register, handleSubmit, setError, getValues, formState } = useForm<
    RecoveryInput,
    unknown,
    z.output<typeof recoverySchema>
  >({ resolver: zodResolver(recoverySchema), defaultValues: { code: '', newPin: '', confirmPin: '' } });
  const reset = useResetPin();
  const isSaving = formState.isSubmitting || reset.isPending;
  const hasUnexpectedError = reset.isError && !(reset.error instanceof SessionError);

  async function onSubmit() {
    const { code, newPin } = getValues();
    try {
      onRecovered(await reset.mutateAsync({ code, newPin }));
      toast.success('PIN diganti');
    } catch (error) {
      const message = describeSessionError(error);
      if (message) setError(error instanceof SessionError && error.code === 'INVALID_PIN_FORMAT' ? 'newPin' : 'code', { message });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <RecoveryFormFields register={register} errors={formState.errors} />
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Coba lagi.
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="lg" type="submit" disabled={isSaving}>
          {isSaving ? 'Memeriksa…' : 'Simpan PIN baru'}
        </Button>
        <Button size="lg" variant="outline" type="button" disabled={isSaving} onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}
