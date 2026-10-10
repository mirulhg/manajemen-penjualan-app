export type ChangelogItem = { text: string; ownerOnly?: true };

export type ChangelogEntry = {
  kind: 'version' | 'phase';
  phaseLabel?: string;
  versionLabel: string;
  // Versi terbaru dalam entri; entri fase merangkum beberapa versi.
  latestVersion: string;
  // Tanggal lokal YYYY-MM-DD.
  date: string;
  title: string;
  items: readonly ChangelogItem[];
};

export type RoadmapStatus = 'next' | 'planned' | 'considering';

export type RoadmapItem = {
  status: RoadmapStatus;
  title: string;
  description: string;
  ownerOnly?: true;
};
