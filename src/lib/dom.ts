import type { PointerEvent as ReactPointerEvent } from 'react';

export interface Point {
  x: number;
  y: number;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Centre of an element in viewport coordinates. */
export function elementCenter(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Feeds the pointer position to the `.spotlight` CSS gradient. */
export function trackPointer(e: ReactPointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

/** True when a key press belongs to a text field rather than to page-level shortcuts. */
export function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function scrollToId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/** Copies text to the clipboard. Resolves `false` when the Clipboard API is missing or denied. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Whether a popup should open above its anchor: only when it doesn't fit below and there is more
 * room above than below (otherwise it would just be clipped at the top instead).
 */
export function shouldOpenAbove(anchor: Pick<DOMRect, 'top' | 'bottom'>, viewportHeight: number, popupHeight: number): boolean {
  const spaceBelow = viewportHeight - anchor.bottom;
  return spaceBelow < popupHeight && anchor.top > spaceBelow;
}
