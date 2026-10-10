import type { ChangelogEntry, RoadmapItem } from './types';

// Di Mode Kasir poin khusus pemilik disembunyikan; entri yang semua poinnya tersembunyi ikut hilang.
export function getVisibleEntries(entries: readonly ChangelogEntry[], isCashierMode: boolean): ChangelogEntry[] {
  if (!isCashierMode) return [...entries];
  return entries
    .map((entry) => ({ ...entry, items: entry.items.filter((item) => !item.ownerOnly) }))
    .filter((entry) => entry.items.length > 0);
}

export function getVisibleRoadmap(items: readonly RoadmapItem[], isCashierMode: boolean): RoadmapItem[] {
  return isCashierMode ? items.filter((item) => !item.ownerOnly) : [...items];
}
