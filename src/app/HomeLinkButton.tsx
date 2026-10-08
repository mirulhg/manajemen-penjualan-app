import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { useSession } from '../features/session';

type HomeLinkButtonProps = {
  variant?: 'default' | 'outline';
};

// Tujuan sama dengan HomeRedirect: pemilik ke Dasbor, kasir ke Kasir.
export function HomeLinkButton({ variant = 'default' }: HomeLinkButtonProps) {
  const { isCashierMode } = useSession();

  return (
    <Button asChild size="lg" variant={variant}>
      <Link to={isCashierMode ? '/kasir' : '/dasbor'}>{isCashierMode ? 'Ke Kasir' : 'Ke Dasbor'}</Link>
    </Button>
  );
}
