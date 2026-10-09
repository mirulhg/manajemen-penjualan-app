// @vitest-environment jsdom
import { matchRoutes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { HELP_TOPICS } from '../features/help';
import type { HelpTopicMeta } from '../features/help';
import { routes } from './router';

const TOPICS: readonly HelpTopicMeta[] = HELP_TOPICS;

function getDestinations({ openPage }: HelpTopicMeta): string[] {
  if (!openPage) return [];
  return typeof openPage === 'string' ? [openPage] : [openPage.owner, openPage.cashier];
}

describe('tujuan "Buka halaman ini"', () => {
  const destinations = TOPICS.flatMap((topic) => getDestinations(topic).map((path) => ({ slug: topic.slug, path })));

  it('setiap topik yang punya tujuan menunjuk rute sungguhan, bukan rute 404', () => {
    expect(destinations.length).toBeGreaterThan(0);
    destinations.forEach(({ slug, path }) => {
      const matches = matchRoutes(routes, path);
      expect(matches, `${slug} → ${path}`).not.toBeNull();
      expect(matches?.at(-1)?.route.path, `${slug} → ${path}`).not.toBe('*');
    });
  });

  it('rute Bantuan ada: indeks dan satu topik', () => {
    expect(matchRoutes(routes, '/bantuan')?.at(-1)?.route.path).toBe('bantuan');
    expect(matchRoutes(routes, '/bantuan/kasir')?.at(-1)?.route.path).toBe('bantuan/:slug');
  });
});
