import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { RoadmapItem, RoadmapStatus } from '../types';

type RoadmapListProps = {
  items: readonly RoadmapItem[];
};

const GROUPS: readonly { status: RoadmapStatus; title: string }[] = [
  { status: 'next', title: 'Berikutnya' },
  { status: 'planned', title: 'Direncanakan' },
  { status: 'considering', title: 'Dipertimbangkan' },
];

export function RoadmapList({ items }: RoadmapListProps) {
  return (
    <div className="space-y-6">
      <p className="text-accent-text">{'Rencana dapat berubah. Fitur yang sudah tersedia akan pindah ke "Apa yang baru".'}</p>
      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.status === group.status);
        if (groupItems.length === 0) return null;
        const headingId = `roadmap-${group.status}`;
        return (
          <section key={group.status} aria-labelledby={headingId} className="space-y-2">
            <h2 id={headingId} className="text-lg font-semibold">
              {group.title}
            </h2>
            <ul className="space-y-2">
              {groupItems.map((item) => (
                <li key={item.title}>
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">{item.title}</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-subtle-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
