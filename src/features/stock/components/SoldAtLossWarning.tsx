import { parseRupiah } from '../../../utils/parse-rupiah';

type SoldAtLossWarningProps = {
  purchasePriceText: string;
  sellingPriceText: string;
};

// Peringatan non-blokir: menjual di bawah harga beli tetap boleh disimpan (barang obral).
export function SoldAtLossWarning({ purchasePriceText, sellingPriceText }: SoldAtLossWarningProps) {
  const purchasePrice = parseRupiah(purchasePriceText);
  const sellingPrice = parseRupiah(sellingPriceText);
  const isSoldAtLoss =
    purchasePrice !== null && sellingPrice !== null && sellingPrice > 0 && sellingPrice < purchasePrice;
  if (!isSoldAtLoss) return null;

  return (
    <p className="rounded-md bg-status-menipis-bg p-3 text-status-menipis-text">
      Harga jual lebih rendah dari harga beli. Barang ini akan dijual rugi.
    </p>
  );
}
