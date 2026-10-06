import { toast } from 'sonner';

import { useSetAlertFlag } from '../api/use-session-mutations';
import type { AlertFlagKey } from '../api/set-alert-preference';
import { SettingSwitchRow } from '../../../components/ui/SettingSwitchRow';
import { Alert } from '@/components/ui/alert';

type AlertFlagToggleProps = {
  flag: AlertFlagKey;
  checked: boolean;
  label: string;
  description: string;
};

export function AlertFlagToggle({ flag, checked, label, description }: AlertFlagToggleProps) {
  const mutation = useSetAlertFlag();

  function handleToggle(value: boolean) {
    mutation.mutate(
      { key: flag, value },
      { onSuccess: () => toast.success(`${label}: ${value ? 'aktif' : 'nonaktif'}`) },
    );
  }

  return (
    <div>
      <SettingSwitchRow
        id={`alert-flag-${flag}`}
        label={label}
        description={description}
        checked={checked}
        disabled={mutation.isPending}
        onCheckedChange={handleToggle}
      />
      {mutation.isError && (
        <Alert variant="destructive" className="mt-1 p-3">
          Pengaturan gagal disimpan. Coba lagi.
        </Alert>
      )}
    </div>
  );
}
