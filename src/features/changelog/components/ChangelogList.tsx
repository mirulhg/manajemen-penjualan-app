import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RichText } from '@/components/ui/RichText';
import { formatLocalDate } from '@/utils/format-date-time';
import type { ChangelogEntry } from '../types';

type ChangelogListProps = {
  entries: readonly ChangelogEntry[];
  currentVersion: string;
};

export function ChangelogList({ entries, currentVersion }: ChangelogListProps) {
  return (
    <ul className="space-y-3">
      {entries.map((entry) => {
        const headingId = `changelog-${entry.latestVersion}`;
        return (
          <li key={entry.latestVersion}>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id={headingId} className="text-lg font-semibold">
                    {entry.versionLabel} — {entry.title}
                  </h2>
                  {entry.latestVersion === currentVersion && <Badge variant="accent">Versi Anda</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatLocalDate(entry.date)}
                  {entry.phaseLabel ? ` · ${entry.phaseLabel}` : ''}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-5 text-subtle-foreground">
                  {entry.items.map((item) => (
                    <li key={item.text}>
                      <RichText text={item.text} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
