import { isRouteErrorResponse } from 'react-router';

import type { OnlineStatus } from '../hooks/use-online-status';

export type RouteErrorKind = 'not-found' | 'new-version' | 'offline' | 'reconnected' | 'unexpected';

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

// Gagal impor saat offline berarti halaman belum pernah dimuat. Setelah internet kembali, router tidak mencoba ulang
// impor yang gagal, jadi itu bukan versi baru: cukup muat ulang. Hanya gagal impor tanpa riwayat offline yang berarti deploy baru.
export function describeRouteError(error: unknown, { isOnline, wasOfflineSinceLoad }: OnlineStatus): RouteErrorKind {
  if (isRouteErrorResponse(error) && error.status === 404) return 'not-found';
  if (isImportFailure(error)) {
    if (!isOnline) return 'offline';
    return wasOfflineSinceLoad ? 'reconnected' : 'new-version';
  }
  return 'unexpected';
}
