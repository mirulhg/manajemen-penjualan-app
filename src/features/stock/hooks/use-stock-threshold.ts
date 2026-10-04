import { useSession } from '../../session';

// Satu-satunya jalan bagi tampilan stok ke batas default toko, supaya semua status stok memakai nilai yang sama.
export function useStockThreshold(): number {
  return useSession().defaultMinStock;
}
