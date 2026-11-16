import { describe, expect, it } from 'vitest';
import { cssVars, cx } from './style';

describe('cx', () => {
  it('joins only truthy class names', () => {
    expect(cx('a', false, 'b', null, undefined, '')).toBe('a b');
  });

  it('returns undefined when nothing is left, so React drops the attribute', () => {
    expect(cx(false, null, undefined)).toBeUndefined();
  });
});

describe('cssVars', () => {
  it('passes custom properties through unchanged', () => {
    expect(cssVars({ '--i': 2, '--step-ms': '4600ms' })).toEqual({ '--i': 2, '--step-ms': '4600ms' });
  });
});
