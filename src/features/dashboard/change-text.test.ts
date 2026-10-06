import { describe, expect, it } from 'vitest';

import { describeChange, describePeriodTrend } from './change-text';

describe('describeChange', () => {
  it('naik dan turun ditulis sebagai teks dengan satu desimal format id-ID', () => {
    expect(describeChange(162_000, 136_000)).toBe('naik 19,1%');
    expect(describeChange(95_000, 100_000)).toBe('turun 5,0%');
    expect(describeChange(0, 136_000)).toBe('turun 100,0%');
  });

  it('kemarin 0 tidak pernah menghasilkan Infinity atau NaN', () => {
    expect(describeChange(5_000, 0)).toBe('baru ada hari ini');
    expect(describeChange(0, 0)).toBe('sama');
    expect(describeChange(-2_000, 0)).toBe('turun dari nol');
  });

  it('nilai sama atau selisih yang membulat ke 0,0% dianggap sama', () => {
    expect(describeChange(1_000, 1_000)).toBe('sama');
    expect(describeChange(1_000_001, 1_000_000)).toBe('sama');
  });

  it('laba negatif kemarin memakai nilai mutlak sebagai pembagi', () => {
    expect(describeChange(0, -10_000)).toBe('naik 100,0%');
  });
});

describe('describePeriodTrend', () => {
  it('angka periode sample: 7 hari dan 30 hari dibanding periode sebelumnya', () => {
    expect(describePeriodTrend(920_500, 1_542_500)).toEqual({ text: 'turun 40,3%', direction: 'down' });
    expect(describePeriodTrend(28, 38)).toEqual({ text: 'turun 26,3%', direction: 'down' });
    expect(describePeriodTrend(5_524_500, 5_689_500)).toEqual({ text: 'turun 2,9%', direction: 'down' });
    expect(describePeriodTrend(162_000, 136_000)).toEqual({ text: 'naik 19,1%', direction: 'up' });
  });

  it('periode sebelumnya kosong atau sama tidak membagi dengan nol', () => {
    expect(describePeriodTrend(5_000, 0)).toEqual({ text: 'baru ada di periode ini', direction: 'up' });
    expect(describePeriodTrend(0, 0)).toEqual({ text: 'sama', direction: 'flat' });
  });
});
