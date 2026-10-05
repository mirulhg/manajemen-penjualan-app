import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { BlobImage, compressPhoto, PhotoError } from '../../stock';
import { LOGO_MAX_SIDE } from '../schema';
import type { LogoDraft, StoreLogo } from '../schema';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type StoreLogoFieldProps = {
  storedLogo: StoreLogo | null;
  draft: LogoDraft;
  onChange: (draft: LogoDraft) => void;
};

export function StoreLogoField({ storedLogo, draft, onChange }: StoreLogoFieldProps) {
  // Pesan penolakan dan status memproses hanya relevan untuk pemilihan file ini, jadi cukup state lokal.
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shown = draft.kind === 'replace' ? draft.logo : draft.kind === 'unchanged' ? storedLogo : null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setMessage(null);
    setIsProcessing(true);
    try {
      onChange({ kind: 'replace', logo: await compressPhoto(file, LOGO_MAX_SIDE) });
    } catch (error) {
      setMessage(error instanceof PhotoError ? error.message : 'Logo tidak bisa diproses. Coba pilih gambar lain.');
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
    onChange(storedLogo ? { kind: 'remove' } : { kind: 'unchanged' });
  }

  return (
    <div>
      <Label htmlFor="store-logo">
        Logo toko (opsional)
      </Label>
      {shown && (
        <BlobImage
          blob={shown.blob}
          alt="Pratinjau logo toko"
          width={shown.width}
          height={shown.height}
          className="my-2 h-auto max-h-24 w-auto max-w-full rounded-md border border-border"
        />
      )}
      {draft.kind === 'remove' && <p className="my-2 text-muted-foreground">Logo akan dihapus saat perubahan disimpan.</p>}
      <input
        id="store-logo"
        type="file"
        accept="image/*"
        onChange={handleFileChangeEvent}
        aria-describedby={message ? 'store-logo-error' : undefined}
        className="mt-1 block min-h-11 w-full"
      />
      {isProcessing && <p className="mt-1 text-sm text-muted-foreground">Memproses logo…</p>}
      {message && (
        <p id="store-logo-error" role="alert" className="mt-1 text-sm text-destructive">
          {message}
        </p>
      )}
      {shown && (
        <Button variant="outline" className="mt-2" type="button" onClick={handleRemove}>
          Hapus logo
        </Button>
      )}
    </div>
  );
}
