// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Skeleton } from './Skeleton';

type FadeOptions = { duration: number };

const { animate } = vi.hoisted(() => ({
  animate: vi.fn<(element: Element, keyframes: unknown, options: FadeOptions) => { stop: () => void }>(() => ({ stop: vi.fn() })),
}));
vi.mock('motion/mini', () => ({ animate }));

function renderSkeleton() {
  return render(
    <Skeleton label="Memuat contoh">
      <div data-testid="bentuk" />
    </Skeleton>,
  );
}

function Page({ isLoading }: { isLoading: boolean }): ReactNode {
  return (
    <main>
      {isLoading ? (
        <Skeleton label="Memuat contoh">
          <div data-testid="bentuk" />
        </Skeleton>
      ) : (
        <p>isi</p>
      )}
    </main>
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('Skeleton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    animate.mockClear();
    Element.prototype.animate = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('data siap sebelum 300ms: bentuk skeleton tidak pernah tampil', () => {
    const { unmount } = renderSkeleton();

    advance(299);
    expect(screen.queryByTestId('bentuk')).toBeNull();
    unmount();
    advance(1000);
    expect(screen.queryByTestId('bentuk')).toBeNull();
  });

  it('memuat lebih dari 300ms: bentuk skeleton tampil, tersembunyi dari pembaca layar', () => {
    renderSkeleton();

    advance(300);
    expect(screen.getByTestId('bentuk').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('teks status untuk pembaca layar selalu ada, bahkan sebelum bentuk tampil', () => {
    renderSkeleton();

    expect(screen.getByRole('status').textContent).toBe('Memuat contoh');
  });

  it('skeleton sempat tampil: isi pengganti memudar masuk 200ms', async () => {
    const { rerender } = render(<Page isLoading />);
    advance(300);

    rerender(<Page isLoading={false} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[0]?.[0].textContent).toBe('isi');
    expect(animate.mock.calls[0]?.[2].duration).toBe(0.2);
  });

  it('skeleton tidak sempat tampil: isi langsung muncul tanpa animasi', async () => {
    const { rerender } = render(<Page isLoading />);
    advance(100);

    rerender(<Page isLoading={false} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(animate).not.toHaveBeenCalled();
  });
});
