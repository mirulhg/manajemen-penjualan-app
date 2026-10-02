import { MAX_ADJUSTMENT_QUANTITY } from './schema';
import type { StockAdjustmentInput } from './schema';

type AdjustmentPreview = {
  quantityAfter: number;
  delta: number;
};

// null bila jumlah belum valid, supaya pratinjau tidak menampilkan angka yang tidak bisa disimpan.
export function getAdjustmentPreview(
  type: StockAdjustmentInput['type'],
  currentQuantity: number,
  quantityText: string,
): AdjustmentPreview | null {
  const text = quantityText.trim();
  if (!/^\d+$/.test(text)) return null;

  const quantity = Number(text);
  if (quantity > MAX_ADJUSTMENT_QUANTITY) return null;
  if (type === 'masuk' && quantity < 1) return null;

  const quantityAfter = type === 'masuk' ? currentQuantity + quantity : quantity;
  return { quantityAfter, delta: quantityAfter - currentQuantity };
}
