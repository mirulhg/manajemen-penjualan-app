import { ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { BlobImage, compressPhoto, PhotoError } from '../../stock';
import { LOGO_MAX_SIDE } from '../schema';
import type { LogoDraft, StoreLogo } from '../schema';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handlePickLogo() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    setMessage(null);
    onChange(storedLogo ? { kind: 'remove' } : { kind: 'unchanged' });
  }

  return (
    <div>
      <p className="text-sm font-medium">Logo toko (opsional)</p>
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
      {/* Input bawaan browser (teks Inggris) disembunyikan secara visual; tombol "Pilih logo" yang membukanya. */}
      <input
        ref={fileInputRef}
        id="store-logo"
        type="file"
        accept="image/*"
        aria-label="Logo toko (opsional)"
        tabIndex={-1}
        onChange={handleFileChangeEvent}
        aria-describedby={message ? 'store-logo-error' : undefined}
        className="sr-only"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" type="button" onClick={handlePickLogo} disabled={isProcessing}>
          <ImagePlus aria-hidden="true" />
          Pilih logo
        </Button>
        {shown && (
          <Button variant="ghost" type="button" onClick={handleRemove}>
            Hapus logo
          </Button>
        )}
      </div>
      {isProcessing && <p className="mt-1 text-sm text-muted-foreground">Memproses logo…</p>}
      {message && (
        <p id="store-logo-error" role="alert" className="mt-1 text-sm text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}
