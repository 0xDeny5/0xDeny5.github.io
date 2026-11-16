import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent, type RefObject } from 'react';

/**
 * Media query as state. The server (and hydration) always sees `serverValue`, then the
 * client switches to the real answer — so prerendered HTML never mismatches.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * Steps 0 → length-1 on a timer while `active`, holds on the last step, then loops.
 * Starts (and stays, for reduced motion) on the last step, so static renders show the finished state.
 */
export function useLoop(length: number, active: boolean, stepMs: number, holdMs: number): number {
  const [step, setStep] = useState(length - 1);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    let i = -1;
    let timer: number;
    const tick = () => {
      i = (i + 1) % length;
      setStep(i);
      timer = window.setTimeout(tick, i === length - 1 ? holdMs : stepMs);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [length, active, stepMs, holdMs]);

  return step;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Feeds the pointer position to the `.spotlight` CSS gradient. */
export function trackPointer(e: PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

/**
 * Adds `.is-visible` to every `[data-reveal]` element once it scrolls into view — including
 * elements mounted later (e.g. inline visuals that appear when the window narrows), which a
 * one-off query at mount would miss and leave hidden forever.
 * The hidden state only applies under `html.js`, so prerendered HTML stays readable without JS.
 */
export function useRevealOnScroll(): void {
  useEffect(() => {
    document.documentElement.classList.add('js');

    const collect = (root: ParentNode): HTMLElement[] => {
      const found = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'));
      if (root instanceof HTMLElement && root.matches('[data-reveal]:not(.is-visible)')) found.push(root);
      return found;
    };

    const reduced = prefersReducedMotion() || !('IntersectionObserver' in window);
    const observer = reduced
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer?.unobserve(entry.target);
              }
            }
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
        );

    const track = (els: HTMLElement[]) =>
      els.forEach((el) => (observer ? observer.observe(el) : el.classList.add('is-visible')));

    track(collect(document));

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) track(collect(node));
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, []);
}

/** Returns the id of the section currently in the reading zone of the viewport. */
export function useActiveSection(ids: readonly string[], rootMargin = '-40% 0px -55% 0px'): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return active;
}

export function useScrolled(offset = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return scrolled;
}

/** Wall-clock time in a given IANA zone, updated every 15 s. Null until mounted (SSR-safe). */
export function useLocalTime(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return time;
}

// Module-level defaults: they are effect dependencies, so they must keep a stable identity.
const HEX_GLYPHS = '0123456789abcdef';
const NON_SPACE = /\S/;

interface ScrambleOptions {
  duration?: number;
  /** Characters to cycle through while scrambling. */
  glyphs?: string;
  /** Only characters matching this are scrambled; others (×, %, −) stay put. */
  only?: RegExp;
}

/**
 * "Decrypts" text when the element enters the viewport: characters cycle through glyphs
 * and settle left to right. Renders the final text on the server and without JS.
 */
export function useScramble<T extends HTMLElement>(
  text: string,
  { duration = 900, glyphs = HEX_GLYPHS, only = NON_SPACE }: ScrambleOptions = {},
): [RefObject<T | null>, string] {
  const ref = useRef<T>(null);
  const [output, setOutput] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const settled = Math.floor(p * text.length);
          let next = text.slice(0, settled);
          for (let i = settled; i < text.length; i++) {
            const ch = text[i] ?? '';
            next += only.test(ch) ? glyphs[Math.floor(Math.random() * glyphs.length)] : ch;
          }
          setOutput(next);
          if (p < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text, duration, glyphs, only]);

  return [ref, output];
}

/** Pulls an element slightly toward the pointer while hovered. */
export function useMagnetic<T extends HTMLElement>(strength = 0.25): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return;

    const onMove = (e: globalThis.PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return ref;
}

/** True once the element has been at least `amount` visible. Stays true. */
export function useSeen<T extends HTMLElement>(amount = 0.3): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: amount },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return [ref, seen];
}
