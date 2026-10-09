import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { OwnerOnly } from '../../session';
import { Button } from '@/components/ui/button';
import { SubpageLayout } from '@/components/layout/SubpageLayout';
import { HELP_CONTENT } from '../help-content';
import { findHelpTopic } from '../help-topics';
import { canSeeTopic, filterSections } from '../help-visibility';
import type { HelpTopicMeta } from '../types';
import { useHelpAccess } from '../use-help-access';
import { HelpBlocks } from './HelpBlocks';

function getOpenPage(topic: HelpTopicMeta, isCashierMode: boolean): string | null {
  if (!topic.openPage) return null;
  if (typeof topic.openPage === 'string') return topic.openPage;
  return isCashierMode ? topic.openPage.cashier : topic.openPage.owner;
}

type HelpTopicPageProps = {
  // Layar 404 milik aplikasi; fitur tidak boleh mengimpor app/.
  notFound: ReactNode;
};

export function HelpTopicPage({ notFound }: HelpTopicPageProps) {
  const { slug = '' } = useParams();
  const access = useHelpAccess();
  const topic = findHelpTopic(slug);

  if (!topic) return notFound;
  // Topik yang tak boleh dilihat kasir memakai layar yang sama dengan halaman pemilik lain.
  if (!canSeeTopic(topic, access)) return <OwnerOnly>{null}</OwnerOnly>;

  const sections = filterSections(HELP_CONTENT[topic.slug], access.isCashierMode);
  const openPage = getOpenPage(topic, access.isCashierMode);

  return (
    <SubpageLayout title={topic.title} heading={topic.title} back={{ to: '/bantuan', label: 'Semua topik' }}>
      <div className="max-w-prose space-y-6">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <HelpBlocks blocks={section.blocks} />
          </section>
        ))}
        {openPage && (
          <Button asChild variant="outline">
            <Link to={openPage}>Buka halaman ini</Link>
          </Button>
        )}
      </div>
    </SubpageLayout>
  );
}
