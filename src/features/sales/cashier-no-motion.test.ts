import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const COMPONENTS_DIR = path.join(import.meta.dirname, 'components');
const CASHIER_FILE_PATTERN = /^(Cashier|CartLine|PayBar|PayDrawer|ProductSearch)(?!.*\.test\.)/;

describe('Kasir tetap CSS saja', () => {
  it('tidak ada berkas kasir yang mengimpor motion', () => {
    const cashierFiles = readdirSync(COMPONENTS_DIR).filter((file) => CASHIER_FILE_PATTERN.test(file));

    expect(cashierFiles.length).toBeGreaterThan(5);
    for (const file of cashierFiles) {
      expect(readFileSync(path.join(COMPONENTS_DIR, file), 'utf8'), file).not.toMatch(/from ['"]motion/);
    }
  });
});
