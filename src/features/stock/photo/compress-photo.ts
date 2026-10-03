import { fitWithin } from './fit-within';

export const MAX_PHOTO_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTO_SIDE = 800;
const QUALITY = 0.8;

export type CompressedPhoto = {
  blob: Blob;
  width: number;
  height: number;
};

type PhotoErrorCode = 'NOT_AN_IMAGE' | 'TOO_LARGE' | 'UNREADABLE' | 'PRODUCT_NOT_FOUND';

const MESSAGES: Record<PhotoErrorCode, string> = {
  NOT_AN_IMAGE: 'File yang dipilih bukan gambar. Pilih foto berformat JPG, PNG, atau WebP.',
  TOO_LARGE: 'Ukuran file lebih dari 10 MB. Pilih foto yang lebih kecil.',
  UNREADABLE: 'Foto tidak bisa dibaca. Coba pilih foto lain.',
  PRODUCT_NOT_FOUND: 'Barang tidak ditemukan.',
};

export class PhotoError extends Error {
  readonly code: PhotoErrorCode;

  constructor(code: PhotoErrorCode) {
    super(MESSAGES[code]);
    this.name = 'PhotoError';
    this.code = code;
  }
}

type Draw = (context: CanvasDrawImage) => void;

async function encode(width: number, height: number, draw: Draw, type: string) {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new PhotoError('UNREADABLE');
    draw(context);
    return canvas.convertToBlob({ type, quality: QUALITY });
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new PhotoError('UNREADABLE');
  draw(context);
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, QUALITY);
  });
}

// Foto HP biasanya 3–8 MB; setelah dikecilkan menjadi sekitar 100–200 KB. WebP lebih dulu, JPEG bila browser tidak mendukung.
export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  if (!file.type.startsWith('image/')) throw new PhotoError('NOT_AN_IMAGE');
  if (file.size > MAX_PHOTO_FILE_BYTES) throw new PhotoError('TOO_LARGE');

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new PhotoError('UNREADABLE');
  });
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_PHOTO_SIDE);
    const draw: Draw = (context) => context.drawImage(bitmap, 0, 0, width, height);
    const webp = await encode(width, height, draw, 'image/webp');
    const blob = webp?.type === 'image/webp' ? webp : await encode(width, height, draw, 'image/jpeg');
    if (!blob) throw new PhotoError('UNREADABLE');
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}
