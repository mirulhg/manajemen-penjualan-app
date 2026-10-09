import { HelpLink } from '../../help';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { ProductAnalysisContent } from './ProductAnalysisContent';

export function ProductAnalysisPage() {
  return (
    <SubpageLayout title="Analisis Produk" heading="Analisis Produk" action={<HelpLink topic="analisis-produk" />} back={{ to: '/dasbor', label: 'Kembali ke dasbor' }}>
      <ProductAnalysisContent />
    </SubpageLayout>
  );
}
