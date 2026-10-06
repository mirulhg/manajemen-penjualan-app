// @vitest-environment jsdom
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test/render';
import { setReducedMotion } from '../../../test/viewport';
import { formatRupiah } from '../../../utils/format-rupiah';
import { CountUpValue } from './CountUpValue';

const FINAL = 1_075_500;
const FRAME_MS = 16;
const DURATION_MS = 700;

function renderValue(animate: boolean, value = FINAL) {
  return renderWithProviders(<CountUpValue value={value} format={formatRupiah} animate={animate} />);
}

describe('CountUpValue', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] });
  });

  afterEach(() => {
    setReducedMotion(true);
    vi.useRealTimers();
  });

  it('animate = true: mulai dari Rp 0, berhitung naik, lalu berhenti di nilai akhir dalam 700ms', () => {
    setReducedMotion(false);
    renderValue(true);

    const counting = document.querySelector('[aria-hidden="true"]');
    expect(counting?.textContent).toBe('Rp 0');
    // Pembaca layar langsung mendapat nilai akhir, bukan angka antara.
    expect(screen.getByText(formatRupiah(FINAL)).className).toContain('sr-only');

    act(() => {
      vi.advanceTimersByTime(FRAME_MS * 4);
    });
    const midway = Number((document.querySelector('[aria-hidden="true"]')?.textContent ?? '').replace(/\D/g, ''));
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(FINAL);

    act(() => {
      vi.advanceTimersByTime(DURATION_MS);
    });
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByText(formatRupiah(FINAL))).toBeTruthy();
  });

  it('animate = false: angka langsung tampil tanpa hitung naik', () => {
    setReducedMotion(false);
    renderValue(false);

    expect(screen.getByText(formatRupiah(FINAL))).toBeTruthy();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('prefers-reduced-motion: angka langsung tampil walau animate = true', () => {
    setReducedMotion(true);
    renderValue(true);

    expect(screen.getByText(formatRupiah(FINAL))).toBeTruthy();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('sesudah selesai, nilai yang berubah (periode lain) tampil langsung dan tidak memutar ulang', () => {
    setReducedMotion(false);
    const view = renderValue(true);
    act(() => {
      vi.advanceTimersByTime(DURATION_MS + FRAME_MS * 2);
    });

    view.rerender(<CountUpValue value={500_000} format={formatRupiah} animate />);

    expect(screen.getByText('Rp 500.000')).toBeTruthy();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
