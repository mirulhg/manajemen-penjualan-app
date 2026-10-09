import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '../../../hooks/use-media-query';
import { findHelpTopic } from '../help-topics';
import { withoutHelpParam } from '../help-sheet-url';
import { canSeeTopic } from '../help-visibility';
import { useHelpAccess } from '../use-help-access';
import { useHelpSheet } from '../use-help-sheet';
import { HelpSheetFooter } from './HelpSheetFooter';
import { HelpSheetHeader } from './HelpSheetHeader';
import { HelpTopicContent } from './HelpTopicContent';

type HelpTopicSheetProps = {
  slug: string;
};

const DESKTOP_QUERY = '(min-width: 48rem)';

export function HelpTopicSheet({ slug }: HelpTopicSheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const access = useHelpAccess();
  const location = useLocation();
  const locationState: unknown = location.state;
  const { close } = useHelpSheet();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  // Modal ini tidak punya Trigger Radix, jadi fokus dikembalikan sendiri ke pembuka (tombol "?", baris indeks).
  const [opener] = useState(() => document.activeElement);
  const topic = findHelpTopic(slug);

  // Slug tak dikenal atau tak boleh dilihat (mis. topik pemilik di Mode Kasir): buang parameternya, tampilkan apa pun.
  if (!topic || !canSeeTopic(topic, access)) {
    return <Navigate to={{ search: withoutHelpParam(location.search) }} replace state={locationState} />;
  }

  function handleCloseAutoFocus(event: Event) {
    event.preventDefault();
    if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
  }

  const body = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <HelpTopicContent slug={topic.slug} headingLevel="h3" />
      </div>
      <HelpSheetFooter topic={topic} />
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(isOpen) => !isOpen && close()}>
        <DialogContent showCloseButton={false} onCloseAutoFocus={handleCloseAutoFocus} className="flex max-h-5/6 flex-col gap-0 p-0 sm:max-w-2xl">
          <HelpSheetHeader
            title={<DialogTitle className="text-xl leading-tight">{topic.title}</DialogTitle>}
            description={<DialogDescription className="sr-only">{topic.summary}</DialogDescription>}
            onClose={close}
          />
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  // Drawer menutup alamat setelah animasi geser selesai, supaya tidak hilang mendadak.
  return (
    <Drawer
      open={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
      onAnimationEnd={(isOpen) => !isOpen && close()}
    >
      <DrawerContent onCloseAutoFocus={handleCloseAutoFocus} className="data-[vaul-drawer-direction=bottom]:max-h-11/12">
        <HelpSheetHeader
          title={<DrawerTitle className="text-xl leading-tight">{topic.title}</DrawerTitle>}
          description={<DrawerDescription className="sr-only">{topic.summary}</DrawerDescription>}
          onClose={() => setIsDrawerOpen(false)}
        />
        {body}
      </DrawerContent>
    </Drawer>
  );
}
