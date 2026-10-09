// @vitest-environment jsdom
import { matchRoutes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { HELP_TOPICS } from '../features/help';
import type { HelpTopicMeta } from '../features/help';
import { routes } from './router';

const TOPICS: readonly HelpTopicMeta[] = HELP_TOPICS;

function getDestinations({ openPage }: HelpTopicMeta) {
  if (!openPage) return [];
  return 'owner' in openPage ? [openPage.owner, openPage.cashier] : [openPage];
}

describe('tujuan di kaki panduan', () => {
  const destinations = TOPICS.flatMap((topic) => getDestinations(topic).map((destination) => ({ slug: topic.slug, ...destination })));

  it('setiap topik yang punya tujuan menunjuk rute sungguhan, bukan rute 404', () => {
    expect(destinations.length).toBeGreaterThan(0);
    destinations.forEach(({ slug, to }) => {
      const matches = matchRoutes(routes, to);
      expect(matches, `${slug} → ${to}`).not.toBeNull();
      expect(matches?.at(-1)?.route.path, `${slug} → ${to}`).not.toBe('*');
    });
  });

  it('rute Bantuan ada: indeks dan satu topik', () => {
    expect(matchRoutes(routes, '/bantuan')?.at(-1)?.route.path).toBe('bantuan');
    expect(matchRoutes(routes, '/bantuan/kasir')?.at(-1)?.route.path).toBe('bantuan/:slug');
  });
});
