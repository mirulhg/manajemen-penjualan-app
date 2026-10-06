import type { StockSort } from '../sort-products';
import type { StockStatus } from '../stock-status';

export const STATUS_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'aman', label: 'Aman' },
  { value: 'menipis', label: 'Menipis' },
  { value: 'habis', label: 'Habis' },
];

export const SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: 'nama', label: 'Nama A–Z' },
  { value: 'stok-sedikit', label: 'Stok paling sedikit' },
  { value: 'stok-banyak', label: 'Stok paling banyak' },
  { value: 'terbaru', label: 'Terakhir diperbarui' },
];

export function parseSort(value: string): StockSort {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? 'nama';
}

export function parseStatus(value: string): StockStatus | null {
  return STATUS_OPTIONS.find((option) => option.value === value)?.value ?? null;
}
