// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PageEnter } from './PageEnter';

function fireInput(type: 'keydown' | 'pointerdown') {
  window.dispatchEvent(new Event(type));
}

type AnimateOptions = { delay: number };

const { animate } = vi.hoisted(() => ({
  animate: vi.fn((_element: Element, _keyframes: unknown, options: AnimateOptions) => ({ stop: vi.fn(), delay: options.delay })),
}));
vi.mock('motion/mini', () => ({ animate }));

function renderPage(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <PageEnter>
        <section>
          <h1>Judul</h1>
          <p>Isi</p>
        </section>
      </PageEnter>
    </MemoryRouter>,
  );
}

describe('PageEnter', () => {
  afterEach(cleanup);

  beforeEach(() => {
    animate.mockClear();
    // jsdom tidak punya Web Animations API; PageEnter melewatinya bila elemen tidak bisa dianimasikan.
    Element.prototype.animate = vi.fn();
    fireInput('pointerdown');
  });

  it('halaman biasa: tiap blok tingkat atas masuk bergantian dengan jeda 40ms', () => {
    renderPage('/stok');

    expect(animate).toHaveBeenCalledTimes(2);
    const delays = animate.mock.calls.map(([, , options]) => options.delay);
    expect(delays).toEqual([0, 0.04]);
  });

  it('Kasir tidak dianimasikan sama sekali', () => {
    renderPage('/kasir');

    expect(animate).not.toHaveBeenCalled();
  });

  it('dibuka lewat keyboard atau palette: tampil langsung tanpa gerak', () => {
    fireInput('keydown');
    renderPage('/stok');

    expect(animate).not.toHaveBeenCalled();
  });
});
