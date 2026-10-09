import { CircleQuestionMark } from 'lucide-react';

import { getVisibleTopics } from '../../features/help';
import type { HelpAccess } from '../../features/help';
import { CommandGroup, CommandItem } from '@/components/ui/command';
import { matchesQuery } from './palette-pages';

type PaletteHelpGroupProps = {
  query: string;
  access: HelpAccess;
  onOpenHelp: (slug: string) => void;
};

const MAX_RESULTS = 5;

// Hanya muncul setelah mengetik: tanpa kata cari, daftar awal cukup berisi halaman dan aksi.
export function PaletteHelpGroup({ query, access, onOpenHelp }: PaletteHelpGroupProps) {
  if (query.trim() === '') return null;

  const topics = getVisibleTopics(access)
    .filter((topic) => matchesQuery(query, topic.title, topic.keywords))
    .slice(0, MAX_RESULTS);
  if (topics.length === 0) return null;

  return (
    <CommandGroup heading="Bantuan">
      {topics.map((topic) => (
        <CommandItem key={topic.slug} value={`bantuan-${topic.slug}`} onSelect={() => onOpenHelp(topic.slug)} className="min-h-11">
          <CircleQuestionMark aria-hidden="true" />
          {topic.title}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
