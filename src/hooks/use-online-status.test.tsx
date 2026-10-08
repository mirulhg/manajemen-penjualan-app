// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Status disimpan di tingkat modul, jadi setiap test memuat modul baru.
async function loadHook() {
  vi.resetModules();
  const { useOnlineStatus } = await import('./use-online-status');
  return renderHook(() => useOnlineStatus());
}

beforeEach(() => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useOnlineStatus', () => {
  it('awalnya online tanpa riwayat offline', async () => {
    const { result } = await loadHook();

    expect(result.current).toEqual({ isOnline: true, wasOfflineSinceLoad: false });
  });

  it('event offline lalu online: isOnline mengikuti, wasOfflineSinceLoad tetap true', async () => {
    const { result } = await loadHook();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toEqual({ isOnline: false, wasOfflineSinceLoad: true });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toEqual({ isOnline: true, wasOfflineSinceLoad: true });
  });

  it('offline yang terjadi sebelum ada komponen terpasang tetap tercatat', async () => {
    vi.resetModules();
    const { useOnlineStatus } = await import('./use-online-status');
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toEqual({ isOnline: true, wasOfflineSinceLoad: true });
  });

  it('dimuat saat sudah offline: langsung tercatat pernah offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = await loadHook();

    expect(result.current).toEqual({ isOnline: false, wasOfflineSinceLoad: true });
  });
});
