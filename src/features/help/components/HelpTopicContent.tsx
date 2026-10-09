import { HELP_CONTENT } from '../help-content';
import type { HelpTopicSlug } from '../help-topics';
import { filterSections } from '../help-visibility';
import { useHelpAccess } from '../use-help-access';
import { HelpBlocks } from './HelpBlocks';

type HelpTopicContentProps = {
  slug: HelpTopicSlug;
  // Halaman penuh: judul topik h1, bagian h2. Modal: judul topik h2, bagian h3.
  headingLevel: 'h2' | 'h3';
};

const NOTES_HEADING = 'Perlu diketahui';

export function HelpTopicContent({ slug, headingLevel: Heading }: HelpTopicContentProps) {
  const sections = filterSections(HELP_CONTENT[slug], useHelpAccess().isCashierMode);

  return (
    <div className="max-w-prose space-y-6">
      {sections.map((section) => (
        <section
          key={section.heading}
          className={section.heading === NOTES_HEADING ? 'space-y-3 rounded-md bg-secondary px-4 py-3' : 'space-y-3'}
        >
          <Heading className="text-lg font-semibold">{section.heading}</Heading>
          <HelpBlocks blocks={section.blocks} />
        </section>
      ))}
    </div>
  );
}
