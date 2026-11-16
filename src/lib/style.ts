import type { CSSProperties } from 'react';

/**
 * Joins truthy class names: `cx('a', on && 'is-on')` → `"a is-on"` or `"a"`.
 * Returns `undefined` when nothing is left, so React omits the attribute.
 */
export function cx(...names: (string | false | null | undefined)[]): string | undefined {
  return names.filter(Boolean).join(' ') || undefined;
}

/** Typed inline CSS custom properties, e.g. `style={cssVars({ '--i': 2 })}`. */
export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return vars as CSSProperties;
}
