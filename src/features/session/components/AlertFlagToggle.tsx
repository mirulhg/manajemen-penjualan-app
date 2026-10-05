import type { ChangeEvent } from 'react';

import { useSetAlertFlag } from '../api/use-session-mutations';
import type { AlertFlagKey } from '../api/set-alert-preference';
import { Alert } from '@/components/ui/alert';

type AlertFlagToggleProps = {
  flag: AlertFlagKey;
  checked: boolean;
  label: string;
  description: string;
};

export function AlertFlagToggle({ flag, checked, label, description }: AlertFlagToggleProps) {
  const mutation = useSetAlertFlag();

  function handleToggle(event: ChangeEvent<HTMLInputElement>) {
    mutation.mutate({ key: flag, value: event.target.checked });
  }

  return (
    <div>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" checked={checked} disabled={mutation.isPending} onChange={handleToggle} />
        {label}
      </label>
      <p className="text-sm text-muted-foreground">{description}</p>
      {mutation.isError && (
        <Alert variant="destructive" className="mt-1 p-3">
          Pengaturan gagal disimpan. Coba lagi.
        </Alert>
      )}
    </div>
  );
}
