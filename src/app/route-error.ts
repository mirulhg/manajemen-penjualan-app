import { isRouteErrorResponse } from 'react-router';

export type RouteErrorKind = 'not-found' | 'new-version' | 'offline' | 'unexpected';

// Pesan gagal impor modul dinamis: Chrome, Firefox, Safari, dan pemuatan CSS halaman oleh Vite.
const IMPORT_FAILURE_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Unable to preload CSS',
];

function isImportFailure(error: unknown) {
  return error instanceof Error && IMPORT_FAILURE_PATTERNS.some((pattern) => error.message.includes(pattern));
}

// Gagal impor saat online berarti file lama sudah hilang setelah deploy; saat offline berarti halaman belum pernah dimuat.
export function describeRouteError(error: unknown, isOnline: boolean): RouteErrorKind {
  if (isRouteErrorResponse(error) && error.status === 404) return 'not-found';
  if (isImportFailure(error)) return isOnline ? 'new-version' : 'offline';
  return 'unexpected';
}
