import { describe, expect, it } from 'vitest';

import { describeChange } from './change-text';

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
