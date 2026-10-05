import { Link } from 'react-router';

import { ProductAnalysisContent } from './ProductAnalysisContent';
import { Button } from '@/components/ui/button';

export function ProductAnalysisPage() {
  return (
    <section>
      <title>Analisis Produk · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Analisis Produk</h1>
      <Button asChild variant="ghost" className="mb-4"><Link to="/dasbor">
        Kembali ke dasbor
      </Link></Button>
      <ProductAnalysisContent />
    </section>
  );
}
