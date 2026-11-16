import { prefersReducedMotion, type Point } from './lib/dom';
import { EASE_SWEEP, cubicBezier } from './lib/motion';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/** Browser UI colour per theme; matches `--paper` in styles.css and the inline script in index.html. */
const THEME_COLOR: Record<Theme, string> = { light: '#f2efe8', dark: '#0e0d0b' };

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this visit */
  }
}

/**
 * Switches theme. Where the View Transitions API exists, the new theme spreads as a circle from
 * `origin` (the toggle button); otherwise it swaps instantly. CSS transitions are suppressed during
 * the swap so colours don't smear.
 */
export function setTheme(theme: Theme, origin?: Point): void {
  const root = document.documentElement;
  const swap = () => {
    root.classList.add('theme-switching');
    apply(theme);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  };

  if (!document.startViewTransition || prefersReducedMotion()) {
    swap();
    return;
  }

  // Keyboard toggles have no button to grow from: default to where the toggle sits in the nav.
  const { x, y } = origin ?? { x: window.innerWidth - 60, y: 36 };
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(swap);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: cubicBezier(EASE_SWEEP), pseudoElement: '::view-transition-new(root)' },
      );
    })
    // Rejects when a newer switch skips this one (a quick double toggle); the theme is still applied.
    .catch(() => {});
}

export function toggleTheme(origin?: Point): void {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark', origin);
}
