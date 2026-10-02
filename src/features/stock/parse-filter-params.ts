import { z } from 'zod';

import type { StockStatus } from './stock-status';

export type StockFilters = {
  query: string | null;
  category: string | null;
  status: StockStatus | null;
};

const textParamSchema = z.string().min(1).nullable().catch(null);
const statusParamSchema = z.enum(['aman', 'menipis', 'habis']).nullable().catch(null);

// q tidak di-trim di sini: spasi di tengah kata kunci ("mi instan") harus bertahan selama mengetik.
export function parseFilterParams(params: URLSearchParams): StockFilters {
  return {
    query: textParamSchema.parse(params.get('q')),
    category: textParamSchema.parse(params.get('kategori')),
    status: statusParamSchema.parse(params.get('status')),
  };
}

export function serializeFilterParams(filters: StockFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('kategori', filters.category);
  if (filters.status) params.set('status', filters.status);
  return params;
}
