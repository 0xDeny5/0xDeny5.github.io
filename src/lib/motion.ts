/** Default ease-out for UI motion; same curve as the CSS `--ease` token. */
export const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Slow start, fast sweep: for full-screen reveals (mobile menu, theme switch). */
export const EASE_SWEEP = [0.7, 0, 0.2, 1] as const;

/** A bezier tuple as a CSS / Web Animations easing string. */
export function cubicBezier(curve: readonly number[]): string {
  return `cubic-bezier(${curve.join(', ')})`;
}
