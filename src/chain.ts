// The page as a tiny blockchain: every section is a "block" that carries the hash of the one before.
// Purely decorative, but deterministic so server and client render the same hashes.

/** Section labels in page order; index 0 is the hero ("genesis"). */
const BLOCKS = ['genesis', 'Capabilities', 'Guarantees', 'Approach', 'Toolbox', 'Contact'];

/** FNV-1a, 32-bit. */
function fnv1a(input: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const hex8 = (n: number) => n.toString(16).padStart(8, '0');

/** A 64-bit-looking hash of a block that also commits to its predecessor, like a real chain. */
function blockHash(height: number): string {
  let prev = '0'.repeat(16);
  let hash = prev;
  for (let i = 0; i <= height; i++) {
    const payload = `${prev}:${i}:${BLOCKS[i] ?? ''}`;
    hash = hex8(fnv1a(payload, 0x811c9dc5)) + hex8(fnv1a(payload, 0x2f1d3a7b));
    prev = hash;
  }
  return hash;
}

const short = (h: string) => `0x${h.slice(0, 4)}…${h.slice(-4)}`;

export function blockMeta(height: number): { height: string; hash: string; prev: string } {
  return {
    height: String(height).padStart(2, '0'),
    hash: short(blockHash(height)),
    prev: short(blockHash(height - 1)),
  };
}
