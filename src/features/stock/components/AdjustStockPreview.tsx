import { formatNumber } from '../../../utils/format-number';

type AdjustStockPreviewProps = {
  quantityAfter: number;
  delta: number;
  unit: string;
};

export function AdjustStockPreview({ quantityAfter, delta, unit }: AdjustStockPreviewProps) {
  if (delta === 0) {
    return <p className="text-muted-foreground">Sama dengan stok sekarang</p>;
  }

  const sign = delta > 0 ? '+' : '−';

  return (
    <p>
      Stok menjadi{' '}
      <strong>
        {formatNumber(quantityAfter)} {unit}
      </strong>{' '}
      ({sign}
      {formatNumber(Math.abs(delta))})
    </p>
  );
}
