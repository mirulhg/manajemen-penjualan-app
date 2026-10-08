import { describe, expect, it } from 'vitest';

import { describeRouteError } from './route-error';

const ONLINE = { isOnline: true, wasOfflineSinceLoad: false };
const OFFLINE = { isOnline: false, wasOfflineSinceLoad: true };
const RECONNECTED = { isOnline: true, wasOfflineSinceLoad: true };

const IMPORT_MESSAGES = [
  'Failed to fetch dynamically imported module: https://x.test/assets/Page-abc.js',
  'error loading dynamically imported module: https://x.test/assets/Page-abc.js',
  'Importing a module script failed.',
  'Unable to preload CSS for /assets/SettingsPage-abc.css',
];

describe('describeRouteError', () => {
  it('respons rute 404 menjadi not-found', () => {
    const response = { status: 404, statusText: 'Not Found', data: null, internal: true };
    expect(describeRouteError(response, ONLINE)).toBe('not-found');
  });

  it('respons rute selain 404 menjadi unexpected', () => {
    const response = { status: 500, statusText: 'Error', data: null, internal: true };
    expect(describeRouteError(response, ONLINE)).toBe('unexpected');
  });

  it.each(IMPORT_MESSAGES)('gagal impor "%s" saat online menjadi new-version', (message) => {
    expect(describeRouteError(new TypeError(message), ONLINE)).toBe('new-version');
  });

  it.each(IMPORT_MESSAGES)('gagal impor "%s" saat offline menjadi offline', (message) => {
    expect(describeRouteError(new TypeError(message), OFFLINE)).toBe('offline');
  });

  it.each(IMPORT_MESSAGES)('gagal impor "%s" setelah internet kembali menjadi reconnected', (message) => {
    expect(describeRouteError(new TypeError(message), RECONNECTED)).toBe('reconnected');
  });

  it('error biasa dan nilai bukan Error menjadi unexpected', () => {
    expect(describeRouteError(new Error('boom'), ONLINE)).toBe('unexpected');
    expect(describeRouteError('teks', OFFLINE)).toBe('unexpected');
    expect(describeRouteError(undefined, ONLINE)).toBe('unexpected');
  });
});
