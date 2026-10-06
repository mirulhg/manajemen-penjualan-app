import { describe, expect, it } from 'vitest';

import { getYAxis, indexFromPointer, pointPercent, separateLabels, visibleLabelIndexes, yPercent } from './chart-scale';

describe('getYAxis', () => {
  it('mulai dari 0 dengan kisi di bilangan bulat yang rapi dan puncak ≥ nilai terbesar', () => {
    expect(getYAxis(5_524_500)).toEqual({ ticks: [0, 2_000_000, 4_000_000, 6_000_000], top: 6_000_000 });
    expect(getYAxis(29)).toEqual({ ticks: [0, 10, 20, 30], top: 30 });
    expect(getYAxis(3)).toEqual({ ticks: [0, 1, 2, 3], top: 3 });
  });

  it('semua nilai 0: sumbu tetap punya rentang', () => {
    expect(getYAxis(0)).toEqual({ ticks: [0, 1], top: 1 });
  });
});

describe('pointPercent dan indexFromPointer', () => {
  it('titik tersebar rata dari 0% sampai 100%; satu titik di tengah', () => {
    expect(pointPercent(0, 5)).toBe(0);
    expect(pointPercent(2, 5)).toBe(50);
    expect(pointPercent(4, 5)).toBe(100);
    expect(pointPercent(0, 1)).toBe(50);
  });

  it('pointer dipetakan ke titik terdekat (garis) atau pita (batang), dan dibatasi di ujung', () => {
    expect(indexFromPointer(0, 100, 5, 'point')).toBe(0);
    expect(indexFromPointer(49, 100, 5, 'point')).toBe(2);
    expect(indexFromPointer(500, 100, 5, 'point')).toBe(4);
    expect(indexFromPointer(26, 100, 4, 'band')).toBe(1);
    expect(indexFromPointer(100, 100, 4, 'band')).toBe(3);
    expect(indexFromPointer(-20, 100, 4, 'band')).toBe(0);
  });
});

describe('visibleLabelIndexes', () => {
  it('selang-seling sebanyak muat', () => {
    expect(visibleLabelIndexes(30, 4)).toEqual([0, 8, 16, 24]);
    expect(visibleLabelIndexes(3, 4)).toEqual([0, 1, 2]);
  });
});

describe('yPercent dan separateLabels', () => {
  it('nilai terbesar di atas (0%), nilai 0 di dasar (100%)', () => {
    expect(yPercent(6_000_000, 6_000_000)).toBe(0);
    expect(yPercent(0, 6_000_000)).toBe(100);
  });

  it('label yang rapat digeser ke bawah, yang sudah berjarak tetap', () => {
    expect(separateLabels([40, 80], 12)).toEqual([40, 80]);
    expect(separateLabels([100, 100], 12)).toEqual([100, 112]);
    expect(separateLabels([50, 45], 12)).toEqual([57, 45]);
  });
});
