import { describe, expect, it } from 'vitest';

import { createBezierEasing, parseCubicBezier } from './cubic-bezier';

describe('parseCubicBezier', () => {
  it('membaca token --ease-out dan menolak teks lain', () => {
    expect(parseCubicBezier('cubic-bezier(0.23, 1, 0.32, 1)')).toEqual([0.23, 1, 0.32, 1]);
    expect(parseCubicBezier(' cubic-bezier(0.32,0.72,0,1) ')).toEqual([0.32, 0.72, 0, 1]);
    expect(parseCubicBezier('ease-out')).toBeNull();
    expect(parseCubicBezier('')).toBeNull();
  });
});

describe('createBezierEasing', () => {
  const easeOut = createBezierEasing([0.23, 1, 0.32, 1]);

  it('mulai di 0, berakhir di 1, dan di luar rentang dijepit', () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(-1)).toBe(0);
    expect(easeOut(2)).toBe(1);
  });

  it('ease-out: cepat di awal, melambat di akhir, dan selalu naik', () => {
    // Lebih dari separuh jarak sudah ditempuh pada seperempat waktu.
    expect(easeOut(0.25)).toBeGreaterThan(0.6);
    const samples = [0.1, 0.2, 0.4, 0.6, 0.8, 0.95].map(easeOut);
    expect([...samples].sort((a, b) => a - b)).toEqual(samples);
    expect(easeOut(0.95)).toBeGreaterThan(0.99);
  });

  it('kurva linear (0,0,1,1) menghasilkan progres = waktu', () => {
    const linear = createBezierEasing([0, 0, 1, 1]);
    expect(linear(0.5)).toBeCloseTo(0.5, 5);
  });
});
