import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setMediaMatches } from './test/setup';
import { currentTheme, setTheme, toggleTheme } from './theme';

const themeColor = () => document.querySelector('meta[name="theme-color"]')?.getAttribute('content');

describe('theme', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="theme-color" content="#f2efe8" />';
  });

  it('reads light unless the root says dark', () => {
    expect(currentTheme()).toBe('light');
    document.documentElement.dataset.theme = 'dark';
    expect(currentTheme()).toBe('dark');
  });

  it('applies the theme, the browser UI colour and remembers the choice', () => {
    setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(themeColor()).toBe('#0e0d0b');
    expect(localStorage.getItem('theme')).toBe('dark');

    setTheme('light');
    expect(themeColor()).toBe('#f2efe8');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggles between the two themes', () => {
    toggleTheme();
    expect(currentTheme()).toBe('dark');
    toggleTheme();
    expect(currentTheme()).toBe('light');
  });

  it('still switches when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(() => setTheme('dark')).not.toThrow();
    expect(currentTheme()).toBe('dark');
  });

  describe('with the View Transitions API', () => {
    const stubTransition = (ready: Promise<void>) => {
      const start = vi.fn((update: () => void) => {
        update();
        return { ready } as ViewTransition;
      });
      Object.defineProperty(document, 'startViewTransition', { value: start, configurable: true });
      return start;
    };

    afterEach(() => Reflect.deleteProperty(document, 'startViewTransition'));

    it('reveals the new theme as a circle growing from the origin', async () => {
      const start = stubTransition(Promise.resolve());
      // jsdom has no Web Animations API.
      const animate = vi.fn<Element['animate']>(() => ({}) as Animation);
      Object.defineProperty(document.documentElement, 'animate', { value: animate, configurable: true });

      setTheme('dark', { x: 100, y: 40 });

      expect(start).toHaveBeenCalledOnce();
      expect(currentTheme()).toBe('dark');
      await vi.waitFor(() => expect(animate).toHaveBeenCalledOnce());
      const [keyframes, options] = animate.mock.calls[0] ?? [];
      expect((keyframes as { clipPath: string[] }).clipPath[0]).toBe('circle(0px at 100px 40px)');
      expect(options).toMatchObject({ pseudoElement: '::view-transition-new(root)' });
    });

    it('swallows the rejection when a quick second toggle skips the transition', async () => {
      const skipped = Promise.reject(new DOMException('Transition was skipped', 'AbortError'));
      stubTransition(skipped);

      setTheme('dark');

      // An unhandled rejection here would fail the run; the theme must still be applied.
      await skipped.catch(() => {});
      expect(currentTheme()).toBe('dark');
    });

    it('swaps instantly for reduced motion', () => {
      const start = stubTransition(Promise.resolve());
      setMediaMatches((q) => q.includes('reduce'));
      setTheme('dark');
      expect(start).not.toHaveBeenCalled();
      expect(currentTheme()).toBe('dark');
    });
  });

  it('suppresses CSS transitions only for the duration of the swap', async () => {
    setTheme('dark');
    expect(document.documentElement.classList.contains('theme-switching')).toBe(true);
    await vi.waitFor(() => expect(document.documentElement.classList.contains('theme-switching')).toBe(false));
  });
});
