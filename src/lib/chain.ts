// The page as a tiny blockchain: every section is a "block" that carries the hash of the one before.
// Purely decorative, but deterministic so server and client render the same hashes.
import { sections } from '../content';
import { pad } from './format';

/** Block payloads in page order; height 0 is the hero ("genesis"). */
const BLOCKS = ['genesis', ...sections.map((s) => s.label)];

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
/** Second seed, so two 32-bit hashes concatenate into a 64-bit-looking one. */
const ALT_SEED = 0x2f1d3a7b;
const GENESIS_PREV = '0'.repeat(16);

/** FNV-1a, 32-bit. */
export function fnv1a(input: string, seed = FNV_OFFSET): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

const hex8 = (n: number) => n.toString(16).padStart(8, '0');

/** Full 16-hex-digit hash of the block at `height`; it commits to every block before it. */
export function blockHash(height: number): string {
  let hash = GENESIS_PREV;
  for (let i = 0; i <= height; i++) {
    const payload = `${hash}:${i}:${BLOCKS[i] ?? ''}`;
    hash = hex8(fnv1a(payload)) + hex8(fnv1a(payload, ALT_SEED));
  }
  return hash;
}

const shorten = (hash: string) => `0x${hash.slice(0, 4)}…${hash.slice(-4)}`;

export interface BlockMeta {
  height: string;
  hash: string;
  prev: string;
}

export function blockMeta(height: number): BlockMeta {
  return {
    height: pad(height),
    hash: shorten(blockHash(height)),
    prev: shorten(blockHash(height - 1)),
  };
}
