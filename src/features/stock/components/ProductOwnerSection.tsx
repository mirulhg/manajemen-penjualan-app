import { Link } from 'react-router';

import type { Product } from '../schema';
import { PriceHistory } from './PriceHistory';
import { ProductArchiveSection } from './ProductArchiveSection';
import { Button } from '@/components/ui/button';

type ProductOwnerSectionProps = {
  product: Product;
  locationState: unknown;
};

// Aksi dan riwayat harga beli/jual: hanya dirender untuk pemilik.
export function ProductOwnerSection({ product, locationState }: ProductOwnerSectionProps) {
  return (
    <>
      <Button asChild size="lg" className="mt-4"><Link to={`/stok/${product.id}/sesuaikan`} state={locationState}>
        Sesuaikan stok
      </Link></Button>
      <Button asChild variant="outline" className="ml-2 mt-4"><Link to={`/stok/${product.id}/ubah`} state={locationState}>
        Ubah barang
      </Link></Button>
      <ProductArchiveSection product={product} />
      <PriceHistory productId={product.id} />
    </>
  );
}
