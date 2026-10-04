import { Link } from 'react-router';

import { ProductAnalysisContent } from './ProductAnalysisContent';

export function ProductAnalysisPage() {
  return (
    <section>
      <title>Analisis Produk · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Analisis Produk</h1>
      <Link to="/dasbor" className="mb-4 inline-flex min-h-11 items-center font-medium text-primary">
        Kembali ke dasbor
      </Link>
      <ProductAnalysisContent />
    </section>
  );
}
