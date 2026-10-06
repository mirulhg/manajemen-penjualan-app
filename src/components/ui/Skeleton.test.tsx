// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Skeleton } from './Skeleton';

function renderSkeleton() {
  return render(
    <Skeleton label="Memuat contoh">
      <div data-testid="bentuk" />
    </Skeleton>,
  );
}

describe('Skeleton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('data siap sebelum 300ms: bentuk skeleton tidak pernah tampil', () => {
    const { unmount } = renderSkeleton();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.queryByTestId('bentuk')).toBeNull();
    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByTestId('bentuk')).toBeNull();
  });

  it('memuat lebih dari 300ms: bentuk skeleton tampil, tersembunyi dari pembaca layar', () => {
    renderSkeleton();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('bentuk').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('teks status untuk pembaca layar selalu ada, bahkan sebelum bentuk tampil', () => {
    renderSkeleton();

    expect(screen.getByRole('status').textContent).toBe('Memuat contoh');
  });
});
