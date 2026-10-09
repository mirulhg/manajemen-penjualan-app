import { canCashierSeeAlerts, useSession } from '../session';
import type { HelpAccess } from './help-visibility';

export function useHelpAccess(): HelpAccess {
  const session = useSession();
  return { isCashierMode: session.isCashierMode, canCashierSeeAlerts: canCashierSeeAlerts(session) };
}
