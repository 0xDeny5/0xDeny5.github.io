import { describe, expect, it } from 'vitest';
import { resolveShortcut } from './shortcuts';

const press = (key: string, init: Partial<Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'altKey'>> = {}, target: EventTarget = document.body) =>
  resolveShortcut({ key, metaKey: false, ctrlKey: false, altKey: false, target, ...init });

describe('resolveShortcut', () => {
  it('toggles the palette with ⌘K or Ctrl+K, even while typing', () => {
    const input = document.createElement('input');
    expect(press('k', { metaKey: true })).toBe('toggle-palette');
    expect(press('K', { ctrlKey: true })).toBe('toggle-palette');
    expect(press('k', { ctrlKey: true }, input)).toBe('toggle-palette');
  });

  it('opens the palette with "/" and toggles the theme with "t"', () => {
    expect(press('/')).toBe('open-palette');
    expect(press('t')).toBe('toggle-theme');
    expect(press('T')).toBe('toggle-theme');
  });

  it('ignores single-key shortcuts while typing in a field', () => {
    expect(press('/', {}, document.createElement('input'))).toBeNull();
    expect(press('t', {}, document.createElement('textarea'))).toBeNull();
  });

  it('ignores single-key shortcuts with a modifier held', () => {
    expect(press('t', { metaKey: true })).toBeNull();
    expect(press('t', { ctrlKey: true })).toBeNull();
    expect(press('t', { altKey: true })).toBeNull();
    expect(press('/', { ctrlKey: true })).toBeNull();
  });

  it('ignores other keys', () => {
    expect(press('a')).toBeNull();
    expect(press('Escape')).toBeNull();
  });
});
