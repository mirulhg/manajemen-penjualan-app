import { z } from 'zod';

import { paymentMethodSchema } from '../../lib/db/records';
import type { PaymentMethod } from '../../lib/db/records';
import { parsePageParam } from '../../utils/pagination';

export const SALE_PERIODS = ['hari-ini', 'kemarin', '7-hari', 'bulan-ini', 'rentang'] as const;
export type SalePeriod = (typeof SALE_PERIODS)[number];

export type SaleFilters = {
  period: SalePeriod;
  from: string | null;
  to: string | null;
  method: PaymentMethod | null;
  actor: string | null;
  page: number;
};

const DATE_TEXT = /^\d{4}-\d{2}-\d{2}$/;

// Tanggal lokal "YYYY-MM-DD" yang benar-benar ada di kalender (tidak "2026-02-31").
function parseLocalDate(text: string | null): Date | null {
  if (text === null || !DATE_TEXT.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

const periodSchema = z.enum(SALE_PERIODS).catch('hari-ini');
const methodSchema = paymentMethodSchema.nullable().catch(null);
const textSchema = z.string().min(1).nullable().catch(null);

export function parseSaleFilters(params: URLSearchParams): SaleFilters {
  const from = parseLocalDate(params.get('dari')) ? params.get('dari') : null;
  const to = parseLocalDate(params.get('sampai')) ? params.get('sampai') : null;
  const requested = periodSchema.parse(params.get('periode'));
  // Rentang butuh kedua tanggal valid dan berurutan; kalau tidak, kembali ke bawaan.
  const isUsableRange = from !== null && to !== null && from <= to;
  return {
    period: requested === 'rentang' && !isUsableRange ? 'hari-ini' : requested,
    from,
    to,
    method: methodSchema.parse(params.get('metode')),
    actor: textSchema.parse(params.get('kasir')),
    page: parsePageParam(params.get('halaman')),
  };
}

export function serializeSaleFilters(filters: SaleFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.period !== 'hari-ini') params.set('periode', filters.period);
  if (filters.period === 'rentang') {
    if (filters.from) params.set('dari', filters.from);
    if (filters.to) params.set('sampai', filters.to);
  }
  if (filters.method) params.set('metode', filters.method);
  if (filters.actor) params.set('kasir', filters.actor);
  if (filters.page > 1) params.set('halaman', String(filters.page));
  return params;
}

function startOfDay(date: Date, dayOffset = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset);
}

// Rentang berdasarkan tanggal lokal perangkat: awal hari (inklusif) sampai awal hari berikutnya (eksklusif).
export function resolveDateRange(filters: SaleFilters, now: Date): { start: Date; end: Date } {
  switch (filters.period) {
    case 'hari-ini':
      return { start: startOfDay(now), end: startOfDay(now, 1) };
    case 'kemarin':
      return { start: startOfDay(now, -1), end: startOfDay(now) };
    case '7-hari':
      return { start: startOfDay(now, -6), end: startOfDay(now, 1) };
    case 'bulan-ini':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case 'rentang': {
      const from = parseLocalDate(filters.from) ?? startOfDay(now);
      const to = parseLocalDate(filters.to) ?? from;
      return { start: from, end: startOfDay(to, 1) };
    }
  }
}
