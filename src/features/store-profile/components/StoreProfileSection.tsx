import { useStoreProfile } from '../api/use-store-profile';
import { StoreProfileForm } from './StoreProfileForm';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function StoreProfileSection() {
  const { data: profile, isPending, isError, refetch } = useStoreProfile();

  function handleRetry() {
    void refetch();
  }

  return (
    <section aria-labelledby="store-profile-heading" className="space-y-3">
      <h2 id="store-profile-heading" className="text-lg font-semibold">
        Profil toko
      </h2>
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
    </section>
  );
}
