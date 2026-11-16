export type Theme = 'light' | 'dark';

const KEY = 'theme';

export interface Origin {
  x: number;
  y: number;
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e0d0b' : '#f2efe8');
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this visit */
  }
}

/**
 * Switches theme. Where the View Transitions API exists, the new theme spreads as a circle from
 * `origin` (the toggle button); otherwise it swaps instantly. CSS transitions are suppressed during
 * the swap so colours don't smear.
 */
export function setTheme(theme: Theme, origin?: Origin): void {
  const root = document.documentElement;
  const swap = () => {
    root.classList.add('theme-switching');
    apply(theme);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) {
    swap();
    return;
  }

  const { x, y } = origin ?? { x: window.innerWidth - 60, y: 36 };
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(swap);
  void transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

export function toggleTheme(origin?: Origin): void {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark', origin);
}
