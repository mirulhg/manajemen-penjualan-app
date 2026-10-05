import { useState } from 'react';

import { buildRestockShareText } from '../../../lib/db/restock';
import type { RestockShareItem } from '../../../lib/db/restock';
import { useStoreProfile } from '../../store-profile';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ShareRestockButtonProps = {
  items: RestockShareItem[];
};

type ShareStatus = 'idle' | 'shared' | 'copied' | 'failed';

export function ShareRestockButton({ items }: ShareRestockButtonProps) {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const { data: profile } = useStoreProfile();
  // Diturunkan saat render: dipakai tombol bagikan dan tautan WhatsApp, tanpa menyimpan salinan di state.
  const shareText = buildRestockShareText(items, new Date(), profile?.name);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  async function handleShare() {
    if ('share' in navigator) {
      try {
        await navigator.share({ title: 'Daftar belanja barang', text: shareText });
        setStatus('shared');
        return;
      } catch (error) {
        // Pemilik membatalkan menu bagikan: bukan kesalahan, jangan ganti ke salin.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copyToClipboard();
  }

  return (
    <div className="space-y-2">
      <Button size="lg" type="button" onClick={() => void handleShare()}>
        Bagikan daftar
      </Button>
      {status === 'shared' && <p role="status">Daftar dibagikan.</p>}
      {status === 'copied' && <p role="status">Daftar disalin. Tempel di WhatsApp atau catatan.</p>}
      {status === 'failed' && (
        <Alert variant="destructive" className="p-3">
          Daftar tidak bisa disalin otomatis. Buka WhatsApp dengan tautan di bawah, atau salin daftar secara manual.
        </Alert>
      )}
      {(status === 'copied' || status === 'failed') && (
        <Button asChild variant="outline"><a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          Buka WhatsApp
        </a></Button>
      )}
    </div>
  );
}
