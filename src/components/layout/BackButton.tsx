import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

type BackButtonProps = {
  to: string;
  // Nama aksesibel; ikon saja tidak cukup untuk pembaca layar.
  label: string;
  // Diteruskan agar filter dan urutan daftar sebelumnya bertahan.
  state?: unknown;
};

export function BackButton({ to, label, state }: BackButtonProps) {
  return (
    <Button asChild variant="ghost" size="icon" className="-ml-2 shrink-0">
      <Link to={to} state={state} aria-label={label}>
        <ChevronLeft aria-hidden="true" />
      </Link>
    </Button>
  );
}
