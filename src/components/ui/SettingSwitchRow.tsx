import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type SettingSwitchRowProps = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// Baris 44px: label dan deskripsi di kiri (label ikut menjadi area ketuk), switch di kanan.
export function SettingSwitchRow({ id, label, description, checked, disabled, onCheckedChange }: SettingSwitchRowProps) {
  return (
    <div className="flex min-h-11 items-start justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id}>{label}</Label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-describedby={`${id}-description`}
        className="mt-0.5"
      />
    </div>
  );
}
