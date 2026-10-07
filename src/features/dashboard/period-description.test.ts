import { describe, expect, it } from 'vitest';

import { PERIODS } from '../../utils/date-period';
import { describePeriodComparison } from './period-description';

describe('describePeriodComparison', () => {
  it('7 hari: menyebut pembandingnya', () => {
    expect(describePeriodComparison('7-hari')).toBe('7 hari terakhir dibanding 7 hari sebelumnya');
  });

  it('setiap periode punya keterangan yang memuat kata "dibanding"', () => {
    for (const period of PERIODS) expect(describePeriodComparison(period)).toContain('dibanding');
  });
});
