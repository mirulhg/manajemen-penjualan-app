import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { compressPhoto, PhotoError } from '../photo/compress-photo';
import type { PhotoDraft } from '../photo/photo-draft';
import { UNCHANGED_PHOTO } from '../photo/photo-draft';
import { useProductPhoto } from '../photo/use-product-photo';
import { BlobImage } from './BlobImage';
import { Label } from '@/components/ui/label';

type ProductPhotoFieldProps = {
  // Kosong untuk barang yang belum dibuat (form tambah barang).
  productId: string | null;
  productName: string;
  draft: PhotoDraft;
  onChange: (draft: PhotoDraft) => void;
};

export function ProductPhotoField({ productId, productName, draft, onChange }: ProductPhotoFieldProps) {
  const { data: stored } = useProductPhoto(productId ?? '');
  // Pesan penolakan dan status memproses hanya relevan untuk pemilihan file ini, jadi cukup state lokal.
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shown =
    draft.kind === 'replace' ? draft.photo : draft.kind === 'unchanged' && productId && stored ? stored : null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setMessage(null);
    setIsProcessing(true);
    try {
      onChange({ kind: 'replace', photo: await compressPhoto(file) });
    } catch (error) {
      setMessage(error instanceof PhotoError ? error.message : 'Foto tidak bisa diproses. Coba pilih foto lain.');
    } finally {
      setIsProcessing(false);
      input.value = '';
    }
  }

  function handleFileChangeEvent(event: ChangeEvent<HTMLInputElement>) {
    void handleFileChange(event);
  }

  function handleRemove() {
    setMessage(null);
    onChange(stored && productId ? { kind: 'remove' } : UNCHANGED_PHOTO);
  }

  return (
    <div>
      <Label htmlFor="product-photo">
        Foto barang (opsional)
      </Label>
      {shown && (
        <BlobImage
          blob={shown.blob}
          alt={`Pratinjau foto ${productName || 'barang'}`}
          width={shown.width}
          height={shown.height}
          className="my-2 h-auto max-h-48 w-auto max-w-full rounded-md border border-border"
        />
      )}
      {draft.kind === 'remove' && (
        <p className="my-2 text-muted-foreground">Foto akan dihapus saat perubahan disimpan.</p>
      )}
      <input
        id="product-photo"
        type="file"
        accept="image/*"
        onChange={handleFileChangeEvent}
        aria-describedby={message ? 'product-photo-error' : undefined}
        className="mt-1 block min-h-11 w-full"
      />
      {isProcessing && <p className="mt-1 text-sm text-muted-foreground">Memproses foto…</p>}
      {message && (
        <p id="product-photo-error" role="alert" className="mt-1 text-sm text-destructive">
          {message}
        </p>
      )}
      {shown && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 min-h-11 rounded-md border border-border bg-card px-4 font-medium"
        >
          Hapus foto
        </button>
      )}
    </div>
  );
}
