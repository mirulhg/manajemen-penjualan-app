import { useState } from 'react';

import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { useProducts } from '../api/use-products';
import { useImportProducts } from '../import/use-import-products';
import type { ImportRow } from '../import/to-import-rows';
import { validateImportRows } from '../import/validate-import-rows';
import { ImportFilePicker } from './ImportFilePicker';
import { ImportPreview } from './ImportPreview';
import { ImportResult } from './ImportResult';
import { NewProductSkeleton } from './NewProductSkeleton';
import { StockListError } from './StockListError';
import { Card, CardContent } from '@/components/ui/card';

const HEADING = 'Impor Barang';

export function ImportProductsPage() {
  // Satu-satunya state: hasil membaca file. Pratinjau dan laporan diturunkan darinya.
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const products = useProducts();
  const mutation = useImportProducts();

  function handleChooseOther() {
    setRows(null);
    mutation.reset();
  }

  function handleRetry() {
    void products.refetch();
  }

  function renderContent() {
    if (rows === null) {
      return (
        <Card>
          <CardContent>
            <ImportFilePicker onRowsRead={setRows} />
          </CardContent>
        </Card>
      );
    }
    if (products.isPending) return <NewProductSkeleton />;
    if (products.isError) return <StockListError error={products.error} onRetry={handleRetry} />;

    // Rincian "gagal" tidak bergantung pada isi toko, jadi laporan akhir tetap benar setelah barang masuk.
    const validation = validateImportRows(rows, products.data);
    if (mutation.isSuccess) {
      const { failed } = validateImportRows(rows, []);
      const skippedCount = rows.length - failed.length - mutation.data.imported;
      return (
        <ImportResult
          imported={mutation.data.imported}
          skippedCount={skippedCount}
          failed={failed}
          onImportAnother={handleChooseOther}
        />
      );
    }
    return (
      <ImportPreview
        validation={validation}
        isPending={mutation.isPending}
        hasError={mutation.isError}
        onImport={() => mutation.mutate(validation.ready)}
        onChooseOther={handleChooseOther}
      />
    );
  }

  return (
    <SubpageLayout title={HEADING} heading={HEADING} backTo="/stok" backLabel="Kembali ke daftar stok">
      {renderContent()}
    </SubpageLayout>
  );
}
