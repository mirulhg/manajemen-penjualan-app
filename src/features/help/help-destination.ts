import type { HelpDestination, HelpTopicMeta } from './types';

export function getDestination(topic: HelpTopicMeta, isCashierMode: boolean): HelpDestination | null {
  const { openPage } = topic;
  if (!openPage) return null;
  if ('owner' in openPage) return isCashierMode ? openPage.cashier : openPage.owner;
  return openPage;
}

// Tombol tujuan tidak berguna bila pengguna sudah berada di halaman itu.
export function getVisibleDestination(topic: HelpTopicMeta, isCashierMode: boolean, pathname: string): HelpDestination | null {
  const destination = getDestination(topic, isCashierMode);
  return destination && destination.to !== pathname ? destination : null;
}
