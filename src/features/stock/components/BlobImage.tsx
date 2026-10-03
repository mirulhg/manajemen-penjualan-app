import { useEffect, useRef } from 'react';

type BlobImageProps = {
  blob: Blob;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export function BlobImage({ blob, alt, width, height, className }: BlobImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  // Sinkronisasi dengan sistem di luar React: siklus hidup object URL browser (createObjectURL/revokeObjectURL).
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const url = URL.createObjectURL(blob);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return <img ref={imageRef} alt={alt} width={width} height={height} className={className} />;
}
