import { Navigate } from 'react-router';

import { useSession } from '../features/session';

// Pemilik langsung melihat performa toko; kasir di Mode Kasir langsung ke layar kasir.
export function HomeRedirect() {
  const { isCashierMode } = useSession();
  return <Navigate to={isCashierMode ? '/kasir' : '/dasbor'} replace />;
}
