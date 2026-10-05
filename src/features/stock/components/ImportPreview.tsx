import { formatNumber } from '../../../utils/format-number';
import type { ImportValidation } from '../import/validate-import-rows';
import { ImportFailedRowsTable } from './ImportFailedRowsTable';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ImportPreviewProps = {
  validation: ImportValidation;
  isPending: boolean;
  hasError: boolean;
  onImport: () => void;
  onChooseOther: () => void;
};

const SAMPLE_COUNT = 5;

export function ImportPreview({ validation, isPending, hasError, onImport, onChooseOther }: ImportPreviewProps) {
  const { ready, skipped, failed } = validation;
  const readyCount = formatNumber(ready.length);

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold">
        Siap diimpor {readyCount} · Dilewati {formatNumber(skipped.length)} · Gagal {formatNumber(failed.length)}
      </p>
      {failed.length > 0 && <ImportFailedRowsTable failed={failed} />}
      {skipped.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Dilewati</h3>
          <ul className="space-y-1 text-sm">
            {skipped.map((row) => (
              <li key={row.rowNumber}>
                Baris {row.rowNumber}: SKU sudah ada: {row.productName}
              </li>
            ))}
          </ul>
        </div>
      )}
      {ready.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Contoh barang yang akan diimpor</h3>
          <ul className="space-y-1 text-sm">
            {ready.slice(0, SAMPLE_COUNT).map(({ rowNumber, product }) => (
              <li key={rowNumber}>
                {product.sku} · {product.name} · {product.category} · stok {formatNumber(product.initialStock)}{' '}
                {product.unit}
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal dan tidak ada barang yang tersimpan. Coba impor lagi.
        </Alert>
      )}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" type="button" onClick={onImport} disabled={ready.length === 0 || isPending}>
          {isPending ? 'Mengimpor…' : `Impor ${readyCount} barang`}
        </Button>
        <Button variant="outline" type="button" onClick={onChooseOther} disabled={isPending}>
          Pilih file lain
        </Button>
      </div>
    </div>
  );
}
