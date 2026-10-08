import { RefreshCw, TriangleAlert, WifiOff } from 'lucide-react';
import { useRouteError } from 'react-router';

import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { HomeLinkButton } from './HomeLinkButton';
import { NotFound } from './NotFound';
import { describeRouteError } from './route-error';

// Tidak lazy: layar ini harus tampil justru saat chunk halaman gagal diunduh.
export function RouteError() {
  const error = useRouteError();
  const kind = describeRouteError(error, navigator.onLine);

  if (kind === 'not-found') return <NotFound />;

  if (kind === 'new-version') {
    return (
      <ErrorScreen
        icon={RefreshCw}
        title="Versi baru tersedia"
        description="Aplikasi baru saja diperbarui. Muat ulang untuk memakai versi terbaru; data toko tetap aman."
      >
        <ReloadButton />
      </ErrorScreen>
    );
  }

  if (kind === 'offline') {
    return (
      <ErrorScreen
        icon={WifiOff}
        title="Tidak ada koneksi internet"
        description="Halaman ini belum pernah dibuka sejak aplikasi dimuat, jadi perlu internet untuk menampilkannya. Data toko tetap aman di perangkat ini. Sambungkan internet dulu, lalu tekan Coba lagi."
      >
        <ReloadButton label="Coba lagi" />
        <HomeLinkButton variant="outline" />
      </ErrorScreen>
    );
  }

  return (
    <ErrorScreen
      icon={TriangleAlert}
      title="Terjadi kesalahan di halaman ini"
      description="Ada yang tidak berjalan semestinya. Data yang sudah tersimpan tidak terpengaruh. Muat ulang halaman; kalau terus terjadi, catat langkah terakhir yang dilakukan beserta detail teknis di bawah."
      detail={error instanceof Error ? error.message : String(error)}
    >
      <ReloadButton />
      <HomeLinkButton variant="outline" />
    </ErrorScreen>
  );
}
