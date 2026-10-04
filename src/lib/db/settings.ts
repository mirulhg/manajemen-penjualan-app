import { z } from 'zod';

import { db } from './database';
import { FALLBACK_DEFAULT_MIN_STOCK } from './stock-status';

const flagSchema = z.boolean();


// Belum pernah diatur berarti jual melebihi stok ditolak (stok tidak boleh negatif tanpa izin pemilik).
export async function getAllowOversell(): Promise<boolean> {
  const row = await db.settings.get('allowOversell');
  return row ? flagSchema.parse(row.value) : false;
}

export async function getCashierMode(): Promise<boolean> {
  const row = await db.settings.get('cashierMode');
  return row ? flagSchema.parse(row.value) : false;
}

export const OWNER_ACTOR = 'Pemilik';
export const CASHIER_ACTOR = 'Kasir';

// Mode Kasir dibaca di dalam transaksi penulisan (db.settings harus ada di scope), supaya pelaku tidak salah walau mode berganti di tab lain.
export async function getCurrentActor(): Promise<string> {
  return (await getCashierMode()) ? CASHIER_ACTOR : OWNER_ACTOR;
}

export async function getDefaultMinStock(): Promise<number> {
  const row = await db.settings.get('defaultMinStock');
  return row ? z.number().int().parse(row.value) : FALLBACK_DEFAULT_MIN_STOCK;
}

export type AlertPreferences = {
  alertsBellEnabled: boolean;
  dailySummaryEnabled: boolean;
  alertsInCashierMode: boolean;
  // Tanggal lokal (YYYY-MM-DD) ringkasan harian terakhir ditutup; null = belum pernah.
  dailySummaryDismissedOn: string | null;
};

export async function getAlertPreferences(): Promise<AlertPreferences> {
  const [bell, summary, inCashierMode, dismissedOn] = await Promise.all([
    db.settings.get('alertsBellEnabled'),
    db.settings.get('dailySummaryEnabled'),
    db.settings.get('alertsInCashierMode'),
    db.settings.get('dailySummaryDismissedOn'),
  ]);
  return {
    // Lonceng dan ringkasan aktif sejak awal; peringatan di Mode Kasir sengaja mati (isinya informasi belanja pemilik).
    alertsBellEnabled: bell ? flagSchema.parse(bell.value) : true,
    dailySummaryEnabled: summary ? flagSchema.parse(summary.value) : true,
    alertsInCashierMode: inCashierMode ? flagSchema.parse(inCashierMode.value) : false,
    dailySummaryDismissedOn: dismissedOn ? z.string().nullable().parse(dismissedOn.value) : null,
  };
}
