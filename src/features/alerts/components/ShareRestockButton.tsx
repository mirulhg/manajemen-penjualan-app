import { useState } from 'react';

import { buildRestockShareText } from '../../../lib/db/restock';
import type { RestockShareItem } from '../../../lib/db/restock';
import { useStoreProfile } from '../../store-profile';

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
      <button
        type="button"
        onClick={() => void handleShare()}
        className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
      >
        Bagikan daftar
      </button>
      {status === 'shared' && <p role="status">Daftar dibagikan.</p>}
      {status === 'copied' && <p role="status">Daftar disalin. Tempel di WhatsApp atau catatan.</p>}
      {status === 'failed' && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Daftar tidak bisa disalin otomatis. Buka WhatsApp dengan tautan di bawah, atau salin daftar secara manual.
        </p>
      )}
      {(status === 'copied' || status === 'failed') && (
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-medium text-primary underline"
        >
          Buka WhatsApp
        </a>
      )}
    </div>
  );
}
