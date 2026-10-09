import { describe, expect, it } from 'vitest';

import { canCashierSeeAlerts } from './can-cashier-see-alerts';

describe('canCashierSeeAlerts', () => {
  it('hanya benar bila lonceng dan izin Mode Kasir sama-sama nyala', () => {
    expect(canCashierSeeAlerts({ alertsBellEnabled: true, alertsInCashierMode: true })).toBe(true);
    expect(canCashierSeeAlerts({ alertsBellEnabled: true, alertsInCashierMode: false })).toBe(false);
    expect(canCashierSeeAlerts({ alertsBellEnabled: false, alertsInCashierMode: true })).toBe(false);
    expect(canCashierSeeAlerts({ alertsBellEnabled: false, alertsInCashierMode: false })).toBe(false);
  });
});
