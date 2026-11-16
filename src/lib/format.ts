/** Zero-padded number for indexes and counters: `pad(3)` → `"03"`, `pad(7, 4)` → `"0007"`. */
export function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

const AMOUNT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COUNT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Money-style amount: grouped, exactly two decimals. `4182.3` → `"4,182.30"`. */
export function formatAmount(n: number): string {
  return AMOUNT.format(n);
}

/** Whole number with grouping. `2875` → `"2,875"`. */
export function formatCount(n: number): string {
  return COUNT.format(n);
}
