import { useSession } from '../session';
import type { HelpAccess } from './help-visibility';

// Syarat yang sama dengan item "Peringatan" di ⌘K: kasir hanya boleh bila lonceng dan izin Mode Kasir sama-sama nyala.
export function useHelpAccess(): HelpAccess {
  const { isCashierMode, alertsBellEnabled, alertsInCashierMode } = useSession();
  return { isCashierMode, canCashierSeeAlerts: alertsBellEnabled && alertsInCashierMode };
}
