import { Button } from '@/components/ui/button';

type ReloadButtonProps = {
  label?: string;
  variant?: 'default' | 'outline';
};

export function ReloadButton({ label = 'Muat ulang', variant = 'default' }: ReloadButtonProps) {
  function handleReload() {
    window.location.reload();
  }

  return (
    <Button type="button" size="lg" variant={variant} onClick={handleReload}>
      {label}
    </Button>
  );
}
