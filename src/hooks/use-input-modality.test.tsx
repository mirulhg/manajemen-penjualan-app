// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { INDICATOR_TRANSITION, INSTANT_TRANSITION } from '@/lib/motion';
import { markKeyboardInput, useIndicatorTransition, useInputModality } from './use-input-modality';

function press(type: 'keydown' | 'pointerdown') {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
}

describe('modalitas input', () => {
  afterEach(() => {
    cleanup();
    press('pointerdown');
  });

  it('keyboard terakhir = keyboard, pointer terakhir = pointer', () => {
    const { result } = renderHook(() => useInputModality());

    press('keydown');
    expect(result.current).toBe('keyboard');
    press('pointerdown');
    expect(result.current).toBe('pointer');
  });

  it('indikator berpindah seketika untuk keyboard dan dengan spring untuk ketukan', () => {
    const { result } = renderHook(() => useIndicatorTransition());
    expect(result.current).toBe(INDICATOR_TRANSITION);

    press('keydown');
    expect(result.current).toBe(INSTANT_TRANSITION);
  });

  it('markKeyboardInput (navigasi dari palette) dianggap keyboard walau item diklik', () => {
    const { result } = renderHook(() => useInputModality());

    press('pointerdown');
    act(() => markKeyboardInput());

    expect(result.current).toBe('keyboard');
  });
});
