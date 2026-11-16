import { describe, expect, it } from 'vitest';
import { COMMANDS } from './commands';
import { capabilities, sections } from './content';
import { render } from './entry-server';

// The production page is this server render (scripts/prerender.js), hydrated in the browser.
const html = render();
const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');
const ids = Array.from(doc.querySelectorAll('[id]'), (el) => el.id);

describe('prerendered page', () => {
  it('renders the same HTML every time, so hydration never mismatches', () => {
    expect(render()).toBe(html);
  });

  it('has the headline and every section, in order', () => {
    expect(doc.querySelector('h1')?.getAttribute('aria-label')).toBe('I build the backends that move money.');
    const sectionIds = Array.from(doc.querySelectorAll('main > section[id]'), (el) => el.id);
    expect(sectionIds).toEqual(['top', ...sections.map((s) => s.id)]);
  });

  it('numbers sections and chains their block hashes', () => {
    const heads = Array.from(doc.querySelectorAll('.shead'));
    expect(heads.map((h) => h.querySelector('.shead__index')?.textContent)).toEqual(['01', '02', '03', '04', '05']);

    const hashes = heads.map((h) => h.querySelector('.shead__hash')?.textContent?.replace('hash ', ''));
    const prevs = heads.map((h) => h.querySelector('.shead__prev')?.textContent?.replace('prev ', ''));
    expect(prevs.slice(1)).toEqual(hashes.slice(0, -1));
  });

  it('labels every section by its own heading', () => {
    for (const section of doc.querySelectorAll('section[aria-labelledby]')) {
      const heading = doc.getElementById(section.getAttribute('aria-labelledby') ?? '');
      expect(heading?.textContent?.trim()).toBeTruthy();
    }
  });

  it('has unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('points every in-page link at an existing element', () => {
    const anchors = Array.from(doc.querySelectorAll('a[href^="#"]'), (a) => a.getAttribute('href')?.slice(1) ?? '');
    expect(anchors.length).toBeGreaterThan(0);
    for (const target of anchors) expect(ids).toContain(target);
  });

  it('has a target for every navigation command in the palette', () => {
    for (const cmd of COMMANDS.filter((c) => c.group === 'Navigate')) expect(ids).toContain(cmd.id);
  });

  it('shows every capability with its proof, inline visuals and all', () => {
    const caps = doc.querySelectorAll('.cap');
    expect(caps).toHaveLength(capabilities.length);
    // The server can't know the viewport width, so it renders the narrow layout with inline visuals.
    expect(doc.querySelectorAll('.cap__visual-inline .viz')).toHaveLength(capabilities.length);
    for (const [i, cap] of capabilities.entries()) {
      expect(caps[i]?.querySelector('.cap__figure .sr-only')?.textContent).toBe(cap.proof.figure);
    }
  });

  it('gives every live visual a text alternative', () => {
    for (const viz of doc.querySelectorAll('.viz')) {
      expect(viz.getAttribute('role')).toBe('img');
      expect(viz.getAttribute('aria-label')?.length).toBeGreaterThan(20);
    }
  });

  it('opens external links in a new tab without an opener', () => {
    for (const a of doc.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });
});
