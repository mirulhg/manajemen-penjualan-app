import { useStoreProfile } from '../api/use-store-profile';
import { StoreProfileForm } from './StoreProfileForm';

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
        <div role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          <p>Profil toko tidak bisa dibaca dari penyimpanan di perangkat ini.</p>
          <button type="button" onClick={handleRetry} className="min-h-11 font-medium underline">
            Coba lagi
          </button>
        </div>
      )}
      {!isPending && !isError && <StoreProfileForm profile={profile} />}
    </section>
  );
}
