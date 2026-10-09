import type { Session } from './api/get-session';

// Satu syarat untuk lonceng, halaman Peringatan, ⌘K, dan panduan: kasir hanya boleh bila lonceng dan izin Mode Kasir sama-sama nyala.
export function canCashierSeeAlerts(session: Pick<Session, 'alertsBellEnabled' | 'alertsInCashierMode'>): boolean {
  return session.alertsBellEnabled && session.alertsInCashierMode;
}
