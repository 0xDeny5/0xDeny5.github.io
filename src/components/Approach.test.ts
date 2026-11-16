import { describe, expect, it } from 'vitest';
import { reachedStep } from './Approach';

describe('reachedStep', () => {
  const STEPS = 5;

  it('is -1 before the line starts moving', () => {
    expect(reachedStep(-0.01, STEPS)).toBe(-1);
  });

  it('lights the first step at the start and the last at the end', () => {
    expect(reachedStep(0, STEPS)).toBe(0);
    expect(reachedStep(1, STEPS)).toBe(STEPS - 1);
  });

  it('lights a step just before the line fully reaches it', () => {
    // Step 1 sits at p = 0.25; it lights from p = 0.245.
    expect(reachedStep(0.24, STEPS)).toBe(0);
    expect(reachedStep(0.246, STEPS)).toBe(1);
  });

  it('never runs past the last step when the spring overshoots', () => {
    expect(reachedStep(1.2, STEPS)).toBe(STEPS - 1);
  });
});
