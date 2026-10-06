import { describe, expect, it } from 'vitest';

import { listItemMotion } from './motion';

describe('listItemMotion', () => {
  it('daftar sampai 50 item memakai layout animation', () => {
    expect(listItemMotion(50)).toMatchObject({ layout: true });
  });

  it('daftar lebih dari 50 item tidak memakai layout maupun gerak keluar', () => {
    expect(listItemMotion(51)).toEqual({});
  });
});
