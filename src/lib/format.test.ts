import { describe, expect, it } from 'vitest';
import { formatAmount, formatCount, pad } from './format';

describe('pad', () => {
  it('pads to two digits by default', () => {
    expect(pad(3)).toBe('03');
    expect(pad(12)).toBe('12');
  });

  it('pads to a custom width and never truncates', () => {
    expect(pad(7, 4)).toBe('0007');
    expect(pad(12345, 4)).toBe('12345');
  });
});

describe('formatAmount', () => {
  it('always shows two decimals with thousands separators', () => {
    expect(formatAmount(4182.3)).toBe('4,182.30');
    expect(formatAmount(1.5)).toBe('1.50');
    expect(formatAmount(0)).toBe('0.00');
    expect(formatAmount(1204551.2)).toBe('1,204,551.20');
  });

  it('rounds to cents', () => {
    expect(formatAmount(4180.125)).toMatch(/^4,180\.1[23]$/);
    expect(formatAmount(2.999)).toBe('3.00');
  });
});

describe('formatCount', () => {
  it('groups whole numbers', () => {
    expect(formatCount(2875)).toBe('2,875');
    expect(formatCount(950)).toBe('950');
  });
});
