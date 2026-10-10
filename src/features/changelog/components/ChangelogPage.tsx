import { useRef } from 'react';
import { useSearchParams } from 'react-router';

import { HelpLink } from '../../help';
import { useSession } from '../../session';
import { useMarkChangelogSeen } from '../api/use-changelog-seen';
import { CHANGELOG_ENTRIES } from '../changelog-entries';
import { ROADMAP_ITEMS } from '../roadmap-items';
import { getVisibleEntries, getVisibleRoadmap } from '../visibility';
import { ChangelogList } from './ChangelogList';
import { CHANGELOG_PANEL_ID, ChangelogTabs, changelogTabId } from './ChangelogTabs';
import type { ChangelogTab } from './ChangelogTabs';
import { RoadmapList } from './RoadmapList';

export function ChangelogPage() {
  const { isCashierMode } = useSession();
  const [searchParams] = useSearchParams();
  const markSeen = useMarkChangelogSeen();
  const hasMarked = useRef(false);
  const activeTab: ChangelogTab = searchParams.get('tab') === 'segera-hadir' ? 'segera-hadir' : 'baru';

  // Membuka halaman = versi ini sudah dilihat. Callback ref (bukan useEffect) dengan penjaga, pola yang sama dengan halaman Peringatan.
  function handlePageRef(element: HTMLElement | null) {
    if (!element || hasMarked.current) return;
    hasMarked.current = true;
    markSeen.mutate();
  }

  return (
    <section ref={handlePageRef} className="space-y-4">
      <title>Pembaruan · Manajemen Stok</title>
      <div>
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-semibold">Pembaruan</h1>
          <HelpLink topic="pembaruan" />
        </div>
        <p className="mt-1 text-muted-foreground">
          Anda memakai versi <strong>{__APP_VERSION__}</strong>.
        </p>
      </div>
      <ChangelogTabs active={activeTab} />
      <div role="tabpanel" id={CHANGELOG_PANEL_ID} aria-labelledby={changelogTabId(activeTab)}>
        {activeTab === 'baru' ? (
          <ChangelogList entries={getVisibleEntries(CHANGELOG_ENTRIES, isCashierMode)} currentVersion={__APP_VERSION__} />
        ) : (
          <RoadmapList items={getVisibleRoadmap(ROADMAP_ITEMS, isCashierMode)} />
        )}
      </div>
    </section>
  );
}
