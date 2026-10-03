import { z } from 'zod';

import type { StockSort } from './sort-products';
import type { StockStatus } from './stock-status';

export type StockFilters = {
  query: string | null;
  category: string | null;
  status: StockStatus | null;
  sort: StockSort;
  // Barang diarsipkan disembunyikan secara bawaan; ?arsip=1 memunculkannya.
  archived: boolean;
};

const textParamSchema = z.string().min(1).nullable().catch(null);
const sortParamSchema = z.enum(['nama', 'stok-sedikit', 'stok-banyak', 'terbaru']).catch('nama');
const archivedParamSchema = z.literal('1').transform(() => true).catch(false);
const statusParamSchema = z.enum(['aman', 'menipis', 'habis']).nullable().catch(null);

// q tidak di-trim di sini: spasi di tengah kata kunci ("mi instan") harus bertahan selama mengetik.
export function parseFilterParams(params: URLSearchParams): StockFilters {
  return {
    query: textParamSchema.parse(params.get('q')),
    category: textParamSchema.parse(params.get('kategori')),
    status: statusParamSchema.parse(params.get('status')),
    sort: sortParamSchema.parse(params.get('urut')),
    archived: archivedParamSchema.parse(params.get('arsip')),
  };
}

export function serializeFilterParams(filters: StockFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('kategori', filters.category);
  if (filters.status) params.set('status', filters.status);
  // Urutan bawaan (nama) tidak ditulis ke URL.
  if (filters.sort !== 'nama') params.set('urut', filters.sort);
  if (filters.archived) params.set('arsip', '1');
  return params;
}
