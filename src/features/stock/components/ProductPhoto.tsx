import { useProductPhoto } from '../photo/use-product-photo';
import { BlobImage } from './BlobImage';

type ProductPhotoProps = {
  productId: string;
  productName: string;
};

// Foto tidak wajib: tanpa foto atau saat gagal dibaca, bagian ini tidak menampilkan apa pun.
export function ProductPhoto({ productId, productName }: ProductPhotoProps) {
  const { data: photo } = useProductPhoto(productId);
  if (!photo) return null;

  return (
    <BlobImage
      blob={photo.blob}
      alt={productName}
      width={photo.width}
      height={photo.height}
      className="mb-4 h-auto max-h-64 w-auto max-w-full rounded-md border border-border"
    />
  );
}
