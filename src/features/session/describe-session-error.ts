import { formatClock } from '../../utils/format-date-time';
import { SessionError } from './api/session-error';

// Pesan untuk kegagalan PIN/kode; kegagalan lain (penyimpanan) tidak ditangani di sini.
export function describeSessionError(error: unknown): string | null {
  if (!(error instanceof SessionError)) return null;
  if (error.code === 'WRONG_PIN') return `PIN salah. Sisa percobaan ${error.remainingAttempts ?? 0}.`;
  if (error.code === 'LOCKED' && error.lockedUntil) {
    return `Terlalu banyak percobaan. Coba lagi setelah pukul ${formatClock(error.lockedUntil)}.`;
  }
  return error.message;
}
