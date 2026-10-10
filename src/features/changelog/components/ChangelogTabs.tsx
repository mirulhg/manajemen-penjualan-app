import { Link } from 'react-router';

import { cn } from '@/lib/utils';

export type ChangelogTab = 'baru' | 'segera-hadir';

type ChangelogTabsProps = {
  active: ChangelogTab;
};

const TABS: readonly { id: ChangelogTab; label: string; search: string }[] = [
  { id: 'baru', label: 'Apa yang baru', search: '' },
  { id: 'segera-hadir', label: 'Segera hadir', search: '?tab=segera-hadir' },
];

export const CHANGELOG_PANEL_ID = 'changelog-panel';

export function changelogTabId(tab: ChangelogTab): string {
  return `changelog-tab-${tab}`;
}

// Tautan (bukan state) supaya tombol kembali browser memulihkan tab sebelumnya. CSS saja, tanpa Motion.
export function ChangelogTabs({ active }: ChangelogTabsProps) {
  return (
    <div role="tablist" aria-label="Pembaruan" className="flex gap-1 rounded-md bg-secondary p-1">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            id={changelogTabId(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={CHANGELOG_PANEL_ID}
            to={{ search: tab.search }}
            preventScrollReset
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center rounded-sm px-2 text-sm font-medium transition-colors duration-(--duration-fast) ease-out',
              isActive ? 'border border-border bg-card text-foreground' : 'text-muted-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
