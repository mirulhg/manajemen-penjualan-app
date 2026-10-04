import { db } from '../../../lib/db/database';

export type AlertFlagKey = 'alertsBellEnabled' | 'dailySummaryEnabled' | 'alertsInCashierMode';

export async function setAlertFlag(key: AlertFlagKey, value: boolean): Promise<void> {
  await db.settings.put({ key, value });
}

// Tanggal lokal (YYYY-MM-DD) ringkasan harian ditutup; besok tanggalnya berbeda, jadi kartu muncul lagi.
export async function dismissDailySummary(dateKey: string): Promise<void> {
  await db.settings.put({ key: 'dailySummaryDismissedOn', value: dateKey });
}
