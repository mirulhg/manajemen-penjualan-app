import { CircleQuestionMark } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { findHelpTopic } from './help-topics';
import type { HelpTopicSlug } from './help-topics';
import { canSeeTopic } from './help-visibility';
import { useHelpAccess } from './use-help-access';
import { useHelpSheet } from './use-help-sheet';

type HelpLinkProps = {
  topic: HelpTopicSlug;
};

// Diletakkan tepat di kanan judul halaman. Membuka panduan sebagai modal di atas halaman ini (?bantuan=…).
// Tanpa animasi: halaman Kasir tidak boleh memuat Motion.
export function HelpLink({ topic }: HelpLinkProps) {
  const access = useHelpAccess();
  const { getOpenTarget } = useHelpSheet();
  const meta = findHelpTopic(topic);

  if (!meta || !canSeeTopic(meta, access)) return null;

  const target = getOpenTarget(meta.slug);

  return (
    <Button asChild variant="ghost" size="icon" className="print:hidden">
      <Link to={{ search: target.search }} state={target.state} aria-label={`Bantuan: ${meta.title}`}>
        <CircleQuestionMark aria-hidden="true" />
      </Link>
    </Button>
  );
}
