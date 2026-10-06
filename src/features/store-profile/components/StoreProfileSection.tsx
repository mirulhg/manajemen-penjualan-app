import { useStoreProfile } from '../api/use-store-profile';
import { SectionCard } from '../../../components/ui/SectionCard';
import { StoreProfileForm } from './StoreProfileForm';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function StoreProfileSection() {
  const { data: profile, isPending, isError, refetch } = useStoreProfile();

  function handleRetry() {
    void refetch();
  }

  return (
    <SectionCard
      id="store-profile-heading"
      title="Profil toko"
      description="Nama, alamat, telepon, dan logo untuk kop laporan dan daftar belanja."
    >
      {isPending && (
        <div aria-hidden="true" className="space-y-3">
          <div className="h-11 rounded-md bg-border" />
          <div className="h-16 rounded-md bg-border" />
          <div className="h-11 rounded-md bg-border" />
        </div>
      )}
      {isError && (
        <Alert variant="destructive" className="p-3">
          <p>Profil toko tidak bisa dibaca dari penyimpanan di perangkat ini.</p>
          <Button size="lg" type="button" onClick={handleRetry}>
            Coba lagi
          </Button>
        </Alert>
      )}
      {!isPending && !isError && <StoreProfileForm profile={profile} />}
    </SectionCard>
  );
}
