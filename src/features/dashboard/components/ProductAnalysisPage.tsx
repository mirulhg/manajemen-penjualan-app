import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { ProductAnalysisContent } from './ProductAnalysisContent';

export function ProductAnalysisPage() {
  return (
    <SubpageLayout title="Analisis Produk" heading="Analisis Produk" backTo="/dasbor" backLabel="Kembali ke dasbor">
      <ProductAnalysisContent />
    </SubpageLayout>
  );
}
