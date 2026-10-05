import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const OLD_TOKENS = [
  /(?<![\w-])bg-surface(?![\w-])/,
  /(?<![\w-])text-text(?![\w-])/,
  /(?<![\w-])text-text-muted(?![\w-])/,
  /(?<![\w-])text-on-primary(?![\w-])/,
  /(?<![\w-])stroke-text-muted(?![\w-])/,
  /(?<![\w-])bg-text-muted(?![\w-])/,
  /(?<![\w-])border-surface(?![\w-])/,
  /(?<![\w-])stroke-primary(?![\w-])/,
  /--color-(focus|surface|text|text-muted|on-primary)\b/,
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !name.endsWith('old-tokens.test.ts') ? [path] : [];
  });
}

describe('migrasi nama token tema', () => {
  it('tidak ada kelas atau variabel token lama di src/', () => {
    const offenders = sourceFiles(join(import.meta.dirname, '..')).flatMap((path) => {
      const content = readFileSync(path, 'utf8');
      return OLD_TOKENS.filter((token) => token.test(content)).map((token) => `${path}: ${token}`);
    });

    expect(offenders).toEqual([]);
  });
});
