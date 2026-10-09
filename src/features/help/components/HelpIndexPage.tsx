import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { HELP_GROUPS } from '../help-topics';
import { getVisibleTopics } from '../help-visibility';
import { useHelpAccess } from '../use-help-access';

export function HelpIndexPage() {
  const topics = getVisibleTopics(useHelpAccess());

  return (
    <section className="space-y-6">
      <title>Bantuan · Manajemen Stok</title>
      <div>
        <h1 className="text-xl font-semibold">Bantuan</h1>
        <p className="mt-1 text-muted-foreground">Panduan memakai aplikasi, per fitur.</p>
      </div>
      {HELP_GROUPS.map((group) => {
        const groupTopics = topics.filter((topic) => topic.group === group.id);
        if (groupTopics.length === 0) return null;
        return (
          <section key={group.id} aria-labelledby={`help-group-${group.id}`} className="space-y-2">
            <h2 id={`help-group-${group.id}`} className="text-lg font-semibold">
              {group.title}
            </h2>
            <ul className="space-y-2">
              {groupTopics.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    to={`/bantuan/${topic.slug}`}
                    className="tap-row flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-4 py-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{topic.title}</span>
                      <span className="block text-sm text-muted-foreground">{topic.summary}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
