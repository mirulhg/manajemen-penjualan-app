import { HELP_TOPICS } from './help-topics';
import type { HelpBlock, HelpFaqItem, HelpFlags, HelpListItem, HelpSection, HelpTableRow, HelpTopicMeta } from './types';

export type HelpAccess = { isCashierMode: boolean; canCashierSeeAlerts: boolean };

export function isFlagVisible(flags: HelpFlags, isCashierMode: boolean): boolean {
  return isCashierMode ? !flags.ownerOnly : !flags.cashierOnly;
}

// Aturan satu-satunya untuk indeks, pencarian ⌘K, dan tombol "?".
export function canSeeTopic(topic: HelpTopicMeta, { isCashierMode, canCashierSeeAlerts }: HelpAccess): boolean {
  if (!isCashierMode) return true;
  if (topic.slug === 'peringatan') return canCashierSeeAlerts;
  return topic.audience === 'all';
}

export function getVisibleTopics(access: HelpAccess): HelpTopicMeta[] {
  return HELP_TOPICS.filter((topic) => canSeeTopic(topic, access));
}

function keepVisible<Item extends HelpFlags>(items: readonly Item[], isCashierMode: boolean): Item[] {
  return items.filter((item) => isFlagVisible(item, isCashierMode));
}

function filterBlock(block: HelpBlock, isCashierMode: boolean): HelpBlock | null {
  if (!isFlagVisible(block, isCashierMode)) return null;
  switch (block.type) {
    case 'paragraph':
      return block;
    case 'steps':
    case 'list': {
      const items: HelpListItem[] = keepVisible(block.items, isCashierMode);
      return items.length > 0 ? { ...block, items } : null;
    }
    case 'table': {
      const rows: HelpTableRow[] = keepVisible(block.rows, isCashierMode);
      return rows.length > 0 ? { ...block, rows } : null;
    }
    case 'faq': {
      const items: HelpFaqItem[] = keepVisible(block.items, isCashierMode);
      return items.length > 0 ? { ...block, items } : null;
    }
  }
}

// Menyaring bagian, butir, baris, dan tanya-jawab menurut mode; bagian yang jadi kosong ikut hilang.
export function filterSections(sections: readonly HelpSection[], isCashierMode: boolean): HelpSection[] {
  return keepVisible(sections, isCashierMode).flatMap((section) => {
    const blocks = section.blocks.flatMap((block) => filterBlock(block, isCashierMode) ?? []);
    return blocks.length > 0 ? [{ ...section, blocks }] : [];
  });
}
