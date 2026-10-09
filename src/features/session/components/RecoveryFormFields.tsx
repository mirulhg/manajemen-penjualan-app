import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import type { RecoveryInput } from '../schema';
import { PinField } from './PinField';
import { Input } from '@/components/ui/input';

type RecoveryFormFieldsProps = {
  register: UseFormRegister<RecoveryInput>;
  errors: FieldErrors<RecoveryInput>;
};

export function RecoveryFormFields({ register, errors }: RecoveryFormFieldsProps) {
  return (
    <>
      <FormField id="recovery-code" label="Kode pemulihan" error={errors.code?.message}>
        {(control) => <Input type="text" autoComplete="off" className="mt-1" {...control} {...register('code')} />}
      </FormField>
      <PinField id="new-pin" label="PIN baru" hint="4–6 angka." error={errors.newPin?.message} registration={register('newPin')} />
      <PinField id="confirm-pin" label="Isi ulang PIN baru" error={errors.confirmPin?.message} registration={register('confirmPin')} />
    </>
  );
}
