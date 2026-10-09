import { Link, useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import { getVisibleDestination } from '../help-destination';
import type { HelpTopicMeta } from '../types';
import { useHelpAccess } from '../use-help-access';

type HelpSheetFooterProps = {
  topic: HelpTopicMeta;
};

// Replace: modal sudah menjadi satu entri riwayat; tombol kembali dari halaman tujuan tidak boleh membukanya lagi.
export function HelpSheetFooter({ topic }: HelpSheetFooterProps) {
  const pathname = useLocation().pathname;
  const { isCashierMode } = useHelpAccess();
  const destination = getVisibleDestination(topic, isCashierMode, pathname);
  const showsAllTopics = pathname !== '/bantuan';

  if (!destination && !showsAllTopics) return null;

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row-reverse">
      {destination && (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to={destination.to} replace>
            {destination.label}
          </Link>
        </Button>
      )}
      {showsAllTopics && (
        <Button asChild variant="ghost" size="lg" className="w-full sm:mr-auto sm:w-auto">
          <Link to="/bantuan" replace>
            Semua topik
          </Link>
        </Button>
      )}
    </div>
  );
}
