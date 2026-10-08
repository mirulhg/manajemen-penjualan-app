import { MapPinOff } from 'lucide-react';

import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { HomeLinkButton } from './HomeLinkButton';

export function NotFound() {
  return (
    <ErrorScreen
      icon={MapPinOff}
      title="Halaman tidak ditemukan"
      description="Alamat ini tidak ada di aplikasi. Mungkin salah ketik, atau tautannya sudah lama."
    >
      <HomeLinkButton />
    </ErrorScreen>
  );
}
