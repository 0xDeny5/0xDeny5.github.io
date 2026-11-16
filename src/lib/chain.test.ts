import { describe, expect, it } from 'vitest';
import { sections } from '../content';
import { blockHash, blockMeta, fnv1a } from './chain';

describe('fnv1a', () => {
  it('matches the published FNV-1a 32-bit test vectors', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
    expect(fnv1a('foobar')).toBe(0xbf9cf968);
  });

  it('changes with the seed', () => {
    expect(fnv1a('foobar', 0x2f1d3a7b)).not.toBe(fnv1a('foobar'));
  });
});

describe('blockHash', () => {
  it('is 16 hex digits, and the block before genesis is all zeros', () => {
    expect(blockHash(-1)).toBe('0'.repeat(16));
    for (let h = 0; h <= sections.length; h++) expect(blockHash(h)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('gives every block a distinct hash', () => {
    const hashes = Array.from({ length: sections.length + 1 }, (_, h) => blockHash(h));
    expect(new Set(hashes).size).toBe(hashes.length);
  });
});

describe('blockMeta', () => {
  it('chains each section to the previous one', () => {
    for (let h = 1; h <= sections.length; h++) {
      expect(blockMeta(h).prev).toBe(blockMeta(h - 1).hash);
    }
  });

  it('keeps the hashes the site has always shown', () => {
    // Recorded from the production page before the refactor: the visible chain must not change.
    expect(Array.from({ length: 5 }, (_, i) => blockMeta(i + 1))).toEqual([
      { height: '01', prev: '0x6f5d…ecf5', hash: '0x897b…38c1' },
      { height: '02', prev: '0x897b…38c1', hash: '0xa996…284f' },
      { height: '03', prev: '0xa996…284f', hash: '0x5166…129e' },
      { height: '04', prev: '0x5166…129e', hash: '0x32c2…9ec6' },
      { height: '05', prev: '0x32c2…9ec6', hash: '0x44b3…396c' },
    ]);
  });
});
