import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom lacks a few browser APIs the site touches. These stand-ins only need to exist: observers
// never fire, and media queries answer whatever a test sets with `setMediaMatches`.

class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

let mediaMatches: (query: string) => boolean = () => false;

/** Makes `window.matchMedia(query).matches` return `matcher(query)` until the test ends. */
export function setMediaMatches(matcher: (query: string) => boolean): void {
  mediaMatches = matcher;
}

window.matchMedia = (query: string) =>
  ({
    matches: mediaMatches(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

window.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
window.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  cleanup();
  mediaMatches = () => false;
  document.body.style.overflow = '';
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});
