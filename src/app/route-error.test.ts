import { describe, expect, it } from 'vitest';

import { describeRouteError } from './route-error';

const IMPORT_MESSAGES = [
  'Failed to fetch dynamically imported module: https://x.test/assets/Page-abc.js',
  'error loading dynamically imported module: https://x.test/assets/Page-abc.js',
  'Importing a module script failed.',
  'Unable to preload CSS for /assets/SettingsPage-abc.css',
];

describe('describeRouteError', () => {
  it('respons rute 404 menjadi not-found', () => {
    const response = { status: 404, statusText: 'Not Found', data: null, internal: true };
    expect(describeRouteError(response, true)).toBe('not-found');
  });

  it('respons rute selain 404 menjadi unexpected', () => {
    const response = { status: 500, statusText: 'Error', data: null, internal: true };
    expect(describeRouteError(response, true)).toBe('unexpected');
  });

  it.each(IMPORT_MESSAGES)('gagal impor "%s" saat online menjadi new-version', (message) => {
    expect(describeRouteError(new TypeError(message), true)).toBe('new-version');
  });

  it.each(IMPORT_MESSAGES)('gagal impor "%s" saat offline menjadi offline', (message) => {
    expect(describeRouteError(new TypeError(message), false)).toBe('offline');
  });

  it('error biasa dan nilai bukan Error menjadi unexpected', () => {
    expect(describeRouteError(new Error('boom'), true)).toBe('unexpected');
    expect(describeRouteError('teks', false)).toBe('unexpected');
    expect(describeRouteError(undefined, true)).toBe('unexpected');
  });
});
