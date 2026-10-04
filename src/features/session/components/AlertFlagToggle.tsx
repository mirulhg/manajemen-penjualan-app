import type { ChangeEvent } from 'react';

import { useSetAlertFlag } from '../api/use-session-mutations';
import type { AlertFlagKey } from '../api/set-alert-preference';

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
      <p className="text-sm text-text-muted">{description}</p>
      {mutation.isError && (
        <p role="alert" className="mt-1 rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Pengaturan gagal disimpan. Coba lagi.
        </p>
      )}
    </div>
  );
}
