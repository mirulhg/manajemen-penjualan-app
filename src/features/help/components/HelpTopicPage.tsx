import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router';

import { OwnerOnly } from '../../session';
import { Button } from '@/components/ui/button';
import { SubpageLayout } from '@/components/layout/SubpageLayout';
import { getVisibleDestination } from '../help-destination';
import { findHelpTopic } from '../help-topics';
import { canSeeTopic } from '../help-visibility';
import { useHelpAccess } from '../use-help-access';
import { HelpTopicContent } from './HelpTopicContent';

type HelpTopicPageProps = {
  // Layar 404 milik aplikasi; fitur tidak boleh mengimpor app/.
  notFound: ReactNode;
};

export function HelpTopicPage({ notFound }: HelpTopicPageProps) {
  const { slug = '' } = useParams();
  const access = useHelpAccess();
  const pathname = useLocation().pathname;
  const topic = findHelpTopic(slug);

  if (!topic) return notFound;
  // Topik yang tak boleh dilihat kasir memakai layar yang sama dengan halaman pemilik lain.
  if (!canSeeTopic(topic, access)) return <OwnerOnly>{null}</OwnerOnly>;

  const destination = getVisibleDestination(topic, access.isCashierMode, pathname);

  return (
    <SubpageLayout title={topic.title} heading={topic.title} back={{ to: '/bantuan', label: 'Semua topik' }}>
      <div className="max-w-prose space-y-6">
        <HelpTopicContent slug={topic.slug} headingLevel="h2" />
        {destination && (
          <Button asChild size="lg">
            <Link to={destination.to}>{destination.label}</Link>
          </Button>
        )}
      </div>
    </SubpageLayout>
  );
}
