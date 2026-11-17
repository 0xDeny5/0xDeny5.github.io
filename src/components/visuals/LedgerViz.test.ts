import { describe, expect, it } from 'vitest';
import { RACE_STEPS, raceAt } from './LedgerViz';

const steps = Array.from({ length: RACE_STEPS }, (_, i) => raceAt(i));

describe('raceAt', () => {
  it('starts with €100 and both withdrawals ready', () => {
    expect(steps[0]).toMatchObject({ balance: 100, a: 'idle', b: 'idle', lockedBy: null, done: false });
  });

  it('never lets the balance go negative', () => {
    for (const s of steps) expect(s.balance).toBeGreaterThanOrEqual(0);
  });

  it('debits exactly one withdrawal and rejects the other', () => {
    const last = steps.at(-1);
    expect(last).toMatchObject({ a: 'debited', b: 'rejected', balance: 20, done: true, lockedBy: null });
    expect([last?.a, last?.b].filter((s) => s === 'debited')).toHaveLength(1);
  });

  it('makes B wait while A holds the lock, then rejects it on a fresh balance', () => {
    const lockedByA = steps.find((s) => s.lockedBy === 'A');
    expect(lockedByA).toMatchObject({ a: 'debited', b: 'waiting', balance: 20 });
    const rejected = steps.find((s) => s.b === 'rejected');
    expect(rejected?.guard).toContain('0 rows');
  });

  it('clamps out-of-range steps', () => {
    expect(raceAt(-5)).toBe(steps[0]);
    expect(raceAt(99)).toBe(steps.at(-1));
  });

  it('explains every step in words', () => {
    for (const s of steps) expect(s.caption.length).toBeGreaterThan(30);
  });
});
