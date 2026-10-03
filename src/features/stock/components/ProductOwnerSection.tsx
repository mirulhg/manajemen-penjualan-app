import { Link } from 'react-router';

import type { Product } from '../schema';
import { PriceHistory } from './PriceHistory';
import { ProductArchiveSection } from './ProductArchiveSection';

type ProductOwnerSectionProps = {
  product: Product;
  locationState: unknown;
};

// Aksi dan riwayat harga beli/jual: hanya dirender untuk pemilik.
export function ProductOwnerSection({ product, locationState }: ProductOwnerSectionProps) {
  return (
    <>
      <Link
        to={`/stok/${product.id}/sesuaikan`}
        state={locationState}
        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-on-primary"
      >
        Sesuaikan stok
      </Link>
      <Link
        to={`/stok/${product.id}/ubah`}
        state={locationState}
        className="ml-2 mt-4 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 font-medium"
      >
        Ubah barang
      </Link>
      <ProductArchiveSection product={product} />
      <PriceHistory productId={product.id} />
    </>
  );
}
