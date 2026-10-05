import { Link } from 'react-router';

import { BlobImage } from '../../stock';
import { useStoreProfile } from '../../store-profile';

// Kop dipakai ulang oleh semua laporan. Tanpa profil, kop memakai "Toko Saya" dan layar menyarankan melengkapinya.
export function StoreLetterhead() {
  const { data: profile, isPending, isError } = useStoreProfile();
  const name = profile?.name ?? 'Toko Saya';
  const needsProfile = !isPending && !isError && profile === null;

  return (
    <div>
      {needsProfile && (
        <p className="mb-3 rounded-md border border-border bg-card p-3 text-sm print:hidden">
          Isi profil toko di{' '}
          <Link to="/pengaturan" className="font-medium text-primary underline">
            Pengaturan
          </Link>{' '}
          agar kop laporan lengkap.
        </p>
      )}
      <header className="flex items-center gap-4 border-b border-border pb-3">
        {profile?.logo && (
          <BlobImage
            blob={profile.logo.blob}
            alt={`Logo ${name}`}
            width={profile.logo.width}
            height={profile.logo.height}
            className="h-16 w-auto max-w-24 object-contain"
          />
        )}
        <div>
          <p className="text-lg font-semibold">{name}</p>
          {profile?.address && <p className="text-sm">{profile.address}</p>}
          {profile?.phone && <p className="text-sm">Telp. {profile.phone}</p>}
        </div>
      </header>
    </div>
  );
}
