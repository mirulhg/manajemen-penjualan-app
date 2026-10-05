import { z } from 'zod';

import { paymentMethodSchema } from '../../lib/db/records';
import type { PaymentMethod } from '../../lib/db/records';
import { parsePeriodParams, PERIODS, resolvePeriodRange, serializePeriodParams } from '../../utils/date-period';
import type { Period } from '../../utils/date-period';
import { parsePageParam } from '../../utils/pagination';

// 12 bulan hanya ada di dasbor dan Bulan lalu hanya di laporan; Riwayat bertahan di pilihan harian sampai bulan ini.
export const SALE_PERIODS = PERIODS.filter((period) => period !== '12-bulan' && period !== 'bulan-lalu');

export type SaleFilters = {
  period: Period;
  from: string | null;
  to: string | null;
  method: PaymentMethod | null;
  actor: string | null;
  page: number;
};

const methodSchema = paymentMethodSchema.nullable().catch(null);
const textSchema = z.string().min(1).nullable().catch(null);

export function parseSaleFilters(params: URLSearchParams): SaleFilters {
  return {
    ...parsePeriodParams(params, SALE_PERIODS),
    method: methodSchema.parse(params.get('metode')),
    actor: textSchema.parse(params.get('kasir')),
    page: parsePageParam(params.get('halaman')),
  };
}

export function serializeSaleFilters(filters: SaleFilters): URLSearchParams {
  const params = serializePeriodParams(filters);
  if (filters.method) params.set('metode', filters.method);
  if (filters.actor) params.set('kasir', filters.actor);
  if (filters.page > 1) params.set('halaman', String(filters.page));
  return params;
}

export function resolveDateRange(filters: SaleFilters, now: Date): { start: Date; end: Date } {
  return resolvePeriodRange(filters, now);
}
