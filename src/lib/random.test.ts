import { describe, expect, it } from 'vitest';
import { mulberry32 } from './random';

const draw = (seed: number, n: number) => {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, rand);
};

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    expect(draw(7, 20)).toEqual(draw(7, 20));
  });

  it('differs between seeds', () => {
    expect(draw(7, 5)).not.toEqual(draw(8, 5));
  });

  it('stays within [0, 1)', () => {
    for (const x of draw(123, 10_000)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});
