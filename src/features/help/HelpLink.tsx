import { CircleQuestionMark } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { findHelpTopic } from './help-topics';
import type { HelpTopicSlug } from './help-topics';
import { canSeeTopic } from './help-visibility';
import { useHelpAccess } from './use-help-access';

type HelpLinkProps = {
  topic: HelpTopicSlug;
};

// Diletakkan tepat di kanan judul halaman. Tanpa animasi: halaman Kasir tidak boleh memuat Motion.
export function HelpLink({ topic }: HelpLinkProps) {
  const access = useHelpAccess();
  const meta = findHelpTopic(topic);

  if (!meta || !canSeeTopic(meta, access)) return null;

  return (
    <Button asChild variant="ghost" size="icon" className="print:hidden">
      <Link to={`/bantuan/${meta.slug}`} aria-label={`Bantuan: ${meta.title}`}>
        <CircleQuestionMark aria-hidden="true" />
      </Link>
    </Button>
  );
}
